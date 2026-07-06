import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import { testMySQL, loadFromMySQL, syncStateToMySQL, isMySQLAvailable, getMySQLUserCount } from "./db";
import authRoutes from "./routes/authRoutes";
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendInstructorApprovalEmail,
  sendContactAckEmail,
  sendInviteEmail,
} from "./lib/mailer";

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = "dma_token";
const isProd = process.env.NODE_ENV === "production";
const STATE_FILE = path.join(process.cwd(), "db_state.json");
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

if (!JWT_SECRET) {
  console.error("[FATAL] JWT_SECRET is required");
  process.exit(1);
}

// ─── State Management ───────────────────────────────────────────────────────────

interface AppState {
  users: any[];
  courses: any[];
  enrollments: any[];
  subscriptions: any[];
  certificates: any[];
  logs: any[];
  learningPaths: any[];
  events: any[];
  messages: any[];
  assignmentSubmissions: any[];
  withdrawalRequests: any[];
  bankAccounts: any[];
  cmsContent: any;
  customRoles: any[];
  mediaLibrary: any[];
  invites: any[];
  themeSettings: any;
  webinarPosts: any[];
  quizAttempts: any[];
  exams: any[];
  examAttempts: any[];
  certTemplates: any[];
  certDownloadHistory: any[];
}

let state: AppState = {
  users: [], courses: [], enrollments: [], subscriptions: [],
  certificates: [], logs: [], learningPaths: [], events: [],
  messages: [], assignmentSubmissions: [], withdrawalRequests: [],
  bankAccounts: [], cmsContent: null, customRoles: [], mediaLibrary: [],
  invites: [], themeSettings: null, webinarPosts: [],
  quizAttempts: [], exams: [], examAttempts: [],
  certTemplates: [], certDownloadHistory: [],
};

function saveState(): void {
  try { fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2)); } catch {}
  if (isMySQLAvailable()) {
    syncStateToMySQL(state).catch(() => {});
  }
}

function addLog(text: string, type = "general", userId?: string): void {
  state.logs.unshift({ id: `log_${Date.now()}`, text, type, userId: userId || null, time: new Date().toISOString() });
  if (state.logs.length > 500) state.logs = state.logs.slice(0, 500);
  saveState();
}

