import { Router, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { requireAdmin, addLog } from "../middleware/helpers";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const theme = await prisma.themeSetting.findUnique({ where: { id: "main" } });
    res.json(theme?.settings || null);
  } catch {
    res.json(null);
  }
});

router.post("/", async (req: Request, res: Response) => {
  const session = await requireAdmin(req, res);
  if (!session) return;
  const settings = req.body;
  if (!settings || typeof settings !== "object") {
    return res.status(400).json({ error: "Valid theme settings object required" }) as any;
  }
  try {
    await prisma.themeSetting.upsert({
      where: { id: "main" },
      create: { id: "main", settings },
      update: { settings },
    });
    await addLog(`Admin updated site theme (preset: ${settings.preset || "custom"})`, "theme_update", session.userId);
    res.json({ status: "success" });
  } catch (err) {
    console.error("[theme]", err);
    res.status(500).json({ error: "Database unavailable" });
  }
});

export default router;
