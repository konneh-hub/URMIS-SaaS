import * as platformService from './platform.service.js';
import { recordUserAuditLog } from '../auth/auth.service.js';

export async function listAssessmentTypes(req, res, next) {
  try {
    const types = await platformService.listAssessmentTypes();
    res.json({ success: true, data: types });
  } catch (err) {
    next(err);
  }
}

export async function createAssessmentType(req, res, next) {
  try {
    const type = await platformService.createAssessmentType(req.body);
    if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'create_assessment_type', details: type.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: type });
  } catch (err) {
    next(err);
  }
}

export async function updateAssessmentType(req, res, next) {
  try {
    const type = await platformService.updateAssessmentType(req.params.typeId, req.body);
    if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'update_assessment_type', details: req.params.typeId, performedBy: req.user.id });
    res.json({ success: true, data: type });
  } catch (err) {
    next(err);
  }
}

export async function deleteAssessmentType(req, res, next) {
  try {
    await platformService.deleteAssessmentType(req.params.typeId);
    if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'delete_assessment_type', details: req.params.typeId, performedBy: req.user.id });
    res.json({ success: true, message: 'Assessment type deleted' });
  } catch (err) {
    next(err);
  }
}

export async function listAssessments(req, res, next) {
  try { res.json({ success: true, data: await platformService.listAssessments() }); } catch (err) { next(err); }
}

export async function createAssessment(req, res, next) {
  try {
    const assessment = await platformService.createAssessment(req.body);
    if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'create_assessment', details: assessment.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: assessment });
  } catch (err) { next(err); }
}

export async function updateAssessment(req, res, next) {
  try {
    const assessment = await platformService.updateAssessment(req.params.assessmentId, req.body);
    if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'update_assessment', details: req.params.assessmentId, performedBy: req.user.id });
    res.json({ success: true, data: assessment });
  } catch (err) { next(err); }
}

export async function deleteAssessment(req, res, next) {
  try {
    await platformService.deleteAssessment(req.params.assessmentId);
    if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'delete_assessment', details: req.params.assessmentId, performedBy: req.user.id });
    res.json({ success: true, message: 'Assessment deleted' });
  } catch (err) { next(err); }
}

export async function listAssessmentScores(req, res, next) {
  try { res.json({ success: true, data: await platformService.listAssessmentScores(req.params.assessmentId) }); } catch (err) { next(err); }
}

export async function createAssessmentScore(req, res, next) {
  try {
    const score = await platformService.createAssessmentScore(req.params.assessmentId, req.body);
    if (!score) return res.status(404).json({ success: false, message: 'Assessment not found' });
    if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'create_assessment_score', details: score.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: score });
  } catch (err) { next(err); }
}

export async function updateAssessmentScore(req, res, next) {
  try {
    const updated = await platformService.updateAssessmentScore(req.params.scoreId, req.body);
    if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'update_assessment_score', details: req.params.scoreId, performedBy: req.user.id });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
}

export async function deleteAssessmentScore(req, res, next) {
  try {
    await platformService.deleteAssessmentScore(req.params.scoreId);
    if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'delete_assessment_score', details: req.params.scoreId, performedBy: req.user.id });
    res.json({ success: true, message: 'Assessment score deleted' });
  } catch (err) { next(err); }
}

export async function listRegistrationWindows(req, res, next) { try { res.json({ success: true, data: await platformService.listRegistrationWindows() }); } catch (err) { next(err); } }
export async function createRegistrationWindow(req, res, next) { try { const window = await platformService.createRegistrationWindow(req.body); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'create_registration_window', details: window.id, performedBy: req.user.id }); res.status(201).json({ success: true, data: window }); } catch (err) { next(err); } }
export async function updateRegistrationWindow(req, res, next) { try { const window = await platformService.updateRegistrationWindow(req.params.windowId, req.body); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'update_registration_window', details: req.params.windowId, performedBy: req.user.id }); res.json({ success: true, data: window }); } catch (err) { next(err); } }
export async function deleteRegistrationWindow(req, res, next) { try { await platformService.deleteRegistrationWindow(req.params.windowId); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'delete_registration_window', details: req.params.windowId, performedBy: req.user.id }); res.json({ success: true, message: 'Registration window deleted' }); } catch (err) { next(err); } }
export async function openRegistrationWindow(req, res, next) { try { const window = await platformService.openRegistrationWindow(req.params.windowId); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'open_registration_window', details: req.params.windowId, performedBy: req.user.id }); res.json({ success: true, data: window }); } catch (err) { next(err); } }
export async function closeRegistrationWindow(req, res, next) { try { const window = await platformService.closeRegistrationWindow(req.params.windowId); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'close_registration_window', details: req.params.windowId, performedBy: req.user.id }); res.json({ success: true, data: window }); } catch (err) { next(err); } }

