import express from 'express';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import requestValidator from '../middleware/requestValidator.js';
import {
  getProfile,
  getCourses,
  getRegisteredCourses,
  registerCourse,
  dropCourse,
  getAssessments,
  getResults,
  getTranscriptRequests,
  createTranscriptRequest,
  getAcademicHistory,
  getFeeStatus,
  getDocuments,
  getNotifications,
  getSupportTickets,
  createSupportTicket,
} from './student.controller.js';
import {
  registerCourseValidation,
  dropCourseValidation,
  transcriptRequestValidation,
  supportTicketValidation,
} from './student.validation.js';

const router = express.Router();

// All student routes require an authenticated STUDENT role.
router.use(auth, authorize(['STUDENT']));

router.get('/profile', getProfile);
router.get('/courses', getCourses);
router.get('/registered-courses', getRegisteredCourses);
router.post('/courses', registerCourseValidation, requestValidator, registerCourse);
router.delete('/courses/:courseId', dropCourseValidation, requestValidator, dropCourse);
router.get('/assessments', getAssessments);
router.get('/results', getResults);
router.get('/transcript-requests', getTranscriptRequests);
router.post('/transcript-requests', transcriptRequestValidation, requestValidator, createTranscriptRequest);
router.get('/academic-history', getAcademicHistory);
router.get('/fees', getFeeStatus);
router.get('/documents', getDocuments);
router.get('/notifications', getNotifications);
router.get('/support-tickets', getSupportTickets);
router.post('/support-tickets', supportTicketValidation, requestValidator, createSupportTicket);

export default router;
