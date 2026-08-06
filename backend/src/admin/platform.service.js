import crypto from 'crypto';
import prisma from '../database/prismaClient.js';

function calculateGrade(score) {
  if (score >= 70) return { grade: 'A', gradePoint: 5.0 };
  if (score >= 60) return { grade: 'B', gradePoint: 4.0 };
  if (score >= 50) return { grade: 'C', gradePoint: 3.0 };
  if (score >= 45) return { grade: 'D', gradePoint: 2.0 };
  if (score >= 40) return { grade: 'E', gradePoint: 1.0 };
  return { grade: 'F', gradePoint: 0.0 };
}

function calculateGpa(results) {
  if (!results || results.length === 0) return 0;
  const total = results.reduce((sum, result) => sum + (result.gradePoint ?? 0), 0);
  return Number((total / results.length).toFixed(2));
}

function calculateCgpa(results) {
  return calculateGpa(results);
}

function buildCsv(headers, rows) {
  const csvRows = [headers.join(',')];
  rows.forEach((row) => {
    csvRows.push(headers.map((header) => JSON.stringify(row[header] ?? '')).join(','));
  });
  return csvRows.join('\n');
}

export async function listAssessmentTypes() {
  return prisma.assessmentType.findMany();
}

export async function createAssessmentType(data) {
  return prisma.assessmentType.create({ data });
}

export async function updateAssessmentType(typeId, data) {
  return prisma.assessmentType.update({ where: { id: typeId }, data });
}

export async function deleteAssessmentType(typeId) {
  return prisma.assessmentType.delete({ where: { id: typeId } });
}

export async function listAssessments() {
  return prisma.assessment.findMany({ include: { type: true, course: true, session: true, semester: true } });
}

export async function createAssessment(data) {
  return prisma.assessment.create({ data });
}

export async function updateAssessment(assessmentId, data) {
  return prisma.assessment.update({ where: { id: assessmentId }, data });
}

export async function deleteAssessment(assessmentId) {
  return prisma.assessment.delete({ where: { id: assessmentId } });
}

export async function listAssessmentScores(assessmentId) {
  const where = assessmentId ? { assessmentId } : {};
  return prisma.assessmentScore.findMany({ where, include: { assessment: true, student: true } });
}

export async function createAssessmentScore(assessmentId, data) {
  const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } });
  if (!assessment) return null;
  return prisma.assessmentScore.create({ data: { assessmentId, ...data } });
}

export async function updateAssessmentScore(scoreId, data) {
  return prisma.assessmentScore.update({ where: { id: scoreId }, data });
}

export async function deleteAssessmentScore(scoreId) {
  return prisma.assessmentScore.delete({ where: { id: scoreId } });
}

export async function listRegistrationWindows() {
  return prisma.registrationWindow.findMany();
}

export async function createRegistrationWindow(data) {
  return prisma.registrationWindow.create({ data });
}

export async function updateRegistrationWindow(windowId, data) {
  return prisma.registrationWindow.update({ where: { id: windowId }, data });
}

export async function deleteRegistrationWindow(windowId) {
  return prisma.registrationWindow.delete({ where: { id: windowId } });
}

export async function openRegistrationWindow(windowId) {
  return prisma.registrationWindow.update({ where: { id: windowId }, data: { status: 'OPEN' } });
}

export async function closeRegistrationWindow(windowId) {
  return prisma.registrationWindow.update({ where: { id: windowId }, data: { status: 'CLOSED' } });
}

function ensureTenantAccess(resourceInstitutionId, user) {
  if (['SYSTEM_ADMIN', 'UNIVERSITY_ADMIN'].includes(user.role)) return;
  if (!user.institutionId || user.institutionId !== resourceInstitutionId) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
}

function ensureResultEditable(result) {
  if (!result) {
    const err = new Error('Result not found');
    err.status = 404;
    throw err;
  }
  if (result.locked) {
    const err = new Error('Result is locked');
    err.status = 400;
    throw err;
  }
  if (result.status === 'PUBLISHED') {
    const err = new Error('Published results cannot be modified');
    err.status = 400;
    throw err;
  }
}

