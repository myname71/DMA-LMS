import { Router, Request, Response } from "express";
import { prisma } from "../config/prisma";

const router = Router();

router.post("/send", async (req: Request, res: Response) => {
  const { fromId, fromName, fromRole, toId, toName, subject, body } = req.body;
  await prisma.message.create({
    data: { fromId, fromName, fromRole, toId, toName, subject: subject || "Message", body },
  });
  res.json({ status: "success" });
});

router.get("/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  const msgs = await prisma.message.findMany({
    where: { OR: [{ fromId: userId }, { toId: userId }] },
    orderBy: { createdAt: "desc" },
  });
  res.json({ messages: msgs.map(m => ({ ...m, timestamp: m.createdAt.toISOString(), read: m.isRead })) });
});

router.post("/:id/read", async (req: Request, res: Response) => {
  await prisma.message.update({ where: { id: req.params.id }, data: { isRead: true } }).catch(() => {});
  res.json({ status: "success" });
});

export default router;
