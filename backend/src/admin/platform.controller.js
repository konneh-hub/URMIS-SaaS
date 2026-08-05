import crypto from 'crypto';
import prisma from '../database/prismaClient.js';
import { recordUserAuditLog } from '../auth/auth.service.js';

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

export async function listAssessmentTypes(req, res, next) {
  try {
    const types = await prisma.assessmentType.findMany();
    res.json({ success: true, data: types });
  } catch (err) {
    next(err);
  }
}

export async function createAssessmentType(req, res, next) {
  try {
    const { name, description, institutionId } = req.body;
    const type = await prisma.assessmentType.create({ data: { name, description, institutionId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_assessment_type', details: type.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: type });
  } catch (err) {
    next(err);
  }
}

export async function updateAssessmentType(req, res, next) {
  try {
    const { typeId } = req.params;
    const { name, description } = req.body;
    const type = await prisma.assessmentType.update({ where: { id: typeId }, data: { name, description } });
    await recordUserAuditLog({ userId: req.user.id, action: 'update_assessment_type', details: typeId, performedBy: req.user.id });
    res.json({ success: true, data: type });
  } catch (err) {
    next(err);
  }
}

export async function deleteAssessmentType(req, res, next) {
  try {
    const { typeId } = req.params;
    await prisma.assessmentType.delete({ where: { id: typeId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'delete_assessment_type', details: typeId, performedBy: req.user.id });
    res.json({ success: true, message: 'Assessment type deleted' });
  } catch (err) {
    next(err);
  }
}

export async function listAssessments(req, res, next) {
  try {
    const assessments = await prisma.assessment.findMany({ include: { type: true, course: true, session: true, semester: true } });
    res.json({ success: true, data: assessments });
  } catch (err) {
    next(err);
  }
}

export async function createAssessment(req, res, next) {
  try {
    const { title, description, typeId, courseId, sessionId, semesterId, institutionId, weight, maxScore } = req.body;
    const assessment = await prisma.assessment.create({ data: { title, description, typeId, courseId, sessionId, semesterId, institutionId, weight, maxScore } });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_assessment', details: assessment.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: assessment });
  } catch (err) {
    next(err);
  }
}

export async function updateAssessment(req, res, next) {
  try {
    const { assessmentId } = req.params;
    const { title, description, typeId, courseId, sessionId, semesterId, weight, maxScore, status } = req.body;
    const assessment = await prisma.assessment.update({ where: { id: assessmentId }, data: { title, description, typeId, courseId, sessionId, semesterId, weight, maxScore, status } });
    await recordUserAuditLog({ userId: req.user.id, action: 'update_assessment', details: assessmentId, performedBy: req.user.id });
    res.json({ success: true, data: assessment });
  } catch (err) {
    next(err);
  }
}

export async function deleteAssessment(req, res, next) {
  try {
    const { assessmentId } = req.params;
    await prisma.assessment.delete({ where: { id: assessmentId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'delete_assessment', details: assessmentId, performedBy: req.user.id });
    res.json({ success: true, message: 'Assessment deleted' });
  } catch (err) {
    next(err);
  }
}

export async function listAssessmentScores(req, res, next) {
  try {
    const { assessmentId } = req.params;
    const where = assessmentId ? { assessmentId } : {};
    const scores = await prisma.assessmentScore.findMany({ where, include: { assessment: true, student: true } });
    res.json({ success: true, data: scores });
  } catch (err) {
    next(err);
  }
}

export async function createAssessmentScore(req, res, next) {
  try {
    const { assessmentId } = req.params;
    const { studentId, score, comments } = req.body;
    const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } });
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });
    const result = await prisma.assessmentScore.create({ data: { assessmentId, studentId, score, comments } });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_assessment_score', details: result.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function updateAssessmentScore(req, res, next) {
  try {
    const { scoreId } = req.params;
    const { score, comments } = req.body;
    const updated = await prisma.assessmentScore.update({ where: { id: scoreId }, data: { score, comments } });
    await recordUserAuditLog({ userId: req.user.id, action: 'update_assessment_score', details: scoreId, performedBy: req.user.id });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteAssessmentScore(req, res, next) {
  try {
    const { scoreId } = req.params;
    await prisma.assessmentScore.delete({ where: { id: scoreId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'delete_assessment_score', details: scoreId, performedBy: req.user.id });
    res.json({ success: true, message: 'Assessment score deleted' });
  } catch (err) {
    next(err);
  }
}

export async function listRegistrationWindows(req, res, next) {
  try {
    const windows = await prisma.registrationWindow.findMany();
    res.json({ success: true, data: windows });
  } catch (err) {
    next(err);
  }
}

export async function createRegistrationWindow(req, res, next) {
  try {
    const { name, institutionId, startDate, endDate, status } = req.body;
    const window = await prisma.registrationWindow.create({ data: { name, institutionId, startDate: new Date(startDate), endDate: new Date(endDate), status } });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_registration_window', details: window.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: window });
  } catch (err) {
    next(err);
  }
}

export async function updateRegistrationWindow(req, res, next) {
  try {
    const { windowId } = req.params;
    const { name, startDate, endDate, status } = req.body;
    const window = await prisma.registrationWindow.update({ where: { id: windowId }, data: { name, startDate: startDate ? new Date(startDate) : undefined, endDate: endDate ? new Date(endDate) : undefined, status } });
    await recordUserAuditLog({ userId: req.user.id, action: 'update_registration_window', details: windowId, performedBy: req.user.id });
    res.json({ success: true, data: window });
  } catch (err) {
    next(err);
  }
}

export async function deleteRegistrationWindow(req, res, next) {
  try {
    const { windowId } = req.params;
    await prisma.registrationWindow.delete({ where: { id: windowId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'delete_registration_window', details: windowId, performedBy: req.user.id });
    res.json({ success: true, message: 'Registration window deleted' });
  } catch (err) {
    next(err);
  }
}

export async function openRegistrationWindow(req, res, next) {
  try {
    const { windowId } = req.params;
    const window = await prisma.registrationWindow.update({ where: { id: windowId }, data: { status: 'OPEN' } });
    await recordUserAuditLog({ userId: req.user.id, action: 'open_registration_window', details: windowId, performedBy: req.user.id });
    res.json({ success: true, data: window });
  } catch (err) {
    next(err);
  }
}

export async function closeRegistrationWindow(req, res, next) {
  try {
    const { windowId } = req.params;
    const window = await prisma.registrationWindow.update({ where: { id: windowId }, data: { status: 'CLOSED' } });
    await recordUserAuditLog({ userId: req.user.id, action: 'close_registration_window', details: windowId, performedBy: req.user.id });
    res.json({ success: true, data: window });
  } catch (err) {
    next(err);
  }
}

export async function listResults(req, res, next) {
  try {
    const results = await prisma.result.findMany({ include: { student: true, course: true, session: true, semester: true, approvedBy: true } });
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
}

export async function createResult(req, res, next) {
  try {
    const { studentId, courseId, institutionId, sessionId, semesterId, score, remarks } = req.body;
    const { grade, gradePoint } = calculateGrade(score);
    const result = await prisma.result.create({ data: { studentId, courseId, institutionId, sessionId, semesterId, score, remarks, grade, gradePoint, carryOver: grade === 'F' } });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_result', details: result.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function updateResult(req, res, next) {
  try {
    const { resultId } = req.params;
    const { score, remarks, carryOver } = req.body;
    const updateData = { remarks, carryOver };
    if (score !== undefined) {
      const { grade, gradePoint } = calculateGrade(score);
      updateData.score = score;
      updateData.grade = grade;
      updateData.gradePoint = gradePoint;
      updateData.carryOver = grade === 'F';
    }
    const result = await prisma.result.update({ where: { id: resultId }, data: updateData });
    await recordUserAuditLog({ userId: req.user.id, action: 'update_result', details: resultId, performedBy: req.user.id });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function approveResult(req, res, next) {
  try {
    const { resultId } = req.params;
    const result = await prisma.result.update({ where: { id: resultId }, data: { status: 'APPROVED', approvedById: req.user.id, approvedAt: new Date() } });
    await recordUserAuditLog({ userId: req.user.id, action: 'approve_result', details: resultId, performedBy: req.user.id });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function publishResult(req, res, next) {
  try {
    const { resultId } = req.params;
    const result = await prisma.result.update({ where: { id: resultId }, data: { status: 'PUBLISHED' } });
    await recordUserAuditLog({ userId: req.user.id, action: 'publish_result', details: resultId, performedBy: req.user.id });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function lockResult(req, res, next) {
  try {
    const { resultId } = req.params;
    const result = await prisma.result.update({ where: { id: resultId }, data: { locked: true } });
    await recordUserAuditLog({ userId: req.user.id, action: 'lock_result', details: resultId, performedBy: req.user.id });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function correctResult(req, res, next) {
  try {
    const { resultId } = req.params;
    const { score, remarks } = req.body;
    const updateData = { remarks };
    if (score !== undefined) {
      const { grade, gradePoint } = calculateGrade(score);
      updateData.score = score;
      updateData.grade = grade;
      updateData.gradePoint = gradePoint;
      updateData.carryOver = grade === 'F';
    }
    const result = await prisma.result.update({ where: { id: resultId }, data: updateData });
    await recordUserAuditLog({ userId: req.user.id, action: 'correct_result', details: resultId, performedBy: req.user.id });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getAcademicSummary(req, res, next) {
  try {
    const { studentId, sessionId } = req.params;
    const where = { studentId };
    if (sessionId) where.sessionId = sessionId;
    const results = await prisma.result.findMany({ where });
    const gpa = calculateGpa(results);
    const cgpa = calculateCgpa(results);
    const carryOverCount = results.filter((result) => result.carryOver).length;
    res.json({ success: true, data: { gpa, cgpa, carryOverCount, totalResults: results.length, results } });
  } catch (err) {
    next(err);
  }
}

export async function listTranscriptRequests(req, res, next) {
  try {
    const requests = await prisma.transcriptRequest.findMany({ include: { student: true, requestedBy: true } });
    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
}

export async function createTranscriptRequest(req, res, next) {
  try {
    const { studentId, institutionId, requestedById, remarks } = req.body;
    const request = await prisma.transcriptRequest.create({ data: { studentId, institutionId, requestedById, remarks } });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_transcript_request', details: request.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
}

export async function approveTranscriptRequest(req, res, next) {
  try {
    const { requestId } = req.params;
    const request = await prisma.transcriptRequest.update({ where: { id: requestId }, data: { status: 'APPROVED', processedAt: new Date() } });
    await recordUserAuditLog({ userId: req.user.id, action: 'approve_transcript_request', details: requestId, performedBy: req.user.id });
    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
}

export async function rejectTranscriptRequest(req, res, next) {
  try {
    const { requestId } = req.params;
    const request = await prisma.transcriptRequest.update({ where: { id: requestId }, data: { status: 'REJECTED', processedAt: new Date() } });
    await recordUserAuditLog({ userId: req.user.id, action: 'reject_transcript_request', details: requestId, performedBy: req.user.id });
    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
}

export async function generateTranscript(req, res, next) {
  try {
    const { requestId } = req.params;
    const transcript = await prisma.transcriptRequest.findUnique({ where: { id: requestId }, include: { student: true, institution: true } });
    if (!transcript) return res.status(404).json({ success: false, message: 'Transcript request not found' });
    const pdfUrl = `https://files.example.com/transcripts/${requestId}.pdf`;
    const digitalSignature = crypto.createHash('sha256').update(`${requestId}:${Date.now()}`).digest('hex');
    const qrCode = Buffer.from(`${requestId}:${digitalSignature}`).toString('base64');
    const updated = await prisma.transcriptRequest.update({ where: { id: requestId }, data: { status: 'COMPLETED', pdfUrl, digitalSignature, qrCode, processedAt: new Date() } });
    await recordUserAuditLog({ userId: req.user.id, action: 'generate_transcript', details: requestId, performedBy: req.user.id });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function verifyTranscript(req, res, next) {
  try {
    const { requestId } = req.params;
    const request = await prisma.transcriptRequest.findUnique({ where: { id: requestId } });
    if (!request) return res.status(404).json({ success: false, message: 'Transcript request not found' });
    const valid = Boolean(request.digitalSignature && request.qrCode && request.pdfUrl);
    res.json({ success: true, data: { valid, request } });
  } catch (err) {
    next(err);
  }
}

export async function listGraduationClearances(req, res, next) {
  try {
    const clearances = await prisma.graduationClearance.findMany({ include: { student: true, clearedBy: true } });
    res.json({ success: true, data: clearances });
  } catch (err) {
    next(err);
  }
}

export async function createGraduationClearance(req, res, next) {
  try {
    const { studentId, institutionId, status, notes, clearedById } = req.body;
    const clearance = await prisma.graduationClearance.create({ data: { studentId, institutionId, status, notes, clearedById } });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_graduation_clearance', details: clearance.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: clearance });
  } catch (err) {
    next(err);
  }
}

export async function updateGraduationClearance(req, res, next) {
  try {
    const { clearanceId } = req.params;
    const { status, notes, clearedById } = req.body;
    const clearance = await prisma.graduationClearance.update({ where: { id: clearanceId }, data: { status, notes, clearedById } });
    await recordUserAuditLog({ userId: req.user.id, action: 'update_graduation_clearance', details: clearanceId, performedBy: req.user.id });
    res.json({ success: true, data: clearance });
  } catch (err) {
    next(err);
  }
}

export async function listGraduationLists(req, res, next) {
  try {
    const lists = await prisma.graduationList.findMany({ include: { institution: true, session: true } });
    res.json({ success: true, data: lists });
  } catch (err) {
    next(err);
  }
}

export async function createGraduationList(req, res, next) {
  try {
    const { institutionId, sessionId, title, graduationDate } = req.body;
    const studentCount = Number(req.body.studentCount || 0);
    const list = await prisma.graduationList.create({ data: { institutionId, sessionId, title, graduationDate: new Date(graduationDate), studentCount } });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_graduation_list', details: list.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
}

export async function createCertificate(req, res, next) {
  try {
    const { studentId, graduationListId, certificateUrl, remarks } = req.body;
    const certificate = await prisma.certificate.create({ data: { studentId, graduationListId, certificateUrl, remarks } });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_certificate', details: certificate.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: certificate });
  } catch (err) {
    next(err);
  }
}

export async function listCertificates(req, res, next) {
  try {
    const certificates = await prisma.certificate.findMany({ include: { student: true, graduationList: true } });
    res.json({ success: true, data: certificates });
  } catch (err) {
    next(err);
  }
}

export async function calculateGraduationEligibility(req, res, next) {
  try {
    const { studentId } = req.params;
    const [results, histories] = await Promise.all([
      prisma.result.findMany({ where: { studentId } }),
      prisma.academicHistory.findMany({ where: { studentId } }),
    ]);
    const cgpa = calculateCgpa(results);
    const ineligible = results.some((result) => result.carryOver);
    const eligible = !ineligible && cgpa >= 2.5 && histories.length > 0;
    res.json({ success: true, data: { studentId, eligible, cgpa, hasCarryOver: ineligible, academicHistories: histories } });
  } catch (err) {
    next(err);
  }
}

export async function listNotificationTemplates(req, res, next) {
  try {
    const templates = await prisma.notificationTemplate.findMany();
    res.json({ success: true, data: templates });
  } catch (err) {
    next(err);
  }
}

export async function createNotificationTemplate(req, res, next) {
  try {
    const { institutionId, name, subject, body, channel } = req.body;
    const template = await prisma.notificationTemplate.create({ data: { institutionId, name, subject, body, channel } });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_notification_template', details: template.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
}

export async function updateNotificationTemplate(req, res, next) {
  try {
    const { templateId } = req.params;
    const { name, subject, body, channel } = req.body;
    const template = await prisma.notificationTemplate.update({ where: { id: templateId }, data: { name, subject, body, channel } });
    await recordUserAuditLog({ userId: req.user.id, action: 'update_notification_template', details: templateId, performedBy: req.user.id });
    res.json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
}

export async function deleteNotificationTemplate(req, res, next) {
  try {
    const { templateId } = req.params;
    await prisma.notificationTemplate.delete({ where: { id: templateId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'delete_notification_template', details: templateId, performedBy: req.user.id });
    res.json({ success: true, message: 'Notification template deleted' });
  } catch (err) {
    next(err);
  }
}

export async function listNotifications(req, res, next) {
  try {
    const notifications = await prisma.notification.findMany({ include: { user: true, student: true, institution: true, template: true } });
    res.json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
}

export async function sendNotification(req, res, next) {
  try {
    const { userId, studentId, institutionId, templateId, title, message, channel, metadata } = req.body;
    const notification = await prisma.notification.create({ data: { userId, studentId, institutionId, templateId, title, message, channel, metadata, status: 'SENT', sentAt: new Date() } });
    await recordUserAuditLog({ userId: req.user.id, action: 'send_notification', details: notification.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
}

export async function scheduleNotification(req, res, next) {
  try {
    const { templateId, sendAt } = req.body;
    const scheduled = await prisma.scheduledNotification.create({ data: { templateId, sendAt: new Date(sendAt), status: 'PENDING' } });
    await recordUserAuditLog({ userId: req.user.id, action: 'schedule_notification', details: scheduled.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: scheduled });
  } catch (err) {
    next(err);
  }
}

export async function listScheduledNotifications(req, res, next) {
  try {
    const scheduled = await prisma.scheduledNotification.findMany({ include: { template: true } });
    res.json({ success: true, data: scheduled });
  } catch (err) {
    next(err);
  }
}

export async function listPlans(req, res, next) {
  try {
    const plans = await prisma.plan.findMany();
    res.json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
}

export async function createPlan(req, res, next) {
  try {
    const { name, description, priceCents, currency, interval, trialDays, features, active } = req.body;
    const plan = await prisma.plan.create({ data: { name, description, priceCents, currency, interval, trialDays, features, active } });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_plan', details: plan.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
}

export async function updatePlan(req, res, next) {
  try {
    const { planId } = req.params;
    const { name, description, priceCents, currency, interval, trialDays, features, active } = req.body;
    const plan = await prisma.plan.update({ where: { id: planId }, data: { name, description, priceCents, currency, interval, trialDays, features, active } });
    await recordUserAuditLog({ userId: req.user.id, action: 'update_plan', details: planId, performedBy: req.user.id });
    res.json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
}

export async function listCoupons(req, res, next) {
  try {
    const coupons = await prisma.coupon.findMany();
    res.json({ success: true, data: coupons });
  } catch (err) {
    next(err);
  }
}

export async function createCoupon(req, res, next) {
  try {
    const { code, description, discountPct, active, expiresAt, usageLimit } = req.body;
    const coupon = await prisma.coupon.create({ data: { code, description, discountPct, active, expiresAt: expiresAt ? new Date(expiresAt) : null, usageLimit } });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_coupon', details: coupon.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    next(err);
  }
}

export async function listInvoices(req, res, next) {
  try {
    const invoices = await prisma.invoice.findMany({ include: { institution: true, plan: true, coupon: true, payments: true } });
    res.json({ success: true, data: invoices });
  } catch (err) {
    next(err);
  }
}

export async function createInvoice(req, res, next) {
  try {
    const { institutionId, planId, couponId, amountCents, currency, dueDate } = req.body;
    const invoice = await prisma.invoice.create({ data: { institutionId, planId, couponId, amountCents, currency, dueDate: new Date(dueDate) } });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_invoice', details: invoice.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
}

export async function listPayments(req, res, next) {
  try {
    const payments = await prisma.payment.findMany({ include: { invoice: true, institution: true } });
    res.json({ success: true, data: payments });
  } catch (err) {
    next(err);
  }
}

export async function createPayment(req, res, next) {
  try {
    const { invoiceId, institutionId, amountCents, currency, method, transactionId, status, paidAt } = req.body;
    const payment = await prisma.payment.create({ data: { invoiceId, institutionId, amountCents, currency, method, transactionId, status, paidAt: paidAt ? new Date(paidAt) : null } });
    if (status === 'PAID') {
      await prisma.invoice.update({ where: { id: invoiceId }, data: { status: 'PAID', paidAt: paidAt ? new Date(paidAt) : new Date() } });
    }
    await recordUserAuditLog({ userId: req.user.id, action: 'create_payment', details: payment.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
}

export async function listHealthChecks(req, res, next) {
  try {
    const checks = await prisma.healthCheck.findMany({ include: { institution: true } });
    res.json({ success: true, data: checks });
  } catch (err) {
    next(err);
  }
}

export async function createHealthCheck(req, res, next) {
  try {
    const { institutionId, category, status, details } = req.body;
    const check = await prisma.healthCheck.create({ data: { institutionId, category, status, details } });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_health_check', details: check.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: check });
  } catch (err) {
    next(err);
  }
}

export async function listSecurityAlerts(req, res, next) {
  try {
    const alerts = await prisma.securityAlert.findMany({ include: { user: true, institution: true } });
    res.json({ success: true, data: alerts });
  } catch (err) {
    next(err);
  }
}

export async function createSecurityAlert(req, res, next) {
  try {
    const { userId, institutionId, type, severity, message, metadata } = req.body;
    const alert = await prisma.securityAlert.create({ data: { userId, institutionId, type, severity, message, metadata } });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_security_alert', details: alert.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: alert });
  } catch (err) {
    next(err);
  }
}

export async function resolveSecurityAlert(req, res, next) {
  try {
    const { alertId } = req.params;
    const alert = await prisma.securityAlert.update({ where: { id: alertId }, data: { resolvedAt: new Date() } });
    await recordUserAuditLog({ userId: req.user.id, action: 'resolve_security_alert', details: alertId, performedBy: req.user.id });
    res.json({ success: true, data: alert });
  } catch (err) {
    next(err);
  }
}

export async function listUserSessions(req, res, next) {
  try {
    const { userId } = req.query;
    const sessions = await prisma.userSession.findMany({ where: userId ? { userId } : {} });
    res.json({ success: true, data: sessions });
  } catch (err) {
    next(err);
  }
}

export async function revokeSession(req, res, next) {
  try {
    const { sessionId } = req.params;
    await prisma.userSession.delete({ where: { id: sessionId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'revoke_session', details: sessionId, performedBy: req.user.id });
    res.json({ success: true, message: 'Session revoked' });
  } catch (err) {
    next(err);
  }
}

export async function listLoginHistory(req, res, next) {
  try {
    const { userId } = req.query;
    const history = await prisma.userLoginHistory.findMany({ where: userId ? { userId } : {}, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
}

export async function getAcademicReport(req, res, next) {
  try {
    const totalCourses = await prisma.course.count();
    const totalStudents = await prisma.student.count();
    const totalAssessments = await prisma.assessment.count();
    const resultSummary = await prisma.result.groupBy({ by: ['status'], _count: { _all: true } });
    res.json({ success: true, data: { totalCourses, totalStudents, totalAssessments, resultSummary } });
  } catch (err) {
    next(err);
  }
}

export async function getStudentReport(req, res, next) {
  try {
    const { studentId } = req.query;
    const where = studentId ? { id: studentId } : {};
    const students = await prisma.student.findMany({ where, include: { registrations: true, academicHistories: true, results: true } });
    res.json({ success: true, data: students });
  } catch (err) {
    next(err);
  }
}

export async function getStaffReport(req, res, next) {
  try {
    const assignmentCounts = await prisma.staffAssignment.groupBy({ by: ['staffId'], _count: { _all: true } });
    res.json({ success: true, data: assignmentCounts });
  } catch (err) {
    next(err);
  }
}

export async function getResultReport(req, res, next) {
  try {
    const results = await prisma.result.groupBy({ by: ['grade', 'status'], _count: { _all: true } });
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
}

export async function getInstitutionReport(req, res, next) {
  try {
    const institutions = await prisma.institution.findMany({ include: { statistics: true } });
    res.json({ success: true, data: institutions });
  } catch (err) {
    next(err);
  }
}

export async function getAnalyticsReport(req, res, next) {
  try {
    const registrationsByStatus = await prisma.courseRegistration.groupBy({ by: ['status'], _count: { _all: true } });
    const resultsByStatus = await prisma.result.groupBy({ by: ['status'], _count: { _all: true } });
    const notificationsByStatus = await prisma.notification.groupBy({ by: ['status'], _count: { _all: true } });
    res.json({ success: true, data: { registrationsByStatus, resultsByStatus, notificationsByStatus } });
  } catch (err) {
    next(err);
  }
}

export async function exportReport(req, res, next) {
  try {
    const { type } = req.params;
    let data;
    switch (type) {
      case 'students':
        data = await prisma.student.findMany({ include: { department: true, institution: true } });
        break;
      case 'results':
        data = await prisma.result.findMany({ include: { student: true, course: true, session: true, semester: true } });
        break;
      default:
        return res.status(400).json({ success: false, message: 'Unsupported export type' });
    }
    const headers = Object.keys(data[0] || {});
    const csv = buildCsv(headers, data);
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
  } catch (err) {
    next(err);
  }
}
