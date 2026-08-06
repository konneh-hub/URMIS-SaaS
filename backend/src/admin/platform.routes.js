import express from 'express';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import requestValidator from '../middleware/requestValidator.js';
import * as ctrl from './platform.controller.js';
import {
  assessmentTypeValidation,
  assessmentTypeUpdateValidation,
  assessmentValidation,
  assessmentUpdateValidation,
  assessmentScoreValidation,
  registrationWindowValidation,
  registrationWindowUpdateValidation,
  resultValidation,
  resultUpdateValidation,
  transcriptRequestValidation,
  transcriptRequestIdParamValidation,
  graduationClearanceValidation,
  graduationClearanceUpdateValidation,
  graduationListValidation,
  certificateValidation,
  notificationTemplateValidation,
  notificationTemplateUpdateValidation,
  notificationValidation,
  scheduleNotificationValidation,
  planValidation,
  couponValidation,
  invoiceValidation,
  paymentValidation,
  healthCheckValidation,
  securityAlertValidation,
  sessionQueryValidation,
  reportTypeValidation,
} from './platform.validation.js';

const router = express.Router();
router.use(auth);
const adminOnly = authorize(['SYSTEM_ADMIN', 'UNIVERSITY_ADMIN']);
const staffRoles = authorize(['SYSTEM_ADMIN', 'UNIVERSITY_ADMIN', 'EXAM_OFFICER', 'DEAN', 'HOD', 'LECTURER']);
const lecturerRoles = authorize(['LECTURER', 'SYSTEM_ADMIN', 'UNIVERSITY_ADMIN']);
const publicationRoles = authorize(['EXAM_OFFICER', 'SYSTEM_ADMIN', 'UNIVERSITY_ADMIN']);

router.get('/assessment-types', adminOnly, ctrl.listAssessmentTypes);
router.post('/assessment-types', adminOnly, assessmentTypeValidation, requestValidator, ctrl.createAssessmentType);
router.put('/assessment-types/:typeId', adminOnly, assessmentTypeUpdateValidation, requestValidator, ctrl.updateAssessmentType);
router.delete('/assessment-types/:typeId', adminOnly, ctrl.deleteAssessmentType);

router.get('/assessments', adminOnly, ctrl.listAssessments);
router.post('/assessments', adminOnly, assessmentValidation, requestValidator, ctrl.createAssessment);
router.put('/assessments/:assessmentId', adminOnly, assessmentUpdateValidation, requestValidator, ctrl.updateAssessment);
router.delete('/assessments/:assessmentId', adminOnly, ctrl.deleteAssessment);

router.get('/assessments/:assessmentId/scores', adminOnly, ctrl.listAssessmentScores);
router.post('/assessments/:assessmentId/scores', adminOnly, assessmentScoreValidation, requestValidator, ctrl.createAssessmentScore);
router.put('/scores/:scoreId', adminOnly, assessmentScoreValidation, requestValidator, ctrl.updateAssessmentScore);
router.delete('/scores/:scoreId', adminOnly, ctrl.deleteAssessmentScore);

router.get('/registration-windows', adminOnly, ctrl.listRegistrationWindows);
router.post('/registration-windows', adminOnly, registrationWindowValidation, requestValidator, ctrl.createRegistrationWindow);
router.put('/registration-windows/:windowId', adminOnly, registrationWindowUpdateValidation, requestValidator, ctrl.updateRegistrationWindow);
router.delete('/registration-windows/:windowId', adminOnly, ctrl.deleteRegistrationWindow);
router.post('/registration-windows/:windowId/open', adminOnly, ctrl.openRegistrationWindow);
router.post('/registration-windows/:windowId/close', adminOnly, ctrl.closeRegistrationWindow);

router.get('/results', staffRoles, ctrl.listResults);
router.post('/results', lecturerRoles, resultValidation, requestValidator, ctrl.createResult);
router.put('/results/:resultId', staffRoles, resultUpdateValidation, requestValidator, ctrl.updateResult);
router.post('/results/:resultId/approve', staffRoles, ctrl.approveResult);
router.post('/results/:resultId/publish', publicationRoles, ctrl.publishResult);
router.post('/results/:resultId/lock', publicationRoles, ctrl.lockResult);
router.post('/results/:resultId/correct', staffRoles, resultUpdateValidation, requestValidator, ctrl.correctResult);
router.get('/results/summary/:studentId/:sessionId?', staffRoles, ctrl.getAcademicSummary);

