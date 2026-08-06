import prisma from '../database/prismaClient.js';

/**
 * Resolve the current Student record for an authenticated user.
 * The Student.profile JSON stores the linked userId. Fall back to matching by email.
 */
export async function resolveStudentForUser(user) {
  if (!user) return null;
  const byEmail = await prisma.student.findUnique({ where: { email: user.email } });
  if (byEmail) return byEmail;

  const students = await prisma.student.findMany({
    where: { institutionId: user.institutionId || undefined },
  });
  const linked = students.find((s) => s.profile && s.profile.userId === user.id) || null;
  return linked;
}

export async function getStudentProfile(user) {
  const student = await resolveStudentForUser(user);
  if (!student) return null;
  return prisma.student.findUnique({
    where: { id: student.id },
    include: {
      department: true,
      institution: true,
      registrations: true,
      guardians: true,
      medicalRecords: true,
      documents: true,
      academicHistories: true,
    },
  });
}

export async function listAvailableCourses(user) {
  const student = await resolveStudentForUser(user);
  const institutionId = student?.institutionId || user?.institutionId;
  return prisma.course.findMany({
    where: { institutionId: institutionId || undefined },
    include: { department: true, faculty: true },
    orderBy: { code: 'asc' },
  });
}

export async function listRegisteredCourses(user) {
  const student = await resolveStudentForUser(user);
  if (!student) return [];
  const registrations = await prisma.courseRegistration.findMany({
    where: { studentId: student.id },
    include: {
      course: { include: { department: true, faculty: true } },
      session: true,
      semester: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return registrations.map((registration) => ({
    id: registration.id,
    registrationId: registration.id,
    courseId: registration.courseId,
    sessionId: registration.sessionId,
    semesterId: registration.semesterId,
    status: registration.status,
    approvalStatus: registration.approvalStatus,
    createdAt: registration.createdAt,
    title: registration.course?.title,
    code: registration.course?.code,
    creditHours: registration.course?.creditUnits,
    credits: registration.course?.creditUnits,
    course: registration.course,
    session: registration.session,
    semester: registration.semester,
  }));
}

export async function registerForCourse(user, { courseId, sessionId, semesterId }) {
  const student = await resolveStudentForUser(user);
  if (!student) {
    const err = new Error('Student profile not found for this account');
    err.status = 404;
    throw err;
  }
  if (!courseId) {
    const err = new Error('courseId is required');
    err.status = 400;
    throw err;
  }
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    const err = new Error('Course not found');
    err.status = 404;
    throw err;
  }
  const institutionId = student.institutionId || course.institutionId;
  const existing = await prisma.courseRegistration.findFirst({
    where: { studentId: student.id, courseId },
  });
  if (existing && existing.status !== 'DROPPED') return existing;

  let resolvedSemesterId = semesterId;
  let resolvedSessionId = sessionId;
  if (!resolvedSessionId) {
    const session = await prisma.academicSession.findFirst({ where: { institutionId, active: true } });
    resolvedSessionId = session?.id;
  }
  if (!resolvedSemesterId) {
    const semester = await prisma.semester.findFirst({ where: resolvedSessionId ? { sessionId: resolvedSessionId } : {} });
    resolvedSemesterId = semester?.id;
  }

  if (existing) {
    return prisma.courseRegistration.update({
      where: { id: existing.id },
      data: {
        status: 'ENROLLED',
        approvalStatus: 'PENDING',
        courseId,
        sessionId: resolvedSessionId,
        semesterId: resolvedSemesterId,
      },
    });
  }

  return prisma.courseRegistration.create({
    data: {
      studentId: student.id,
      courseId,
      institutionId,
      sessionId: resolvedSessionId,
      semesterId: resolvedSemesterId,
      status: 'ENROLLED',
      approvalStatus: 'PENDING',
    },
  });
}

export async function dropCourse(user, courseId) {
  const student = await resolveStudentForUser(user);
  if (!student) {
    const err = new Error('Student profile not found for this account');
    err.status = 404;
    throw err;
  }
  const registration = await prisma.courseRegistration.findFirst({
    where: { studentId: student.id, courseId },
  });
  if (!registration) {
    const err = new Error('Course registration not found');
    err.status = 404;
    throw err;
  }
  return prisma.courseRegistration.update({
    where: { id: registration.id },
    data: { status: 'DROPPED', approvalStatus: 'CANCELLED' },
  });
}

export async function listAssessments(user) {
  const student = await resolveStudentForUser(user);
  if (!student) return [];
  const registrations = await prisma.courseRegistration.findMany({
    where: { studentId: student.id, status: { not: 'DROPPED' } },
    select: { courseId: true },
  });
  const courseIds = registrations.map((r) => r.courseId);
  const assessments = await prisma.assessment.findMany({
    where: courseIds.length ? { courseId: { in: courseIds } } : {},
    include: { course: true, type: true, session: true, semester: true, scores: true },
    orderBy: { createdAt: 'desc' },
  });
  return assessments.map((assessment) => {
    const myScore = assessment.scores.find((s) => s.studentId === student.id);
    return {
      id: assessment.id,
      title: assessment.title,
      description: assessment.description,
      weight: assessment.weight,
      maxScore: assessment.maxScore,
      status: assessment.status,
      type: assessment.type?.name || assessment.typeId,
      course: assessment.course,
      courseId: assessment.courseId,
      session: assessment.session,
      semester: assessment.semester,
      date: assessment.createdAt,
      score: myScore?.score ?? null,
    };
  });
}

export async function listResults(user) {
  const student = await resolveStudentForUser(user);
  if (!student) return [];
  const results = await prisma.result.findMany({
    where: { studentId: student.id },
    include: { course: true, session: true, semester: true, approvedBy: true },
    orderBy: { createdAt: 'desc' },
  });
  return results.map((result) => ({
    id: result.id,
    studentId: result.studentId,
    courseId: result.courseId,
    sessionId: result.sessionId,
    semesterId: result.semesterId,
    score: result.score,
    grade: result.grade,
    gradePoint: result.gradePoint,
    carryOver: result.carryOver,
    status: result.status,
    remarks: result.remarks,
    course: result.course,
    session: result.session,
    semester: result.semester,
    creditHours: result.course?.creditUnits,
    credits: result.course?.creditUnits,
    code: result.course?.code,
    title: result.course?.title,
  }));
}

export async function listTranscriptRequests(user) {
  const student = await resolveStudentForUser(user);
  if (!student) return [];
  return prisma.transcriptRequest.findMany({
    where: { studentId: student.id },
    orderBy: { requestedAt: 'desc' },
  });
}

export async function createTranscriptRequest(user, data) {
  const student = await resolveStudentForUser(user);
  if (!student) {
    const err = new Error('Student profile not found for this account');
    err.status = 404;
    throw err;
  }
  return prisma.transcriptRequest.create({
    data: {
      studentId: student.id,
      institutionId: student.institutionId,
      requestedById: user.id,
      status: 'PENDING',
      remarks: data.purpose || data.remarks || null,
    },
  });
}

export async function listAcademicHistory(user) {
  const student = await resolveStudentForUser(user);
  if (!student) return [];
  const histories = await prisma.academicHistory.findMany({
    where: { studentId: student.id },
    include: { session: true, semester: true },
    orderBy: { createdAt: 'desc' },
  });
  return histories.map((history) => ({
    id: history.id,
    sessionId: history.sessionId,
    semesterId: history.semesterId,
    level: history.level,
    gpa: history.gpa,
    remarks: history.remarks,
    session: history.session,
    semester: history.semester,
    status: history.remarks || 'COMPLETED',
  }));
}

export async function getFeeStatus(user) {
  const student = await resolveStudentForUser(user);
  if (!student) return { summary: { totalCharged: 0, totalPaid: 0, balance: 0 }, items: [] };
  // No dedicated Fee model exists in the schema yet; return a safe empty structure.
  return { summary: { totalCharged: 0, totalPaid: 0, balance: 0 }, items: [] };
}

export async function listDocuments(user) {
  const student = await resolveStudentForUser(user);
  if (!student) return [];
  return prisma.document.findMany({ where: { studentId: student.id }, orderBy: { uploadedAt: 'desc' } });
}

export async function listNotifications(user) {
  const student = await resolveStudentForUser(user);
  const where = {};
  if (user?.id) where.userId = user.id;
  if (student?.id) where.studentId = student.id;
  if (user?.institutionId) where.institutionId = user.institutionId;
  return prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' } });
}

export async function listSupportTickets(user, data) {
  const student = await resolveStudentForUser(user);
  if (!student) return [];
  // No dedicated SupportTicket model; use AuditLog as a lightweight storage.
  const logs = await prisma.userAuditLog.findMany({
    where: { userId: user.id, action: 'support_ticket' },
    orderBy: { createdAt: 'desc' },
  });
  return logs.map((log) => ({
    id: log.id,
    subject: log.details || 'Support request',
    message: log.metadata?.message || '',
    status: log.metadata?.status || 'OPEN',
    createdAt: log.createdAt,
  }));
}

export async function createSupportTicket(user, { subject, message }) {
  if (!user?.id) {
    const err = new Error('Unauthenticated');
    err.status = 401;
    throw err;
  }
  return prisma.userAuditLog.create({
    data: {
      userId: user.id,
      action: 'support_ticket',
      details: subject || 'Support request',
      performedBy: user.id,
      metadata: { message: message || '', status: 'OPEN' },
    },
  });
}