export async function listResults(req, res, next) { try { res.json({ success: true, data: await platformService.listResults(req.user) }); } catch (err) { next(err); } }
export async function createResult(req, res, next) { try { const result = await platformService.createResult(req.body, req.user); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'create_result', details: result.id, performedBy: req.user.id }); res.status(201).json({ success: true, data: result }); } catch (err) { next(err); } }
export async function updateResult(req, res, next) { try { const result = await platformService.updateResult(req.params.resultId, req.body, req.user); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'update_result', details: req.params.resultId, performedBy: req.user.id }); res.json({ success: true, data: result }); } catch (err) { next(err); } }
export async function approveResult(req, res, next) { try { const result = await platformService.approveResult(req.params.resultId, req.user); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'approve_result', details: req.params.resultId, performedBy: req.user.id }); res.json({ success: true, data: result }); } catch (err) { next(err); } }
export async function publishResult(req, res, next) { try { const result = await platformService.publishResult(req.params.resultId, req.user); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'publish_result', details: req.params.resultId, performedBy: req.user.id }); res.json({ success: true, data: result }); } catch (err) { next(err); } }
export async function lockResult(req, res, next) { try { const result = await platformService.lockResult(req.params.resultId, req.user); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'lock_result', details: req.params.resultId, performedBy: req.user.id }); res.json({ success: true, data: result }); } catch (err) { next(err); } }
export async function correctResult(req, res, next) { try { const result = await platformService.correctResult(req.params.resultId, req.body, req.user); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'correct_result', details: req.params.resultId, performedBy: req.user.id }); res.json({ success: true, data: result }); } catch (err) { next(err); } }
export async function getAcademicSummary(req, res, next) { try { const summary = await platformService.getAcademicSummary(req.params.studentId, req.params.sessionId, req.user); res.json({ success: true, data: summary }); } catch (err) { next(err); } }

export async function listTranscriptRequests(req, res, next) { try { res.json({ success: true, data: await platformService.listTranscriptRequests() }); } catch (err) { next(err); } }
export async function createTranscriptRequest(req, res, next) { try { const request = await platformService.createTranscriptRequest(req.body); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'create_transcript_request', details: request.id, performedBy: req.user.id }); res.status(201).json({ success: true, data: request }); } catch (err) { next(err); } }
export async function approveTranscriptRequest(req, res, next) { try { const request = await platformService.approveTranscriptRequest(req.params.requestId); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'approve_transcript_request', details: req.params.requestId, performedBy: req.user.id }); res.json({ success: true, data: request }); } catch (err) { next(err); } }
export async function rejectTranscriptRequest(req, res, next) { try { const request = await platformService.rejectTranscriptRequest(req.params.requestId); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'reject_transcript_request', details: req.params.requestId, performedBy: req.user.id }); res.json({ success: true, data: request }); } catch (err) { next(err); } }
export async function generateTranscript(req, res, next) { try { const transcript = await platformService.generateTranscript(req.params.requestId); if (!transcript) return res.status(404).json({ success: false, message: 'Transcript request not found' }); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'generate_transcript', details: req.params.requestId, performedBy: req.user.id }); res.json({ success: true, data: transcript }); } catch (err) { next(err); } }
export async function verifyTranscript(req, res, next) { try { const request = await platformService.getTranscriptRequest(req.params.requestId); if (!request) return res.status(404).json({ success: false, message: 'Transcript request not found' }); const valid = Boolean(request.digitalSignature && request.qrCode && request.pdfUrl); res.json({ success: true, data: { valid, request } }); } catch (err) { next(err); } }

