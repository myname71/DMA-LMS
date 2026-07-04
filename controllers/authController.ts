import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = "dma_token";
const isProd = process.env.NODE_ENV === "production";
const SALT_ROUNDS = 10;

function issueToken(res: Response, payload: object): string {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
  return token;
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, role, password } = req.body;
    if (!name || !email) {
      res.status(400).json({ error: "name and email are required" });
      return;
    }

    const safePassword = password || `DMA-${Math.random().toString(36).slice(2, 10)}`;
    const allowedRoles = ["student", "instructor"];
    const safeRole = allowedRoles.includes(role) ? role : "student";

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const hashed = await bcrypt.hash(safePassword, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashed,
        role: safeRole as any,
        isApproved: safeRole !== "instructor",
      },
      select: { id: true, name: true, email: true, role: true, isApproved: true, subscriptionPlan: true, joinedAt: true },
    });

    const token = issueToken(res, { id: user.id, email: user.email, role: user.role });
    res.status(201).json({ status: "success", user, token });
  } catch (err) {
    console.error("[register]", err);
    res.status(500).json({ error: "Registration failed" });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    if (user.suspended) {
      res.status(403).json({ error: "Account suspended. Contact your administrator." });
      return;
    }
    if (!user.isApproved) {
      res.status(403).json({ error: "Account pending approval. Contact your administrator." });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = issueToken(res, { id: user.id, email: user.email, role: user.role });
    const { password: _pw, ...safeUser } = user;
    res.json({ status: "success", user: safeUser, token });
  } catch (err) {
    console.error("[login]", err);
    res.status(500).json({ error: "Login failed" });
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.json({ status: "success" });
}

export async function me(req: Request, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true, suspended: true, isApproved: true, subscriptionPlan: true, avatar: true, customRoleId: true, joinedAt: true },
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ status: "success", user });
  } catch (err) {
    console.error("[me]", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
}
