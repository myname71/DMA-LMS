import { PrismaClient } from "@prisma/client";

// ─── Singleton Prisma Client ──────────────────────────────────────────────────

let _prisma: PrismaClient | null = null;
let _connected = false;
let _tested = false;

function getPrisma(): PrismaClient | null {
  if (!process.env.MYSQL_DATABASE_URL) return null;
  if (!_prisma) {
    try { _prisma = new PrismaClient({ log: [] }); } catch { return null; }
  }
  return _prisma;
}

export function isMySQLAvailable(): boolean { return _connected; }

// ─── Connection Test ──────────────────────────────────────────────────────────

export async function testMySQL(): Promise<boolean> {
  if (_tested) return _connected;
  _tested = true;
  const prisma = getPrisma();
  if (!prisma) { console.log("[MySQL] No MYSQL_DATABASE_URL — using db_state.json"); return false; }
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    _connected = true;
    console.log("[MySQL] Connected successfully ✓");
    return true;
  } catch (err: any) {
    console.warn("[MySQL] Not reachable (will use db_state.json):", err.message?.split("\n")[0] || err.code);
    _connected = false;
    return false;
  }
}

// ─── Count Users (used to detect first-deploy empty DB) ──────────────────────

export async function getMySQLUserCount(): Promise<number> {
  if (!_connected) return -1;
  const prisma = getPrisma();
  if (!prisma) return -1;
  try {
    return await prisma.appUser.count();
  } catch {
    return -1;
  }
}

// ─── Load All State From MySQL ────────────────────────────────────────────────

export async function loadFromMySQL(): Promise<Record<string, any> | null> {
  if (!_connected) return null;
  const prisma = getPrisma();
  if (!prisma) return null;

  try {
    const [
      users, courses, enrollments, messages, certificates, logs,
      learningPaths, events, invites, customRoles, mediaLibrary,
      bankAccounts, withdrawalRequests, assignmentSubmissions,
      webinarPosts, quizAttempts, subscriptions, certTemplates,
      cmsRow, themeRow,
    ] = await Promise.all([
      prisma.appUser.findMany(),
      prisma.appCourse.findMany(),
      prisma.appEnrollment.findMany(),
      prisma.appMessage.findMany({ orderBy: { createdAt: "desc" }, take: 500 }),
      prisma.appCertificate.findMany(),
      prisma.appLog.findMany({ orderBy: { createdAt: "desc" }, take: 500 }),
      prisma.appLearningPath.findMany(),
      prisma.appEvent.findMany(),
      prisma.appInvite.findMany(),
      prisma.appCustomRole.findMany(),
      prisma.appMediaItem.findMany(),
      prisma.appBankAccount.findMany(),
      prisma.appWithdrawalRequest.findMany(),
      prisma.appAssignmentSubmission.findMany(),
      prisma.appWebinarPost.findMany({ orderBy: { pinned: "desc" } }),
      prisma.appQuizAttempt.findMany(),
      prisma.appSubscription.findMany(),
      prisma.appCertTemplate.findMany(),
      prisma.appCmsContent.findUnique({ where: { id: "main" } }),
      prisma.appThemeSetting.findUnique({ where: { id: "main" } }),
    ]);

    return {
      users:                 users.map(mapUser),
      courses:               courses.map(mapCourse),
      enrollments:           enrollments.map(mapEnrollment),
      messages:              messages.map(mapMessage),
      certificates:          certificates.map(r => ({ ...r })),
      logs:                  logs.map(mapLog),
      learningPaths:         learningPaths.map(mapLearningPath),
      events:                events.map(mapEvent),
      invites:               invites.map(r => ({ ...r })),
      customRoles:           customRoles.map(mapCustomRole),
      mediaLibrary:          mediaLibrary.map(r => ({ ...r })),
      bankAccounts:          bankAccounts.map(r => ({ ...r })),
      withdrawalRequests:    withdrawalRequests.map(r => ({ ...r })),
      assignmentSubmissions: assignmentSubmissions.map(r => ({ ...r })),
      webinarPosts:          webinarPosts.map(mapWebinarPost),
      quizAttempts:          quizAttempts.map(r => ({ ...r })),
      subscriptions:         subscriptions.map(r => ({ ...r })),
      certTemplates:         certTemplates.map(r => ({ ...r })),
      cmsContent:            cmsRow ? { pages: cmsRow.pages } : null,
      themeSettings:         themeRow ? themeRow.data : null,
    };
  } catch (err: any) {
    console.error("[MySQL] loadFromMySQL error:", err.message?.split("\n")[0]);
    _connected = false;
    return null;
  }
}

