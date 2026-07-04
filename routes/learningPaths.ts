import { Router, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { requireSession, addLog } from "../middleware/helpers";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const paths = await prisma.learningPath.findMany({ orderBy: { createdAt: "desc" } });
  res.json(paths);
});

router.post("/create", async (req: Request, res: Response) => {
  const session = await requireSession(req, res);
  if (!session) return;
  const { title, description, category, courses, instructorId, instructorName, badge } = req.body;
  if (!title || !courses || courses.length === 0) {
    res.status(400).json({ error: "Title and courses are required to curate a Learning Path" });
    return;
  }
  const lp = await prisma.learningPath.create({
    data: {
      title, description, category,
      courses,
      instructorId: instructorId || session.userId,
      instructorName: instructorName || "",
      badge: badge || "Academy Specialist Badge",
      enrolledStudents: [],
    },
  });
  await addLog(`Instructor ${instructorName} curated a new learning path: ${title}`, "path_create", session.userId);
  res.json({ status: "success", learningPath: lp });
});

router.post("/enroll", async (req: Request, res: Response) => {
  const session = await requireSession(req, res);
  if (!session) return;
  const { userId, pathId } = req.body;
  const effectiveUserId = userId || session.userId;

  const lp = await prisma.learningPath.findUnique({ where: { id: pathId } });
  if (!lp) { res.status(404).json({ error: "Learning Path not found" }); return; }

  const enrolled = (lp.enrolledStudents as string[]) || [];
  if (!enrolled.includes(effectiveUserId)) {
    enrolled.push(effectiveUserId);
    await prisma.learningPath.update({ where: { id: pathId }, data: { enrolledStudents: enrolled } });
  }

  const courseIds = (lp.courses as string[]) || [];
  for (const courseId of courseIds) {
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: effectiveUserId, courseId } },
    });
    if (!existing) {
      await prisma.enrollment.create({
        data: { userId: effectiveUserId, courseId, completedLessons: [], quizAttempts: {} },
      });
      await prisma.course.update({ where: { id: courseId }, data: { enrollmentCount: { increment: 1 } } }).catch(() => {});
    }
  }

  await addLog(`User ${effectiveUserId} enrolled in Specialization Pathway: ${lp.title}`, "path_enroll", session.userId);
  const updatedLp = await prisma.learningPath.findUnique({ where: { id: pathId } });
  res.json({ status: "success", learningPath: updatedLp });
});

export default router;
