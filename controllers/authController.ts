import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { generateAuthTokens, comparePassword, hashPassword } from "../lib/jwtAuth";
import { AuthRequest } from "../middleware/jwtAuthMiddleware";

const prisma = new PrismaClient();

const COOKIE_NAME = "dma_token";
const isProd = process.env.NODE_ENV === "production";
const SALT_ROUNDS = 10;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? "strict" : "lax") as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
};

/**
 * POST /auth/register
 * Register a new user directly with MySQL (no db_state dependency)
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, role, password } = req.body;

    if (!name || !email) {
      res.status(400).json({ error: "name and email are required" });
      return;
    }

    // Check if MySQL is available
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      res.status(503).json({ error: "Database not available. Please check your MySQL connection." });
      return;
    }

    const safePassword = password || `DMA-${Math.random().toString(36).slice(2, 10)}`;
    const allowedRoles = ["student", "instructor"];
    const safeRole = allowedRoles.includes(role) ? role : "student";

    // Check if user exists
    const existing = await prisma.appUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    // Hash password and create user
    const hashed = await hashPassword(safePassword);
    const user = await prisma.appUser.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashed,
        role: safeRole as any,
        isApproved: safeRole !== "instructor",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isApproved: true,
        joinedAt: true,
      },
    });

    // Generate JWT tokens
    const { token } = generateAuthTokens(user.id, user.email, user.role);

    // Set HTTP-only cookie
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

    res.status(201).json({
      status: "success",
      user,
      token,
    });
  } catch (err) {
    console.error("[register]", err);
    res.status(500).json({ error: "Registration failed" });
  }
}

/**
 * POST /auth/login
 * Login with email and password (MySQL only)
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    // Check if MySQL is available
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      res.status(503).json({ error: "Database not available. Please check your MySQL connection." });
      return;
    }

    // Find user in MySQL
    const user = await prisma.appUser.findUnique({
      where: { email: email.toLowerCase() },
    });

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

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Generate JWT tokens
    const { token } = generateAuthTokens(user.id, user.email, user.role);

    // Set HTTP-only cookie
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

    const { password: _pw, ...safeUser } = user;
    res.json({
      status: "success",
      user: safeUser,
      token,
    });
  } catch (err) {
    console.error("[login]", err);
    res.status(500).json({ error: "Login failed" });
  }
}

/**
 * POST /auth/logout
 * Clear the JWT cookie
 */
export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.json({ status: "success", message: "Logged out successfully" });
}

/**
 * GET /auth/me
 * Get current authenticated user (requires authMiddleware)
 */
export async function me(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    // Check if MySQL is available
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      res.status(503).json({ error: "Database not available" });
      return;
    }

    const user = await prisma.appUser.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        suspended: true,
        isApproved: true,
        avatar: true,
        joinedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      status: "success",
      user,
    });
  } catch (err) {
    console.error("[me]", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
}

/**
 * POST /auth/refresh
 * Refresh JWT token (requires authMiddleware)
 */
export async function refreshToken(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    // Check if MySQL is available
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      res.status(503).json({ error: "Database not available" });
      return;
    }

    const user = await prisma.appUser.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Generate new token
    const { token } = generateAuthTokens(user.id, user.email, user.role);

    // Set new cookie
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

    res.json({
      status: "success",
      message: "Token refreshed",
      token,
    });
  } catch (err) {
    console.error("[refreshToken]", err);
    res.status(500).json({ error: "Failed to refresh token" });
  }
}

/**
 * POST /auth/change-password
 * Change user password (requires authMiddleware)
 */
export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "currentPassword and newPassword are required" });
      return;
    }

    // Check if MySQL is available
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      res.status(503).json({ error: "Database not available" });
      return;
    }

    const user = await prisma.appUser.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password in MySQL
    await prisma.appUser.update({
      where: { id: req.user.userId },
      data: { password: hashedNewPassword },
    });

    res.json({
      status: "success",
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error("[changePassword]", err);
    res.status(500).json({ error: "Failed to change password" });
  }
}
