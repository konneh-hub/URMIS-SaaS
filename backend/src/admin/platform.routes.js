import express from 'express';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import * as ctrl from './platform.controller.js';

const router = express.Router();
router.use(auth, authorize(['SYSTEM_ADMIN', 'UNIVERSITY_ADMIN']));

// Assessment type management
router.get('/assessment-types', ctrl.listAssessmentTypes);
router.post('/assessment-types', ctrl.createAssessmentType);
router.put('/assessment-types/:typeId', ctrl.updateAssessmentType);
router.delete('/assessment-types/:typeId', ctrl.deleteAssessmentType);

// Assessments
router.get('/assessments', ctrl.listAssessments);
router.post('/assessments', ctrl.createAssessment);
router.put('/assessments/:assessmentId', ctrl.updateAssessment);
router.delete('/assessments/:assessmentId', ctrl.deleteAssessment);

// Assessment scores
router.get('/assessments/:assessmentId/scores', ctrl.listAssessmentScores);
router.post('/assessments/:assessmentId/scores', ctrl.createAssessmentScore);
router.put('/scores/:scoreId', ctrl.updateAssessmentScore);
router.delete('/scores/:scoreId', ctrl.deleteAssessmentScore);

// Registration windows
router.get('/registration-windows', ctrl.listRegistrationWindows);
router.post('/registration-windows', ctrl.createRegistrationWindow);
router.put('/registration-windows/:windowId', ctrl.updateRegistrationWindow);
router.delete('/registration-windows/:windowId', ctrl.deleteRegistrationWindow);
router.post('/registration-windows/:windowId/open', ctrl.openRegistrationWindow);
router.post('/registration-windows/:windowId/close', ctrl.closeRegistrationWindow);

// Results and approvals
router.get('/results', ctrl.listResults);
router.post('/results', ctrl.createResult);
router.put('/results/:resultId', ctrl.updateResult);
router.post('/results/:resultId/approve', ctrl.approveResult);
router.post('/results/:resultId/publish', ctrl.publishResult);
router.post('/results/:resultId/lock', ctrl.lockResult);
router.post('/results/:resultId/correct', ctrl.correctResult);
router.get('/results/summary/:studentId/:sessionId?', ctrl.getAcademicSummary);

// Transcript requests
router.get('/transcript-requests', ctrl.listTranscriptRequests);
router.post('/transcript-requests', ctrl.createTranscriptRequest);
router.post('/transcript-requests/:requestId/approve', ctrl.approveTranscriptRequest);
router.post('/transcript-requests/:requestId/reject', ctrl.rejectTranscriptRequest);
router.post('/transcript-requests/:requestId/generate', ctrl.generateTranscript);
router.get('/transcript-requests/:requestId/verify', ctrl.verifyTranscript);

// Graduation and certification
router.get('/graduation-clearances', ctrl.listGraduationClearances);
router.post('/graduation-clearances', ctrl.createGraduationClearance);
router.put('/graduation-clearances/:clearanceId', ctrl.updateGraduationClearance);
router.get('/graduation-lists', ctrl.listGraduationLists);
router.post('/graduation-lists', ctrl.createGraduationList);
router.get('/certificates', ctrl.listCertificates);
router.post('/certificates', ctrl.createCertificate);
router.get('/graduation-eligibility/:studentId', ctrl.calculateGraduationEligibility);

// Notifications
router.get('/notification-templates', ctrl.listNotificationTemplates);
router.post('/notification-templates', ctrl.createNotificationTemplate);
router.put('/notification-templates/:templateId', ctrl.updateNotificationTemplate);
router.delete('/notification-templates/:templateId', ctrl.deleteNotificationTemplate);
router.get('/notifications', ctrl.listNotifications);
router.post('/notifications', ctrl.sendNotification);
router.get('/scheduled-notifications', ctrl.listScheduledNotifications);
router.post('/scheduled-notifications', ctrl.scheduleNotification);

// Billing & subscription
router.get('/plans', ctrl.listPlans);
router.post('/plans', ctrl.createPlan);
router.put('/plans/:planId', ctrl.updatePlan);
router.get('/coupons', ctrl.listCoupons);
router.post('/coupons', ctrl.createCoupon);
router.get('/invoices', ctrl.listInvoices);
router.post('/invoices', ctrl.createInvoice);
router.get('/payments', ctrl.listPayments);
router.post('/payments', ctrl.createPayment);

// Monitoring & security
router.get('/health-checks', ctrl.listHealthChecks);
router.post('/health-checks', ctrl.createHealthCheck);
router.get('/security-alerts', ctrl.listSecurityAlerts);
router.post('/security-alerts', ctrl.createSecurityAlert);
router.post('/security-alerts/:alertId/resolve', ctrl.resolveSecurityAlert);
router.get('/sessions', ctrl.listUserSessions);
router.delete('/sessions/:sessionId', ctrl.revokeSession);
router.get('/login-history', ctrl.listLoginHistory);

// Reports and export
router.get('/reports/academic', ctrl.getAcademicReport);
router.get('/reports/student', ctrl.getStudentReport);
router.get('/reports/staff', ctrl.getStaffReport);
router.get('/reports/results', ctrl.getResultReport);
router.get('/reports/institution', ctrl.getInstitutionReport);
router.get('/reports/analytics', ctrl.getAnalyticsReport);
router.get('/export/:type', ctrl.exportReport);

export default router;