export async function listResults(user) {
  const where = {};
  if (!['SYSTEM_ADMIN', 'UNIVERSITY_ADMIN'].includes(user.role)) {
    where.institutionId = user.institutionId;
  }
  return prisma.result.findMany({ where, include: { student: true, course: true, session: true, semester: true, approvedBy: true } });
}

export async function createResult(data, user) {
  if (!user) {
    const err = new Error('Unauthenticated');
    err.status = 401;
    throw err;
  }

  const institutionId = data.institutionId || user.institutionId;
  if (!institutionId) {
    const err = new Error('Institution is required');
    err.status = 400;
    throw err;
  }
  ensureTenantAccess(institutionId, user);

  const { score } = data;
  const { grade, gradePoint } = calculateGrade(score);
  return prisma.result.create({
    data: {
      ...data,
      institutionId,
      grade,
      gradePoint,
      carryOver: grade === 'F',
      status: 'PENDING',
    },
  });
}

export async function updateResult(resultId, data, user) {
  const existing = await prisma.result.findUnique({ where: { id: resultId } });
  ensureTenantAccess(existing?.institutionId, user);
  ensureResultEditable(existing);

  if (data.score !== undefined) {
    const { grade, gradePoint } = calculateGrade(data.score);
    data.grade = grade;
    data.gradePoint = gradePoint;
    data.carryOver = grade === 'F';
  }
  return prisma.result.update({ where: { id: resultId }, data });
}

export async function approveResult(resultId, user) {
  const existing = await prisma.result.findUnique({ where: { id: resultId } });
  ensureTenantAccess(existing?.institutionId, user);
  if (!existing) {
    const err = new Error('Result not found');
    err.status = 404;
    throw err;
  }
  if (existing.locked) {
    const err = new Error('Result is locked');
    err.status = 400;
    throw err;
  }
  if (existing.status === 'PUBLISHED') {
    const err = new Error('Result is already published');
    err.status = 400;
    throw err;
  }
  return prisma.result.update({ where: { id: resultId }, data: { status: 'APPROVED', approvedById: user.id, approvedAt: new Date() } });
}

export async function publishResult(resultId, user) {
  const existing = await prisma.result.findUnique({ where: { id: resultId } });
  ensureTenantAccess(existing?.institutionId, user);
  if (!existing) {
    const err = new Error('Result not found');
    err.status = 404;
    throw err;
  }
  if (existing.locked) {
    const err = new Error('Result is locked');
    err.status = 400;
    throw err;
  }
  if (existing.status !== 'APPROVED') {
    const err = new Error('Only approved results can be published');
    err.status = 400;
    throw err;
  }
  return prisma.result.update({ where: { id: resultId }, data: { status: 'PUBLISHED' } });
}

export async function lockResult(resultId, user) {
  const existing = await prisma.result.findUnique({ where: { id: resultId } });
  ensureTenantAccess(existing?.institutionId, user);
  if (!existing) {
    const err = new Error('Result not found');
    err.status = 404;
    throw err;
  }
  if (existing.status !== 'PUBLISHED') {
    const err = new Error('Only published results can be locked');
    err.status = 400;
    throw err;
  }
  return prisma.result.update({ where: { id: resultId }, data: { locked: true } });
}

export async function correctResult(resultId, data, user) {
  const existing = await prisma.result.findUnique({ where: { id: resultId } });
  ensureTenantAccess(existing?.institutionId, user);
  if (!existing) {
    const err = new Error('Result not found');
    err.status = 404;
    throw err;
  }
  if (existing.locked || existing.status === 'PUBLISHED') {
    const err = new Error('Cannot correct a locked or published result');
    err.status = 400;
    throw err;
  }
  if (data.score !== undefined) {
    const { grade, gradePoint } = calculateGrade(data.score);
    data.grade = grade;
    data.gradePoint = gradePoint;
    data.carryOver = grade === 'F';
  }
  return prisma.result.update({ where: { id: resultId }, data });
}