async function initializeState(): Promise<void> {
  // Always load db_state.json first as the baseline / fallback
  if (fs.existsSync(STATE_FILE)) {
    try {
      const raw = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
      state = { ...state, ...raw };
    } catch {
      console.error("[DMA] Could not parse db_state.json, using defaults");
    }
  }

  // Try MySQL — if reachable, use it as the authoritative store
  const mysqlOk = await testMySQL();
  if (mysqlOk) {
    const userCount = await getMySQLUserCount();
    if (userCount === 0) {
      // First deployment: migrate everything from db_state.json → MySQL
      console.log("[MySQL] Empty database detected — migrating from db_state.json…");
      await syncStateToMySQL(state);
      console.log(`[MySQL] Migration complete — ${state.users.length} users, ${state.courses.length} courses written.`);
    }
    // Load canonical state from MySQL (replaces the JSON baseline)
    const mysqlState = await loadFromMySQL();
    if (mysqlState) {
      state = { ...state, ...mysqlState };
      console.log(`[MySQL] State loaded: ${state.users.length} users, ${state.courses.length} courses`);
    }
  }

  if (!Array.isArray(state.users)) state.users = [];
  if (!Array.isArray(state.courses)) state.courses = [];
  if (!Array.isArray(state.enrollments)) state.enrollments = [];
  if (!Array.isArray(state.logs)) state.logs = [];
  if (!Array.isArray(state.learningPaths)) state.learningPaths = [];
  if (!Array.isArray(state.events)) state.events = [];
  if (!Array.isArray(state.messages)) state.messages = [];
  if (!Array.isArray(state.assignmentSubmissions)) state.assignmentSubmissions = [];
  if (!Array.isArray(state.withdrawalRequests)) state.withdrawalRequests = [];
  if (!Array.isArray(state.bankAccounts)) state.bankAccounts = [];
  if (!Array.isArray(state.customRoles)) state.customRoles = [];
  if (!Array.isArray(state.mediaLibrary)) state.mediaLibrary = [];
  if (!Array.isArray(state.invites)) state.invites = [];
  if (!Array.isArray(state.webinarPosts)) state.webinarPosts = [];
  if (!Array.isArray(state.quizAttempts)) state.quizAttempts = [];
  if (!Array.isArray(state.exams)) state.exams = [];
  if (!Array.isArray(state.examAttempts)) state.examAttempts = [];
  if (!Array.isArray(state.certTemplates)) state.certTemplates = [];
  if (!Array.isArray(state.certDownloadHistory)) state.certDownloadHistory = [];
  if (state.certTemplates.length === 0) {
    state.certTemplates = [
      { id: "tmpl_default", name: "Standard Completion Certificate", style: "classic", primaryColor: "#0066ff", accentColor: "#00aaff", headerText: "Digital Manufacturing Academy", footerText: "AIUB–BCU British Council Partnership", signatureLabel: "Programme Director", logoEnabled: true, badgeEnabled: true, isDefault: true, createdAt: new Date().toISOString() },
      { id: "tmpl_distinction", name: "Distinction Certificate", style: "premium", primaryColor: "#7c3aed", accentColor: "#a78bfa", headerText: "Digital Manufacturing Academy — With Distinction", footerText: "AIUB–BCU British Council Partnership", signatureLabel: "Programme Director", logoEnabled: true, badgeEnabled: true, isDefault: false, createdAt: new Date().toISOString() },
    ];
  }
  if (state.webinarPosts.length === 0) {
    const now = new Date().toISOString();
    state.webinarPosts = [
      {
        id: `wp_seed_1`,
        title: "Welcome to DMA Academy Platform!",
        content: "We are thrilled to announce the official launch of the Digital Manufacturing Academy learning portal — a joint initiative between AIUB and Birmingham City University, funded by the British Council.",
        type: "announcement",
        authorId: "system",
        authorName: "DMA Academy Team",
        authorRole: "super_admin",
        tags: ["welcome", "launch", "industry-4.0"],
        createdAt: now,
        pinned: true,
        views: 0,
      },
      {
        id: `wp_seed_2`,
        title: "Upcoming Live Webinar: Introduction to Digital Twins",
        content: "Join us for an exclusive live session with Dr. Majid Butt from Birmingham City University. We'll cover the fundamentals of Digital Twin technology, real-world deployment scenarios, and how it powers Industry 4.0.",
        type: "webinar",
        authorId: "system",
        authorName: "DMA Academy Team",
        authorRole: "admin",
        scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        meetLink: "https://meet.google.com/dma-webinar-001",
        tags: ["digital-twin", "live-session", "bcit"],
        createdAt: now,
        pinned: false,
        views: 0,
      },
      {
        id: `wp_seed_3`,
        title: "New Course Released: Smart Factory & Cyber-Physical Systems",
        content: "We've just published a brand-new course module covering MQTT network brokers, sensory casing telemetry, and edge computing fundamentals for smart factory environments.",
        type: "release",
        authorId: "system",
        authorName: "Digital Mfg Admin",
        authorRole: "admin",
        tags: ["new-course", "smart-factory", "iot"],
        createdAt: now,
        pinned: false,
        views: 0,
      },
    ];
  }

  const SUPER_ADMIN_EMAIL = "pandoratecllc@gmail.com";
  const ADMIN_EMAIL = "digitalmfg.2026@gmail.com";
  const DEFAULT_PW = "Dmamfg.2026";

  async function ensureUser(email: string, name: string, role: string): Promise<void> {
    const exists = state.users.find((u: any) => u.email === email);
    if (!exists) {
      const hashed = await bcrypt.hash(DEFAULT_PW, 10);
      state.users.unshift({
        id: `u_${role}_${Date.now()}`, name, email, role,
        password: hashed, isApproved: true, suspended: false,
        subscriptionPlan: "premium", avatar: "", joinedAt: new Date().toISOString(),
        customRoleId: null,
      });
    } else if (!exists.password) {
      exists.password = await bcrypt.hash(DEFAULT_PW, 10);
      exists.isApproved = true;
      exists.suspended = false;
    }
  }

  await ensureUser(SUPER_ADMIN_EMAIL, "Pandora Tech (Super Admin)", "super_admin");
  await ensureUser(ADMIN_EMAIL, "Digital Mfg Admin", "admin");

  for (const u of state.users) {
    if (u.isApproved === undefined) u.isApproved = true;
    if (u.suspended === undefined) u.suspended = false;
  }

  const c101 = state.courses.find((c: any) => c.id === "c_101");
  if (c101) { c101.isFree = true; c101.price = 0; }

  if (!state.cmsContent) {
    state.cmsContent = { pages: [] };
  }

  saveState();
  console.log(`[DMA] State loaded: ${state.users.length} users, ${state.courses.length} courses`);
}

// ─── Auth Helpers ──────────────────────────────────────────────────────────────

function issueToken(res: Response, payload: object): string {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true, secure: isProd, sameSite: isProd ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, path: "/",
  });
  return token;
}

function getSession(req: Request): { userId: string; email: string; role: string } | null {
  const raw = req.cookies?.[COOKIE_NAME] || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : null);
  if (!raw) return null;
  try { const d = jwt.verify(raw, JWT_SECRET) as any; return { userId: d.id, email: d.email, role: d.role }; }
  catch { return null; }
}

function requireSession(req: Request, res: Response): { userId: string; email: string; role: string } | null {
  const s = getSession(req);
  if (!s) { res.status(401).json({ error: "Authentication required" }); return null; }
  return s;
}

function requireAdmin(req: Request, res: Response): { userId: string; email: string; role: string } | null {
  const s = getSession(req);
  if (!s) { res.status(401).json({ error: "Authentication required" }); return null; }
  if (s.role !== "admin" && s.role !== "super_admin") { res.status(403).json({ error: "Admin access required" }); return null; }
  return s;
}

function safeUser(u: any) {
  const { password: _pw, ...rest } = u;
  return rest;
}

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// ─── Mount New JWT Auth Routes ────────────────────────────────────────────────────
// These are the new MySQL + JWT-based routes (independent of db_state)
app.use("/auth", authRoutes);

// ─── Legacy Auth Routes (kept for backward compatibility) ─────────────────────────
