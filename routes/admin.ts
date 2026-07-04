import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../config/prisma";
import { requireAdmin, requirePermission, addLog, isSuperAdmin } from "../middleware/helpers";

const router = Router();

router.get("/users", async (req: Request, res: Response) => {
  const session = await requireAdmin(req, res);
  if (!session) return;
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, suspended: true, isApproved: true, subscriptionPlan: true, avatar: true, customRoleId: true, joinedAt: true },
    orderBy: { joinedAt: "desc" },
  });
  res.json({ status: "success", users });
});

router.post("/users/create", async (req: Request, res: Response) => {
  const session = await requirePermission("manage_users", req, res);
  if (!session) return;
  const { name, email, role, avatar, password, customRoleId } = req.body;
  if (!name || !email || !role) return res.status(400).json({ error: "name, email, role required" }) as any;
  if (!password) return res.status(400).json({ error: "password required for admin-created accounts" }) as any;

  if (role === "super_admin" && !isSuperAdmin(session)) {
    return res.status(403).json({ error: "Only super admin can create super admin accounts" }) as any;
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return res.status(400).json({ error: "Email already registered" }) as any;

  const hashedPw = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name, email: email.toLowerCase(), role,
      password: hashedPw,
      avatar: avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
      suspended: false,
      isApproved: role === "instructor" ? false : true,
      ...(customRoleId ? { customRoleId } : {}),
    },
  });
  await addLog(`Admin created user: ${name} (${role})`, "user_create", session.userId);
  const { password: _pw, ...safeUser } = user;
  res.json({ status: "success", user: safeUser });
});

router.put("/users/:id", async (req: Request, res: Response) => {
  const session = await requirePermission("manage_users", req, res);
  if (!session) return;
  const { id } = req.params;
  const { name, email, role, avatar, subscriptionPlan, customRoleId } = req.body;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return res.status(404).json({ error: "User not found" }) as any;

  if (target.role === "super_admin" && !isSuperAdmin(session)) {
    return res.status(403).json({ error: "Admin cannot modify super admin accounts" }) as any;
  }
  if (role === "super_admin" && !isSuperAdmin(session)) {
    return res.status(403).json({ error: "Only super admin can promote to super admin" }) as any;
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(name ? { name } : {}),
      ...(email ? { email: email.toLowerCase() } : {}),
      ...(role ? { role } : {}),
      ...(avatar !== undefined ? { avatar } : {}),
      ...(subscriptionPlan !== undefined ? { subscriptionPlan } : {}),
      ...(customRoleId !== undefined ? { customRoleId: customRoleId || null } : {}),
    },
    select: { id: true, name: true, email: true, role: true, suspended: true, isApproved: true, subscriptionPlan: true, avatar: true, customRoleId: true, joinedAt: true },
  });
  await addLog(`Admin updated user: ${updated.name}`, "user_update", session.userId);
  res.json({ status: "success", user: updated });
});

router.post("/users/:id/suspend", async (req: Request, res: Response) => {
  const session = await requireAdmin(req, res);
  if (!session) return;
  const { id } = req.params;
  const { suspend } = req.body;
  if (id === session.userId) return res.status(400).json({ error: "Cannot suspend your own account" }) as any;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return res.status(404).json({ error: "User not found" }) as any;

  if (target.role === "super_admin" && !isSuperAdmin(session)) {
    return res.status(403).json({ error: "Admin cannot suspend super admin accounts" }) as any;
  }

  await prisma.user.update({ where: { id }, data: { suspended: !!suspend } });
  await addLog(`Admin ${suspend ? "suspended" : "unsuspended"} user: ${target.name}`, "user_suspend", session.userId);
  res.json({ status: "success" });
});

router.delete("/users/:id", async (req: Request, res: Response) => {
  const session = await requirePermission("manage_users", req, res);
  if (!session) return;
  const { id } = req.params;
  if (id === session.userId) return res.status(400).json({ error: "Cannot delete your own account" }) as any;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return res.status(404).json({ error: "User not found" }) as any;

  if (target.role === "super_admin" && !isSuperAdmin(session)) {
    return res.status(403).json({ error: "Admin cannot delete super admin accounts" }) as any;
  }

  await prisma.user.delete({ where: { id } });
  await addLog(`Admin deleted user: ${target.name}`, "user_delete", session.userId);
  res.json({ status: "success" });
});