export async function getAcademicSummary(studentId, sessionId, user) {
  const where = { studentId };
  if (sessionId) where.sessionId = sessionId;
  if (user.role === 'STUDENT') {
    if (user.studentId !== studentId) {
      const err = new Error('Forbidden');
      err.status = 403;
      throw err;
    }
  } else if (!['SYSTEM_ADMIN', 'UNIVERSITY_ADMIN'].includes(user.role)) {
    where.institutionId = user.institutionId;
  }
  const results = await prisma.result.findMany({ where });
  const gpa = calculateGpa(results);
  const cgpa = calculateCgpa(results);
  const carryOverCount = results.filter((result) => result.carryOver).length;
  return { gpa, cgpa, carryOverCount, totalResults: results.length, results };
}

export async function listTranscriptRequests() {
  return prisma.transcriptRequest.findMany({ include: { student: true, requestedBy: true } });
}

export async function createTranscriptRequest(data) {
  return prisma.transcriptRequest.create({ data });
}

export async function approveTranscriptRequest(requestId) {
  return prisma.transcriptRequest.update({ where: { id: requestId }, data: { status: 'APPROVED', processedAt: new Date() } });
}

export async function rejectTranscriptRequest(requestId) {
  return prisma.transcriptRequest.update({ where: { id: requestId }, data: { status: 'REJECTED', processedAt: new Date() } });
}

export async function generateTranscript(requestId) {
  const transcript = await prisma.transcriptRequest.findUnique({ where: { id: requestId }, include: { student: true, institution: true } });
  if (!transcript) return null;
  const pdfUrl = `https://files.example.com/transcripts/${requestId}.pdf`;
  const digitalSignature = crypto.createHash('sha256').update(`${requestId}:${Date.now()}`).digest('hex');
  const qrCode = Buffer.from(`${requestId}:${digitalSignature}`).toString('base64');
  return prisma.transcriptRequest.update({
    where: { id: requestId },
    data: { status: 'COMPLETED', pdfUrl, digitalSignature, qrCode, processedAt: new Date() },
  });
}

export async function getTranscriptRequest(requestId) {
  return prisma.transcriptRequest.findUnique({ where: { id: requestId } });
}

export async function listGraduationClearances() {
  return prisma.graduationClearance.findMany({ include: { student: true, clearedBy: true } });
}

export async function createGraduationClearance(data) {
  return prisma.graduationClearance.create({ data });
}

export async function updateGraduationClearance(clearanceId, data) {
  return prisma.graduationClearance.update({ where: { id: clearanceId }, data });
}

export async function listGraduationLists() {
  return prisma.graduationList.findMany({ include: { institution: true, session: true } });
}

export async function createGraduationList(data) {
  return prisma.graduationList.create({ data });
}

export async function listCertificates() {
  return prisma.certificate.findMany({ include: { student: true, graduationList: true } });
}

export async function createCertificate(data) {
  return prisma.certificate.create({ data });
}

export async function calculateGraduationEligibility(studentId) {
  const [results, histories] = await Promise.all([
    prisma.result.findMany({ where: { studentId } }),
    prisma.academicHistory.findMany({ where: { studentId } }),
  ]);
  const cgpa = calculateCgpa(results);
  const ineligible = results.some((result) => result.carryOver);
  const eligible = !ineligible && cgpa >= 2.5 && histories.length > 0;
  return { studentId, eligible, cgpa, hasCarryOver: ineligible, academicHistories: histories };
}

export async function listNotificationTemplates() {
  return prisma.notificationTemplate.findMany();
}

export async function createNotificationTemplate(data) {
  return prisma.notificationTemplate.create({ data });
}

export async function updateNotificationTemplate(templateId, data) {
  return prisma.notificationTemplate.update({ where: { id: templateId }, data });
}

export async function deleteNotificationTemplate(templateId) {
  return prisma.notificationTemplate.delete({ where: { id: templateId } });
}

export async function listNotifications() {
  return prisma.notification.findMany({ include: { user: true, student: true, institution: true, template: true } });
}

export async function sendNotification(data) {
  return prisma.notification.create({ data: { ...data, status: 'SENT', sentAt: new Date() } });
}