router.get('/transcript-requests', ctrl.listTranscriptRequests);
router.post('/transcript-requests', transcriptRequestValidation, requestValidator, ctrl.createTranscriptRequest);
router.post('/transcript-requests/:requestId/approve', transcriptRequestIdParamValidation, requestValidator, ctrl.approveTranscriptRequest);
router.post('/transcript-requests/:requestId/reject', transcriptRequestIdParamValidation, requestValidator, ctrl.rejectTranscriptRequest);
router.post('/transcript-requests/:requestId/generate', transcriptRequestIdParamValidation, requestValidator, ctrl.generateTranscript);
router.get('/transcript-requests/:requestId/verify', transcriptRequestIdParamValidation, requestValidator, ctrl.verifyTranscript);

router.get('/graduation-clearances', ctrl.listGraduationClearances);
router.post('/graduation-clearances', graduationClearanceValidation, requestValidator, ctrl.createGraduationClearance);
router.put('/graduation-clearances/:clearanceId', graduationClearanceUpdateValidation, requestValidator, ctrl.updateGraduationClearance);
router.get('/graduation-lists', ctrl.listGraduationLists);
router.post('/graduation-lists', graduationListValidation, requestValidator, ctrl.createGraduationList);
router.get('/certificates', ctrl.listCertificates);
router.post('/certificates', certificateValidation, requestValidator, ctrl.createCertificate);
router.get('/graduation-eligibility/:studentId', ctrl.calculateGraduationEligibility);

router.get('/notification-templates', ctrl.listNotificationTemplates);
router.post('/notification-templates', notificationTemplateValidation, requestValidator, ctrl.createNotificationTemplate);
router.put('/notification-templates/:templateId', notificationTemplateUpdateValidation, requestValidator, ctrl.updateNotificationTemplate);
router.delete('/notification-templates/:templateId', ctrl.deleteNotificationTemplate);
router.get('/notifications', ctrl.listNotifications);
router.post('/notifications', notificationValidation, requestValidator, ctrl.sendNotification);
router.get('/scheduled-notifications', ctrl.listScheduledNotifications);
router.post('/scheduled-notifications', scheduleNotificationValidation, requestValidator, ctrl.scheduleNotification);

router.get('/plans', ctrl.listPlans);
router.post('/plans', planValidation, requestValidator, ctrl.createPlan);
router.put('/plans/:planId', planValidation, requestValidator, ctrl.updatePlan);
router.get('/coupons', ctrl.listCoupons);
router.post('/coupons', couponValidation, requestValidator, ctrl.createCoupon);
router.get('/invoices', ctrl.listInvoices);
router.post('/invoices', invoiceValidation, requestValidator, ctrl.createInvoice);
router.get('/payments', ctrl.listPayments);
router.post('/payments', paymentValidation, requestValidator, ctrl.createPayment);

router.get('/health-checks', ctrl.listHealthChecks);
router.post('/health-checks', healthCheckValidation, requestValidator, ctrl.createHealthCheck);
router.get('/security-alerts', ctrl.listSecurityAlerts);
router.post('/security-alerts', securityAlertValidation, requestValidator, ctrl.createSecurityAlert);
router.post('/security-alerts/:alertId/resolve', ctrl.resolveSecurityAlert);
router.get('/sessions', sessionQueryValidation, requestValidator, ctrl.listUserSessions);
router.delete('/sessions/:sessionId', ctrl.revokeSession);
router.get('/login-history', sessionQueryValidation, requestValidator, ctrl.listLoginHistory);

router.get('/reports/academic', ctrl.getAcademicReport);
router.get('/reports/student', ctrl.getStudentReport);
router.get('/reports/staff', ctrl.getStaffReport);
router.get('/reports/results', ctrl.getResultReport);
router.get('/reports/institution', ctrl.getInstitutionReport);
router.get('/reports/analytics', ctrl.getAnalyticsReport);
router.get('/export/:type', reportTypeValidation, requestValidator, ctrl.exportReport);

export default router;
