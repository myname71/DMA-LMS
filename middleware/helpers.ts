import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { verifyTokenRaw } from "./auth";

export const BUILTIN_PERMISSIONS: Record<string, string[]> = {
  super_admin: ["view_courses", "edit_content", "moderate_courses", "manage_users", "approve_instructors", "view_financials", "view_analytics", "manage_settings"],
  admin:       ["view_courses", "edit_content", "moderate_courses", "manage_users", "approve_instructors", "view_financials", "view_analytics"],
  instructor:  ["view_courses", "edit_content"],
  student:     ["view_courses"],
};

export type SessionInfo = { userId: string; role: string };

export function getSessionFromRequest(req: Request): SessionInfo | null {
  const cookie = (req as any).cookies?.dma_token;
  if (cookie) {
    const payload = verifyTokenRaw(cookie);
    if (payload) return { userId: payload.id, role: payload.role };
  }
  const authHeader = req.headers.authorization || "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (bearer) {
    const payload = verifyTokenRaw(bearer);
    if (payload) return { userId: payload.id, role: payload.role };
  }
  return null;
}

export async function requireSession(req: Request, res: Response): Promise<SessionInfo | null> {
  const session = getSessionFromRequest(req);
  if (!session) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }
  return session;
}

export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, customRoleId: true } });
    if (!user) return [];
    if (user.customRoleId) {
      const cr = await prisma.customRole.findUnique({ where: { id: user.customRoleId } });
      if (cr) return (cr.permissions as string[]) || [];
    }
    return BUILTIN_PERMISSIONS[user.role] || [];
  } catch {
    return [];
  }
}

export async function requirePermission(
  permission: string,
  req: Request,
  res: Response
): Promise<SessionInfo | null> {
  const session = getSessionFromRequest(req);
  if (!session) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }
  const perms = await getUserPermissions(session.userId);
  if (!perms.includes(permission)) {
    res.status(403).json({ error: `Permission '${permission}' required` });
    return null;
  }
  return session;
}

export async function requireAdmin(req: Request, res: Response): Promise<SessionInfo | null> {
  const session = getSessionFromRequest(req);
  if (!session) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }
  if (session.role === "admin" || session.role === "super_admin") {
    return session;
  }
  const perms = await getUserPermissions(session.userId);
  if (perms.includes("manage_users") || perms.includes("manage_settings")) {
    return session;
  }
  res.status(403).json({ error: "Insufficient privileges. Admin or Super Admin role required." });
  return null;
}

export async function addLog(text: string, type?: string, userId?: string): Promise<void> {
  try {
    await prisma.activityLog.create({ data: { text, type, userId } });
  } catch { /* non-fatal */ }
}

export function isSuperAdmin(session: SessionInfo): boolean {
  return session.role === "super_admin";
}

export function isAdmin(session: SessionInfo): boolean {
  return session.role === "admin" || session.role === "super_admin";
}