// ─── Sync Entire State to MySQL ───────────────────────────────────────────────
// Called asynchronously from saveState() — never blocks the response.

export async function syncStateToMySQL(state: any): Promise<void> {
  if (!_connected) return;
  const prisma = getPrisma();
  if (!prisma) return;

  try {
    await Promise.all([
      upsertAll(prisma, "appUser",                 state.users || [],                 dbUser),
      upsertAll(prisma, "appCourse",               state.courses || [],               dbCourse),
      upsertAll(prisma, "appEnrollment",           state.enrollments || [],           dbEnrollment),
      upsertAll(prisma, "appMessage",              state.messages || [],              dbMessage),
      upsertAll(prisma, "appCertificate",          state.certificates || [],          dbCert),
      upsertAll(prisma, "appLearningPath",         state.learningPaths || [],         dbLearningPath),
      upsertAll(prisma, "appEvent",                state.events || [],                dbEvent),
      upsertAll(prisma, "appInvite",               state.invites || [],               dbInvite),
      upsertAll(prisma, "appCustomRole",           state.customRoles || [],           dbCustomRole),
      upsertAll(prisma, "appMediaItem",            state.mediaLibrary || [],          dbMediaItem),
      upsertAll(prisma, "appBankAccount",          state.bankAccounts || [],          dbBankAccount),
      upsertAll(prisma, "appWithdrawalRequest",    state.withdrawalRequests || [],    dbWithdrawal),
      upsertAll(prisma, "appAssignmentSubmission", state.assignmentSubmissions || [], dbSubmission),
      upsertAll(prisma, "appWebinarPost",          state.webinarPosts || [],          dbWebinarPost),
      upsertAll(prisma, "appQuizAttempt",          state.quizAttempts || [],          dbQuizAttempt),
      upsertAll(prisma, "appCertTemplate",         state.certTemplates || [],         dbCertTemplate),
      syncLogs(prisma, state.logs || []),
      syncCmsContent(prisma, state.cmsContent),
      syncThemeSettings(prisma, state.themeSettings),
    ]);
  } catch (err: any) {
    console.error("[MySQL] syncStateToMySQL error:", err.message?.split("\n")[0]);
  }
}

// ─── Generic Upsert Helper ────────────────────────────────────────────────────

async function upsertAll(
  prisma: PrismaClient,
  model: string,
  items: any[],
  mapper: (item: any) => any
): Promise<void> {
  if (!items.length) return;
  const client = (prisma as any)[model];
  if (!client) return;
  for (const item of items) {
    if (!item?.id) continue;
    const data = mapper(item);
    try {
      await client.upsert({ where: { id: item.id }, create: data, update: data });
    } catch { /* skip individual failures */ }
  }
}

// ─── Logs: only insert new ones ───────────────────────────────────────────────

async function syncLogs(prisma: PrismaClient, logs: any[]): Promise<void> {
  if (!logs.length) return;
  const recentLogs = logs.slice(0, 100); // only sync last 100 to avoid huge writes
  for (const log of recentLogs) {
    if (!log?.id) continue;
    try {
      await prisma.appLog.upsert({
        where:  { id: log.id },
        create: { id: log.id, text: log.text || "", type: log.type || null, userId: log.userId || null, time: log.time || null },
        update: { text: log.text || "", type: log.type || null },
      });
    } catch { /* skip */ }
  }
}

// ─── CMS & Theme Singletons ───────────────────────────────────────────────────

