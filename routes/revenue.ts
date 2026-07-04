import { Router, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { requireSession } from "../middleware/helpers";

const router = Router();

router.get("/:instructorId", async (req: Request, res: Response) => {
  const session = await requireSession(req, res);
  if (!session) return;
  const { instructorId } = req.params;
  const isAdmin = session.role === "admin" || session.role === "super_admin";
  if (!isAdmin && session.userId !== instructorId) { res.status(403).json({ error: "Access denied" }); return; }

  const courses = await prisma.course.findMany({ where: { instructorId }, select: { enrollmentCount: true, price: true } });
  const totalRevenue = courses.reduce((sum, c) => sum + (c.enrollmentCount || 0) * (c.price || 0), 0);
  const withdrawals = await prisma.withdrawalRequest.findMany({ where: { instructorId } });
  const totalWithdrawn = withdrawals.filter(w => w.status === "approved").reduce((s, w) => s + w.amount, 0);
  const bank = await prisma.bankAccount.findUnique({ where: { instructorId } });

  res.json({ totalRevenue, totalWithdrawn, bank, withdrawals, platformShare: 0.3, instructorShare: 0.7 });
});

router.post("/add-bank", async (req: Request, res: Response) => {
  const session = await requireSession(req, res);
  if (!session) return;
  const { instructorId, bankName, accountName, accountNumber, routingCode, country } = req.body;
  const isAdmin = session.role === "admin" || session.role === "super_admin";
  if (!isAdmin && session.userId !== instructorId) { res.status(403).json({ error: "Access denied" }); return; }

  const masked = (accountNumber || "").replace(/./g, (c: string, i: number) =>
    i < (accountNumber.length - 4) ? "*" : c
  );
  await prisma.bankAccount.upsert({
    where: { instructorId },
    create: { instructorId, bankName, accountName, accountNumber: masked, routingCode, country },
    update: { bankName, accountName, accountNumber: masked, routingCode, country },
  });
  res.json({ status: "success" });
});

router.post("/withdraw", async (req: Request, res: Response) => {
  const session = await requireSession(req, res);
  if (!session) return;
  const { instructorId, instructorName, amount } = req.body;
  const isAdmin = session.role === "admin" || session.role === "super_admin";
  if (!isAdmin && session.userId !== instructorId) { res.status(403).json({ error: "Access denied" }); return; }

  const courses = await prisma.course.findMany({ where: { instructorId }, select: { enrollmentCount: true, price: true } });
  const totalRevenue = courses.reduce((sum, c) => sum + (c.enrollmentCount || 0) * (c.price || 0), 0);
  const instructorBalance = totalRevenue * 0.7;
  const withdrawals = await prisma.withdrawalRequest.findMany({ where: { instructorId, NOT: { status: "rejected" } } });
  const alreadyWithdrawn = withdrawals.reduce((s, w) => s + w.amount, 0);
  const available = instructorBalance - alreadyWithdrawn;

  if (amount > available) { res.status(400).json({ error: "Insufficient balance" }); return; }
  await prisma.withdrawalRequest.create({ data: { instructorId, instructorName, amount, status: "pending" } });
  res.json({ status: "success" });
});

export default router;
