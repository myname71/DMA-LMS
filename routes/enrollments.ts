import { Router, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { getSessionFromRequest } from "../middleware/helpers";

const router = Router();

router.get("/:userId", async (req: Request, res: Response) => {
  const session = getSessionFromRequest(req);
  const { userId } = req.params;
  if (!session || (session.userId !== userId && session.role !== "admin" && session.role !== "super_admin")) {
    res.status(403).json({ error: "Access denied" });
    return;
  }
  try {
    const enrollments = await prisma.enrollment.findMany({ where: { userId } });
    res.json({ enrollments });
  } catch (err) {
    console.error("[enrollments]", err);
    res.status(500).json({ error: "Database unavailable" });
  }
});

export default router;