async function syncCmsContent(prisma: PrismaClient, cms: any): Promise<void> {
  if (!cms) return;
  const pages = (Array.isArray(cms.pages) ? cms.pages : []) as any;
  try {
    await prisma.appCmsContent.upsert({
      where:  { id: "main" },
      create: { id: "main", pages },
      update: { pages },
    });
  } catch { /* skip */ }
}

async function syncThemeSettings(prisma: PrismaClient, theme: any): Promise<void> {
  if (!theme) return;
  try {
    await prisma.appThemeSetting.upsert({
      where:  { id: "main" },
      create: { id: "main", data: theme as any },
      update: { data: theme as any },
    });
  } catch { /* skip */ }
}

// ─── Field Mappers: state object → Prisma create/update shape ────────────────

function dbUser(u: any) {
  return {
    id: u.id, name: u.name || "", email: (u.email || "").toLowerCase(),
    password: u.password || null, role: u.role || "student",
    isApproved: u.isApproved !== false, suspended: !!u.suspended,
    subscriptionPlan: u.subscriptionPlan || "free",
    avatar: u.avatar || null, bio: u.bio || null,
    specialization: u.specialization || null, joinedAt: u.joinedAt || null,
    customRoleId: u.customRoleId || null, qualificationDoc: u.qualificationDoc || null,
    badges: (u.badges || null) as any,
  };
}

function dbCourse(c: any) {
  return {
    id: c.id, title: c.title || "", headline: c.headline || null,
    description: c.description || null, category: c.category || null,
    level: c.level || null, duration: c.duration || null,
    instructorId: c.instructorId || null, instructorName: c.instructorName || null,
    price: parseFloat(c.price) || 0, isFree: c.isFree !== false,
    image: c.image || null,
    lessons:     (Array.isArray(c.lessons)     ? c.lessons     : []) as any,
    quizzes:     (Array.isArray(c.quizzes)     ? c.quizzes     : []) as any,
    assignments: (Array.isArray(c.assignments) ? c.assignments : []) as any,
    isPublished: !!c.isPublished,
    approvalStatus: c.approvalStatus || "approved",
    rejectionReason: c.rejectionReason || null,
    enrollmentCount: parseInt(c.enrollmentCount) || 0,
    ratingAverage: parseFloat(c.ratingAverage) || 0,
    createdAt: c.createdAt || null,
  };
}

function dbEnrollment(e: any) {
  return {
    id: e.id, userId: e.userId, courseId: e.courseId,
    progress: parseInt(e.progress) || 0,
    completedLessons: (Array.isArray(e.completedLessons) ? e.completedLessons : []) as any,
    quizAttempts:     (e.quizAttempts && typeof e.quizAttempts === "object" ? e.quizAttempts : {}) as any,
    enrolledAt: e.enrolledAt || null, completedAt: e.completedAt || null,
  };
}

function dbMessage(m: any) {
  return {
    id: m.id, fromUserId: m.fromUserId || m.from || null,
    toUserId: m.toUserId || m.to || null,
    fromName: m.fromName || null, toName: m.toName || null,
    fromRole: m.fromRole || null, subject: m.subject || null,
    body: m.body || m.message || "", isRead: !!m.isRead,
    createdAt: m.createdAt || null,
  };
}

function dbCert(c: any) {
  return { id: c.id, userId: c.userId, courseId: c.courseId, certId: c.certId, issuedAt: c.issuedAt || null };
}

function dbLearningPath(lp: any) {
  return {
    id: lp.id, title: lp.title || "", description: lp.description || null,
    category: lp.category || null,
    courses:          (Array.isArray(lp.courses)          ? lp.courses          : []) as any,
    enrolledStudents: (Array.isArray(lp.enrolledStudents) ? lp.enrolledStudents : []) as any,
    instructorId: lp.instructorId || null, instructorName: lp.instructorName || null,
    badge: lp.badge || null, createdAt: lp.createdAt || null,
  };
}

