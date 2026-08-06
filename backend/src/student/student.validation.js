import { body, param } from 'express-validator';

export const registerCourseValidation = [
  body('courseId').isString().notEmpty(),
  body('sessionId').optional().isString(),
  body('semesterId').optional().isString(),
];

export const dropCourseValidation = [param('courseId').isString().notEmpty()];

export const transcriptRequestValidation = [
  body('purpose').optional().isString(),
  body('remarks').optional().isString(),
];

export const supportTicketValidation = [
  body('subject').optional().isString(),
  body('message').optional().isString(),
];
