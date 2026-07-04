import { Router, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { requireSession, addLog } from "../middleware/helpers";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const events = await prisma.event.findMany({ orderBy: { date: "asc" } });
  res.json(events);
});

router.post("/create", async (req: Request, res: Response) => {
  const session = await requireSession(req, res);
  if (!session) return;
  const { title, date, time, host, type, desc, category } = req.body;
  if (!title || !date) { res.status(400).json({ error: "Title and/or date are missing." }); return; }
  const event = await prisma.event.create({
    data: {
      title, date,
      time: time || "10:00",
      host: host || "Guest Host",
      type: type || "Webinar",
      desc: desc || "",
      category: category || "General",
      attendees: [],
    },
  });
  await addLog(`New event published: ${title} on ${date}`, "event_create", session.userId);
  res.json({ status: "success", event });
});

router.post("/:id/attend", async (req: Request, res: Response) => {
  const session = await requireSession(req, res);
  if (!session) return;
  const { id } = req.params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) { res.status(404).json({ error: "Event not found" }); return; }
  const attendees = (event.attendees as string[]) || [];
  if (!attendees.includes(session.userId)) {
    attendees.push(session.userId);
    await prisma.event.update({ where: { id }, data: { attendees } });
  }
  res.json({ status: "success" });
});

export default router;