function dbEvent(ev: any) {
  return {
    id: ev.id, title: ev.title || "", date: ev.date || null, time: ev.time || null,
    host: ev.host || null, type: ev.type || null, desc: ev.desc || null,
    category: ev.category || null,
    attendees: (Array.isArray(ev.attendees) ? ev.attendees : []) as any,
    createdAt: ev.createdAt || null,
  };
}

function dbInvite(i: any) {
  return { id: i.id, email: i.email, role: i.role, token: i.token, status: i.status || "pending", createdAt: i.createdAt || null };
}

function dbCustomRole(r: any) {
  return {
    id: r.id, name: r.name || "", description: r.description || null,
    permissions: (Array.isArray(r.permissions) ? r.permissions : []) as any,
    createdAt: r.createdAt || null,
  };
}

function dbMediaItem(m: any) {
  return { id: m.id, name: m.name || "", dataUrl: m.dataUrl || null, type: m.type || null, usedAs: m.usedAs || null, uploadedAt: m.uploadedAt || null };
}

function dbBankAccount(b: any) {
  return { id: b.id, instructorId: b.instructorId, bankName: b.bankName, accountName: b.accountName, accountNumber: b.accountNumber, routingCode: b.routingCode || null, country: b.country || null };
}

function dbWithdrawal(w: any) {
  return { id: w.id, instructorId: w.instructorId, instructorName: w.instructorName || null, amount: parseFloat(w.amount) || 0, status: w.status || "pending", createdAt: w.createdAt || null };
}

function dbSubmission(s: any) {
  return {
    id: s.id, assignmentId: s.assignmentId || null, courseId: s.courseId || null,
    assignmentTitle: s.assignmentTitle || null, courseName: s.courseName || null,
    studentId: s.studentId || null, studentName: s.studentName || null,
    text: s.text || "", fileUrl: s.fileUrl || null,
    grade: s.grade || null, feedback: s.feedback || null,
    submittedAt: s.submittedAt || null, gradedAt: s.gradedAt || null,
    gradedBy: s.gradedBy || null,
  };
}

function dbWebinarPost(p: any) {
  return {
    id: p.id, title: p.title || "", content: p.content || "", type: p.type || null,
    authorId: p.authorId || null, authorName: p.authorName || null, authorRole: p.authorRole || null,
    tags: (Array.isArray(p.tags) ? p.tags : []) as any,
    createdAt: p.createdAt || null, pinned: !!p.pinned, views: parseInt(p.views) || 0,
  };
}

function dbQuizAttempt(a: any) {
  return { id: a.id, userId: a.userId, courseId: a.courseId || null, quizId: a.quizId || null, score: parseFloat(a.score) || 0, passed: !!a.passed, attemptedAt: a.attemptedAt || null };
}

function dbCertTemplate(t: any) {
  return {
    id: t.id, name: t.name || "", style: t.style || null,
    primaryColor: t.primaryColor || null, accentColor: t.accentColor || null,
    headerText: t.headerText || null, footerText: t.footerText || null,
    signatureLabel: t.signatureLabel || null,
    logoEnabled: t.logoEnabled !== false, badgeEnabled: t.badgeEnabled !== false,
    isDefault: !!t.isDefault, createdAt: t.createdAt || null,
  };
}

// ─── Field Mappers: MySQL row → state object shape ────────────────────────────

function mapUser(u: any) {
  return { ...u, updatedAt: undefined };
}

function mapCourse(c: any) {
  return { ...c, updatedAt: undefined };
}

function mapEnrollment(e: any) {
  return { ...e, updatedAt: undefined };
}

function mapMessage(m: any) {
  return { ...m };
}

function mapLog(l: any) {
  return { id: l.id, text: l.text, type: l.type, userId: l.userId, time: l.time || l.createdAt?.toISOString() };
}

function mapLearningPath(lp: any) {
  return { ...lp, updatedAt: undefined };
}

function mapEvent(ev: any) {
  return { ...ev };
}

function mapCustomRole(r: any) {
  return { ...r };
}

function mapWebinarPost(p: any) {
  return { ...p };
}