export async function listScheduledNotifications() {
  return prisma.scheduledNotification.findMany({ include: { template: true } });
}

export async function scheduleNotification(data) {
  return prisma.scheduledNotification.create({ data: { ...data, status: 'PENDING' } });
}

export async function listPlans() {
  return prisma.plan.findMany();
}

export async function createPlan(data) {
  return prisma.plan.create({ data });
}

export async function updatePlan(planId, data) {
  return prisma.plan.update({ where: { id: planId }, data });
}

export async function listCoupons() {
  return prisma.coupon.findMany();
}

export async function createCoupon(data) {
  return prisma.coupon.create({ data });
}

export async function listInvoices() {
  return prisma.invoice.findMany({ include: { institution: true, plan: true, coupon: true, payments: true } });
}

export async function createInvoice(data) {
  return prisma.invoice.create({ data });
}

export async function listPayments() {
  return prisma.payment.findMany({ include: { invoice: true, institution: true } });
}

export async function createPayment(data) {
  const payment = await prisma.payment.create({ data: { ...data, paidAt: data.paidAt ? new Date(data.paidAt) : null } });
  if (data.status === 'PAID') {
    await prisma.invoice.update({ where: { id: data.invoiceId }, data: { status: 'PAID', paidAt: data.paidAt ? new Date(data.paidAt) : new Date() } });
  }
  return payment;
}

export async function listHealthChecks() {
  return prisma.healthCheck.findMany({ include: { institution: true } });
}

export async function createHealthCheck(data) {
  return prisma.healthCheck.create({ data });
}

export async function listSecurityAlerts() {
  return prisma.securityAlert.findMany({ include: { user: true, institution: true } });
}

export async function createSecurityAlert(data) {
  return prisma.securityAlert.create({ data });
}

export async function resolveSecurityAlert(alertId) {
  return prisma.securityAlert.update({ where: { id: alertId }, data: { resolvedAt: new Date() } });
}

export async function listUserSessions(userId) {
  return prisma.userSession.findMany({ where: userId ? { userId } : {} });
}

export async function revokeSession(sessionId) {
  return prisma.userSession.delete({ where: { id: sessionId } });
}

export async function listLoginHistory(userId) {
  return prisma.userLoginHistory.findMany({ where: userId ? { userId } : {}, orderBy: { createdAt: 'desc' } });
}

export async function getAcademicReport() {
  const totalCourses = await prisma.course.count();
  const totalStudents = await prisma.student.count();
  const totalAssessments = await prisma.assessment.count();
  const resultSummary = await prisma.result.groupBy({ by: ['status'], _count: { _all: true } });
  return { totalCourses, totalStudents, totalAssessments, resultSummary };
}

export async function getStudentReport(studentId) {
  const where = studentId ? { id: studentId } : {};
  return prisma.student.findMany({ where, include: { registrations: true, academicHistories: true, results: true } });
}

export async function getStaffReport() {
  return prisma.staffAssignment.groupBy({ by: ['staffId'], _count: { _all: true } });
}

export async function getResultReport() {
  return prisma.result.groupBy({ by: ['grade', 'status'], _count: { _all: true } });
}

export async function getInstitutionReport() {
  return prisma.institution.findMany({ include: { statistics: true } });
}

export async function getAnalyticsReport() {
  const registrationsByStatus = await prisma.courseRegistration.groupBy({ by: ['status'], _count: { _all: true } });
  const resultsByStatus = await prisma.result.groupBy({ by: ['status'], _count: { _all: true } });
  const notificationsByStatus = await prisma.notification.groupBy({ by: ['status'], _count: { _all: true } });
  return { registrationsByStatus, resultsByStatus, notificationsByStatus };
}

export async function exportReport(type) {
  let data;
  switch (type) {
    case 'students':
      data = await prisma.student.findMany({ include: { department: true, institution: true } });
      break;
    case 'results':
      data = await prisma.result.findMany({ include: { student: true, course: true, session: true, semester: true } });
      break;
    default:
      return null;
  }

  const headers = Object.keys(data[0] || {});
  const csv = buildCsv(headers, data);
  return { headers, csv };
}