export async function listGraduationClearances(req, res, next) { try { res.json({ success: true, data: await platformService.listGraduationClearances() }); } catch (err) { next(err); } }
export async function createGraduationClearance(req, res, next) { try { const clearance = await platformService.createGraduationClearance(req.body); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'create_graduation_clearance', details: clearance.id, performedBy: req.user.id }); res.status(201).json({ success: true, data: clearance }); } catch (err) { next(err); } }
export async function updateGraduationClearance(req, res, next) { try { const clearance = await platformService.updateGraduationClearance(req.params.clearanceId, req.body); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'update_graduation_clearance', details: req.params.clearanceId, performedBy: req.user.id }); res.json({ success: true, data: clearance }); } catch (err) { next(err); } }
export async function listGraduationLists(req, res, next) { try { res.json({ success: true, data: await platformService.listGraduationLists() }); } catch (err) { next(err); } }
export async function createGraduationList(req, res, next) { try { const list = await platformService.createGraduationList(req.body); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'create_graduation_list', details: list.id, performedBy: req.user.id }); res.status(201).json({ success: true, data: list }); } catch (err) { next(err); } }
export async function listCertificates(req, res, next) { try { res.json({ success: true, data: await platformService.listCertificates() }); } catch (err) { next(err); } }
export async function createCertificate(req, res, next) { try { const certificate = await platformService.createCertificate(req.body); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'create_certificate', details: certificate.id, performedBy: req.user.id }); res.status(201).json({ success: true, data: certificate }); } catch (err) { next(err); } }
export async function calculateGraduationEligibility(req, res, next) { try { const result = await platformService.calculateGraduationEligibility(req.params.studentId); res.json({ success: true, data: result }); } catch (err) { next(err); } }

export async function listNotificationTemplates(req, res, next) { try { res.json({ success: true, data: await platformService.listNotificationTemplates() }); } catch (err) { next(err); } }
export async function createNotificationTemplate(req, res, next) { try { const template = await platformService.createNotificationTemplate(req.body); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'create_notification_template', details: template.id, performedBy: req.user.id }); res.status(201).json({ success: true, data: template }); } catch (err) { next(err); } }
export async function updateNotificationTemplate(req, res, next) { try { const template = await platformService.updateNotificationTemplate(req.params.templateId, req.body); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'update_notification_template', details: req.params.templateId, performedBy: req.user.id }); res.json({ success: true, data: template }); } catch (err) { next(err); } }
export async function deleteNotificationTemplate(req, res, next) { try { await platformService.deleteNotificationTemplate(req.params.templateId); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'delete_notification_template', details: req.params.templateId, performedBy: req.user.id }); res.json({ success: true, message: 'Notification template deleted' }); } catch (err) { next(err); } }
export async function listNotifications(req, res, next) { try { res.json({ success: true, data: await platformService.listNotifications(req.user) }); } catch (err) { next(err); } }
export async function sendNotification(req, res, next) { try { const notification = await platformService.sendNotification(req.body); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'send_notification', details: notification.id, performedBy: req.user.id }); res.status(201).json({ success: true, data: notification }); } catch (err) { next(err); } }
export async function listScheduledNotifications(req, res, next) { try { res.json({ success: true, data: await platformService.listScheduledNotifications() }); } catch (err) { next(err); } }
export async function scheduleNotification(req, res, next) { try { const scheduled = await platformService.scheduleNotification(req.body); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'schedule_notification', details: scheduled.id, performedBy: req.user.id }); res.status(201).json({ success: true, data: scheduled }); } catch (err) { next(err); } }

