import { Router, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { getSessionFromRequest, requireSession, addLog } from "../middleware/helpers";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(courses);
});

router.get("/:id", async (req: Request, res: Response) => {
  const course = await prisma.course.findUnique({ where: { id: req.params.id } });
  if (!course) { res.status(404).json({ error: "Course not found" }); return; }
  res.json(course);
});

router.post("/create", async (req: Request, res: Response) => {
  const session = await requireSession(req, res);
  if (!session) return;
  const { title, headline, description, category, level, duration, price, image, isFree } = req.body;
  if (!title || !category) { res.status(400).json({ error: "title and category required" }); return; }
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { name: true } });
  const course = await prisma.course.create({
    data: {
      id: `c_${Date.now()}`,
      title,
      headline: headline || "",
      description: description || "",
      category,
      level: level || "Beginner",
      duration: duration || "TBD",
      instructorId: session.userId,
      instructorName: user?.name || "Instructor",
      price: isFree ? 0 : (price || 0),
      isFree: !!isFree,
      image: image || "",
      isPublished: false,
      approvalStatus: "draft",
    },
  });
  await addLog(`Instructor ${user?.name} created course: ${title}`, "course_create", session.userId);
  res.json({ status: "success", course });
});

router.post("/update", async (req: Request, res: Response) => {
  const session = await requireSession(req, res);
  if (!session) return;
  const { courseId, instructorId, updates } = req.body;
  const course = await prisma.course.findFirst({ where: { id: courseId, instructorId: session.userId } });
  if (!course && session.role !== "admin" && session.role !== "super_admin") {
    res.status(404).json({ error: "Course not found or unauthorized" }); return;
  }
  const updated = await prisma.course.update({ where: { id: courseId }, data: updates });
  res.json({ status: "success", course: updated });
});

router.post("/submit-for-review", async (req: Request, res: Response) => {
  const session = await requireSession(req, res);
  if (!session) return;
  const { courseId } = req.body;
  const course = await prisma.course.findFirst({ where: { id: courseId, instructorId: session.userId } });
  if (!course) { res.status(404).json({ error: "Course not found" }); return; }
  await prisma.course.update({ where: { id: courseId }, data: { approvalStatus: "pending", isPublished: false } });
  await addLog(`Course "${course.title}" submitted for review`, "course_review", session.userId);
  res.json({ status: "success" });
});

router.post("/:id/enroll", async (req: Request, res: Response) => {
  const session = await requireSession(req, res);
  if (!session) return;
  const { id } = req.params;
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) { res.status(404).json({ error: "Course not found" }); return; }

  const existing = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: session.userId, courseId: id } } });
  if (existing) { res.json({ status: "already_enrolled", enrollment: existing }); return; }

  const enrollment = await prisma.enrollment.create({
    data: { userId: session.userId, courseId: id, completedLessons: [], quizAttempts: {} },
  });
  await prisma.course.update({ where: { id }, data: { enrollmentCount: { increment: 1 } } });
  await addLog(`User ${session.userId} enrolled in course: ${course.title}`, "enrollment", session.userId);
  res.json({ status: "success", enrollment });
});

router.post("/:id/progress", async (req: Request, res: Response) => {
  const session = await requireSession(req, res);
  if (!session) return;
  const { id } = req.params;
  const { lessonId } = req.body;

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.userId, courseId: id } },
  });
  if (!enrollment) { res.status(404).json({ error: "Not enrolled" }); return; }

  const completed = (enrollment.completedLessons as string[]) || [];
  if (!completed.includes(lessonId)) completed.push(lessonId);

  const course = await prisma.course.findUnique({ where: { id }, select: { lessons: true } });
  const lessons = (course?.lessons as any[]) || [];
  const required = lessons.filter((l: any) => l.isRequired !== false);
  const progress = required.length > 0 ? Math.round((completed.length / required.length) * 100) : 0;

  const updated = await prisma.enrollment.update({
    where: { userId_courseId: { userId: session.userId, courseId: id } },
    data: { completedLessons: completed, progress },
  });
  res.json({ status: "success", enrollment: updated });
});

router.post("/:id/quiz", async (req: Request, res: Response) => {
  const session = await requireSession(req, res);
  if (!session) return;
  const { id } = req.params;
  const { quizId, answers } = req.body;

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.userId, courseId: id } },
  });
  if (!enrollment) { res.status(404).json({ error: "Not enrolled" }); return; }

  const course = await prisma.course.findUnique({ where: { id }, select: { quizzes: true } });
  const quizzes = (course?.quizzes as any[]) || [];
  const quiz = quizzes.find((q: any) => q.id === quizId);
  if (!quiz) { res.status(404).json({ error: "Quiz not found" }); return; }

  let correct = 0;
  for (let i = 0; i < quiz.questions.length; i++) {
    if (answers[i] === quiz.questions[i].correctAnswer) correct++;
  }
  const score = Math.round((correct / quiz.questions.length) * 100);
  const passed = score >= (quiz.passingScore || 80);

  const attempts = (enrollment.quizAttempts as Record<string, any>) || {};
  attempts[quizId] = { score, passed, attemptedAt: new Date().toISOString() };

  await prisma.enrollment.update({
    where: { userId_courseId: { userId: session.userId, courseId: id } },
    data: { quizAttempts: attempts },
  });
  res.json({ status: "success", score, passed, correct, total: quiz.questions.length });
});

router.get("/enrollments/:userId", async (req: Request, res: Response) => {
  const session = getSessionFromRequest(req);
  const { userId } = req.params;
  if (!session || (session.userId !== userId && session.role !== "admin" && session.role !== "super_admin")) {
    res.status(403).json({ error: "Access denied" }); return;
  }
  const enrollments = await prisma.enrollment.findMany({ where: { userId } });
  res.json({ enrollments });
});

export default router;
