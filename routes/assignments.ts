import { Router, Request, Response } from "express";
import { prisma } from "../config/prisma";

const router = Router();

router.post("/submit", async (req: Request, res: Response) => {
  const { assignmentId, courseId, assignmentTitle, courseName, studentId, studentName, text } = req.body;
  await prisma.assignmentSubmission.upsert({
    where: { assignmentId_studentId: { assignmentId, studentId } },
    create: { assignmentId, courseId, assignmentTitle, courseName, studentId, studentName, text },
    update: { text, grade: null, feedback: null, gradedAt: null },
  });
  res.json({ status: "success" });
});

router.post("/grade", async (req: Request, res: Response) => {
  const { submissionId, grade, feedback } = req.body;
  const sub = await prisma.assignmentSubmission.findUnique({ where: { id: submissionId } });
  if (!sub) { res.status(404).json({ error: "Submission not found" }); return; }
  await prisma.assignmentSubmission.update({
    where: { id: submissionId },
    data: { grade, feedback, gradedAt: new Date() },
  });
  res.json({ status: "success" });
});

router.get("/instructor/:instructorId", async (req: Request, res: Response) => {
  const { instructorId } = req.params;
  const courses = await prisma.course.findMany({ where: { instructorId }, select: { id: true } });
  const courseIds = courses.map(c => c.id);
  const submissions = await prisma.assignmentSubmission.findMany({
    where: { courseId: { in: courseIds } },
    orderBy: { submittedAt: "desc" },
  });
  res.json({ submissions });
});

router.get("/student/:studentId", async (req: Request, res: Response) => {
  const submissions = await prisma.assignmentSubmission.findMany({
    where: { studentId: req.params.studentId },
    orderBy: { submittedAt: "desc" },
  });
  res.json({ submissions });
});

export default router;