export async function listPlans(req, res, next) { try { res.json({ success: true, data: await platformService.listPlans() }); } catch (err) { next(err); } }
export async function createPlan(req, res, next) { try { const plan = await platformService.createPlan(req.body); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'create_plan', details: plan.id, performedBy: req.user.id }); res.status(201).json({ success: true, data: plan }); } catch (err) { next(err); } }
export async function updatePlan(req, res, next) { try { const plan = await platformService.updatePlan(req.params.planId, req.body); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'update_plan', details: req.params.planId, performedBy: req.user.id }); res.json({ success: true, data: plan }); } catch (err) { next(err); } }
export async function listCoupons(req, res, next) { try { res.json({ success: true, data: await platformService.listCoupons() }); } catch (err) { next(err); } }
export async function createCoupon(req, res, next) { try { const coupon = await platformService.createCoupon(req.body); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'create_coupon', details: coupon.id, performedBy: req.user.id }); res.status(201).json({ success: true, data: coupon }); } catch (err) { next(err); } }
export async function listInvoices(req, res, next) { try { res.json({ success: true, data: await platformService.listInvoices() }); } catch (err) { next(err); } }
export async function createInvoice(req, res, next) { try { const invoice = await platformService.createInvoice(req.body); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'create_invoice', details: invoice.id, performedBy: req.user.id }); res.status(201).json({ success: true, data: invoice }); } catch (err) { next(err); } }
export async function listPayments(req, res, next) { try { res.json({ success: true, data: await platformService.listPayments() }); } catch (err) { next(err); } }
export async function createPayment(req, res, next) { try { const payment = await platformService.createPayment(req.body); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'create_payment', details: payment.id, performedBy: req.user.id }); res.status(201).json({ success: true, data: payment }); } catch (err) { next(err); } }

export async function listHealthChecks(req, res, next) { try { res.json({ success: true, data: await platformService.listHealthChecks() }); } catch (err) { next(err); } }
export async function createHealthCheck(req, res, next) { try { const check = await platformService.createHealthCheck(req.body); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'create_health_check', details: check.id, performedBy: req.user.id }); res.status(201).json({ success: true, data: check }); } catch (err) { next(err); } }
export async function listSecurityAlerts(req, res, next) { try { res.json({ success: true, data: await platformService.listSecurityAlerts() }); } catch (err) { next(err); } }
export async function createSecurityAlert(req, res, next) { try { const alert = await platformService.createSecurityAlert(req.body); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'create_security_alert', details: alert.id, performedBy: req.user.id }); res.status(201).json({ success: true, data: alert }); } catch (err) { next(err); } }
export async function resolveSecurityAlert(req, res, next) { try { const alert = await platformService.resolveSecurityAlert(req.params.alertId); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'resolve_security_alert', details: req.params.alertId, performedBy: req.user.id }); res.json({ success: true, data: alert }); } catch (err) { next(err); } }
export async function listUserSessions(req, res, next) { try { res.json({ success: true, data: await platformService.listUserSessions(req.query.userId) }); } catch (err) { next(err); } }
export async function revokeSession(req, res, next) { try { await platformService.revokeSession(req.params.sessionId); if (req.user?.id) await recordUserAuditLog({ userId: req.user.id, action: 'revoke_session', details: req.params.sessionId, performedBy: req.user.id }); res.json({ success: true, message: 'Session revoked' }); } catch (err) { next(err); } }
export async function listLoginHistory(req, res, next) { try { res.json({ success: true, data: await platformService.listLoginHistory(req.query.userId) }); } catch (err) { next(err); } }

export async function getAcademicReport(req, res, next) { try { res.json({ success: true, data: await platformService.getAcademicReport() }); } catch (err) { next(err); } }
export async function getStudentReport(req, res, next) { try { res.json({ success: true, data: await platformService.getStudentReport(req.query.studentId) }); } catch (err) { next(err); } }
export async function getStaffReport(req, res, next) { try { res.json({ success: true, data: await platformService.getStaffReport() }); } catch (err) { next(err); } }
export async function getResultReport(req, res, next) { try { res.json({ success: true, data: await platformService.getResultReport() }); } catch (err) { next(err); } }
export async function getInstitutionReport(req, res, next) { try { res.json({ success: true, data: await platformService.getInstitutionReport() }); } catch (err) { next(err); } }
export async function getAnalyticsReport(req, res, next) { try { res.json({ success: true, data: await platformService.getAnalyticsReport() }); } catch (err) { next(err); } }
export async function exportReport(req, res, next) { try { const csv = await platformService.exportReport(req.params.type); if (!csv) return res.status(400).json({ success: false, message: 'Unsupported export type' }); res.setHeader('Content-Type', 'text/csv'); res.send(csv.csv); } catch (err) { next(err); } }