router.post("/users/:id/reset-password", async (req: Request, res: Response) => {
  const session = await requirePermission("manage_users", req, res);
  if (!session) return;
  const { id } = req.params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ error: "User not found" }) as any;
  const tempPassword = `DMA-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const hashed = await bcrypt.hash(tempPassword, 10);
  await prisma.user.update({ where: { id }, data: { password: hashed } });
  await addLog(`Admin reset password for: ${user.name}`, "password_reset", session.userId);
  res.json({ status: "success", tempPassword });
});

router.post("/users/invite", async (req: Request, res: Response) => {
  const session = await requireAdmin(req, res);
  if (!session) return;
  const { email, role } = req.body;
  if (!email || !role) return res.status(400).json({ error: "email and role required" }) as any;
  const token = crypto.randomBytes(16).toString("hex");
  const invite = await prisma.invite.create({ data: { email, role, token, status: "pending" } });
  await addLog(`Invite generated for: ${email} (${role})`, "invite", session.userId);
  res.json({ status: "success", invite, inviteUrl: `/register?invite=${token}` });
});

router.get("/invites", async (req: Request, res: Response) => {
  const session = await requireAdmin(req, res);
  if (!session) return;
  const invites = await prisma.invite.findMany({ orderBy: { createdAt: "desc" } });
  res.json({ status: "success", invites });
});

router.post("/approve-instructor", async (req: Request, res: Response) => {
  const session = await requireAdmin(req, res);
  if (!session) return;
  const { instructorId } = req.body;
  const user = await prisma.user.findUnique({ where: { id: instructorId } });
  if (!user) { res.status(404).json({ error: "Instructor not found" }); return; }
  await prisma.user.update({ where: { id: instructorId }, data: { isApproved: true } });
  await addLog(`Approved Instructor: ${user.name}`, "instructor_approve", session.userId);
  res.json({ status: "success" });
});

router.delete("/courses/:id", async (req: Request, res: Response) => {
  const session = await requireAdmin(req, res);
  if (!session) return;
  const course = await prisma.course.findUnique({ where: { id: req.params.id } });
  if (!course) { res.status(404).json({ error: "Course not found" }); return; }
  await prisma.course.delete({ where: { id: req.params.id } });
  await addLog(`Admin removed course: ${course.title}`, "course_delete", session.userId);
  res.json({ status: "success" });
});

router.post("/approve-course", async (req: Request, res: Response) => {
  const session = await requireAdmin(req, res);
  if (!session) return;
  const { courseId } = req.body;
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) { res.status(404).json({ error: "Course not found" }); return; }
  await prisma.course.update({ where: { id: courseId }, data: { approvalStatus: "approved", isPublished: true } });
  await addLog(`Course "${course.title}" approved and published`, "course_approve", session.userId);
  res.json({ status: "success" });
});

router.post("/reject-course", async (req: Request, res: Response) => {
  const session = await requireAdmin(req, res);
  if (!session) return;
  const { courseId, reason } = req.body;
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) { res.status(404).json({ error: "Course not found" }); return; }
  await prisma.course.update({ where: { id: courseId }, data: { approvalStatus: "rejected", rejectionReason: reason || "Does not meet quality standards" } });
  res.json({ status: "success" });
});

router.post("/clear-logs", async (req: Request, res: Response) => {
  const session = await requireAdmin(req, res);
  if (!session) return;
  await prisma.activityLog.deleteMany({});
  await prisma.activityLog.create({ data: { text: "Activity logs cleared by admin.", type: "admin" } });
  res.json({ status: "success" });
});

router.get("/logs", async (req: Request, res: Response) => {
  const session = await requireAdmin(req, res);
  if (!session) return;
  const logs = await prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  res.json({ logs: logs.map(l => ({ id: l.id, text: l.text, time: l.createdAt.toISOString() })) });
});

router.get("/roles", async (req: Request, res: Response) => {
  const session = await requireAdmin(req, res);
  if (!session) return;
  const roles = await prisma.customRole.findMany({ orderBy: { createdAt: "desc" } });
  res.json({ status: "success", roles });
});

router.post("/roles/create", async (req: Request, res: Response) => {
  const session = await requireAdmin(req, res);
  if (!session) return;
  const { name, description, permissions } = req.body;
  if (!name) return res.status(400).json({ error: "Role name required" }) as any;
  const newRole = await prisma.customRole.create({ data: { name, description: description || "", permissions: permissions || [] } });
  await addLog(`Admin created custom role: ${name}`, "role_create", session.userId);
  res.json({ status: "success", role: newRole });
});

router.put("/roles/:id", async (req: Request, res: Response) => {
  const session = await requireAdmin(req, res);
  if (!session) return;
  const { name, description, permissions } = req.body;
  const role = await prisma.customRole.findUnique({ where: { id: req.params.id } });
  if (!role) return res.status(404).json({ error: "Role not found" }) as any;
  const updated = await prisma.customRole.update({ where: { id: req.params.id }, data: { ...(name ? { name } : {}), ...(description !== undefined ? { description } : {}), ...(permissions ? { permissions } : {}) } });
  res.json({ status: "success", role: updated });
});

router.delete("/roles/:id", async (req: Request, res: Response) => {
  const session = await requireAdmin(req, res);
  if (!session) return;
  const role = await prisma.customRole.findUnique({ where: { id: req.params.id } });
  if (!role) return res.status(404).json({ error: "Role not found" }) as any;
  await prisma.customRole.delete({ where: { id: req.params.id } });
  await addLog(`Admin deleted custom role: ${role.name}`, "role_delete", session.userId);
  res.json({ status: "success" });
});

router.get("/media", async (req: Request, res: Response) => {
  const session = await requireAdmin(req, res);
  if (!session) return;
  const media = await prisma.mediaItem.findMany({ orderBy: { uploadedAt: "desc" } });
  res.json({ status: "success", media });
});

router.post("/media/upload", async (req: Request, res: Response) => {
  const session = await requireAdmin(req, res);
  if (!session) return;
  const { name, dataUrl, type } = req.body;
  if (!name || !dataUrl) return res.status(400).json({ error: "name and dataUrl required" }) as any;
  const item = await prisma.mediaItem.create({ data: { name, dataUrl, type: type || "image" } });
  await addLog(`Media uploaded: ${name}`, "media_upload", session.userId);
  res.json({ status: "success", item });
});

router.delete("/media/:id", async (req: Request, res: Response) => {
  const session = await requireAdmin(req, res);
  if (!session) return;
  const item = await prisma.mediaItem.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ error: "Media not found" }) as any;
  await prisma.mediaItem.delete({ where: { id: req.params.id } });
  res.json({ status: "success" });
});

router.post("/media/:id/set-banner", async (req: Request, res: Response) => {
  const session = await requirePermission("manage_settings", req, res);
  if (!session) return;
  const { target } = req.body;
  await prisma.mediaItem.updateMany({ where: { usedAs: target }, data: { usedAs: null } });
  const item = await prisma.mediaItem.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ error: "Media not found" }) as any;
  await prisma.mediaItem.update({ where: { id: req.params.id }, data: { usedAs: target } });
  await addLog(`Media '${item.name}' set as ${target} banner`, "media_banner", session.userId);
  res.json({ status: "success", item: { ...item, usedAs: target } });
});

router.get("/stats", async (req: Request, res: Response) => {
  const session = await requireAdmin(req, res);
  if (!session) return;
  const [userCount, courseCount, enrollmentCount] = await Promise.all([
    prisma.user.count(),
    prisma.course.count({ where: { isPublished: true } }),
    prisma.enrollment.count(),
  ]);
  res.json({ userCount, courseCount, enrollmentCount });
});

export default router;
