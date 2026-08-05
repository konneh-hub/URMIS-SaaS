import { body, param, query } from 'express-validator';

export const assessmentTypeValidation = [
  body('name').isString().notEmpty(),
  body('description').optional().isString(),
  body('institutionId').optional().isString(),
];

export const assessmentTypeUpdateValidation = [
  body('name').optional().isString(),
  body('description').optional().isString(),
];

export const assessmentValidation = [
  body('title').isString().notEmpty(),
  body('description').optional().isString(),
  body('typeId').isString().notEmpty(),
  body('courseId').isString().notEmpty(),
  body('sessionId').isString().notEmpty(),
  body('semesterId').isString().notEmpty(),
  body('institutionId').isString().notEmpty(),
  body('weight').optional().isFloat({ min: 0 }),
  body('maxScore').optional().isFloat({ min: 0 }),
];

export const assessmentUpdateValidation = [
  body('title').optional().isString(),
  body('description').optional().isString(),
  body('typeId').optional().isString(),
  body('courseId').optional().isString(),
  body('sessionId').optional().isString(),
  body('semesterId').optional().isString(),
  body('weight').optional().isFloat({ min: 0 }),
  body('maxScore').optional().isFloat({ min: 0 }),
  body('status').optional().isString(),
];

export const assessmentScoreValidation = [
  body('studentId').isString().notEmpty(),
  body('score').isFloat({ min: 0 }),
  body('comments').optional().isString(),
];

export const registrationWindowValidation = [
  body('name').isString().notEmpty(),
  body('institutionId').optional().isString(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('status').optional().isString(),
];

export const registrationWindowUpdateValidation = [
  body('name').optional().isString(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('status').optional().isString(),
];

export const resultValidation = [
  body('studentId').isString().notEmpty(),
  body('courseId').isString().notEmpty(),
  body('institutionId').isString().notEmpty(),
  body('sessionId').isString().notEmpty(),
  body('semesterId').isString().notEmpty(),
  body('score').isFloat({ min: 0 }),
  body('remarks').optional().isString(),
];

export const resultUpdateValidation = [
  body('score').optional().isFloat({ min: 0 }),
  body('remarks').optional().isString(),
  body('carryOver').optional().isBoolean(),
];

export const transcriptRequestValidation = [
  body('studentId').isString().notEmpty(),
  body('institutionId').isString().notEmpty(),
  body('requestedById').isString().notEmpty(),
  body('remarks').optional().isString(),
];

export const transcriptRequestIdParamValidation = [
  param('requestId').isString().notEmpty(),
];

export const graduationClearanceValidation = [
  body('studentId').isString().notEmpty(),
  body('institutionId').isString().notEmpty(),
  body('status').isString().notEmpty(),
  body('notes').optional().isString(),
  body('clearedById').optional().isString(),
];

export const graduationClearanceUpdateValidation = [
  body('status').optional().isString(),
  body('notes').optional().isString(),
  body('clearedById').optional().isString(),
];

export const graduationListValidation = [
  body('institutionId').isString().notEmpty(),
  body('sessionId').isString().notEmpty(),
  body('title').isString().notEmpty(),
  body('graduationDate').isISO8601(),
  body('studentCount').optional().isInt({ min: 0 }),
];

export const certificateValidation = [
  body('studentId').isString().notEmpty(),
  body('graduationListId').isString().notEmpty(),
  body('certificateUrl').isString().notEmpty(),
  body('remarks').optional().isString(),
];

export const notificationTemplateValidation = [
  body('institutionId').optional().isString(),
  body('name').isString().notEmpty(),
  body('subject').isString().notEmpty(),
  body('body').isString().notEmpty(),
  body('channel').isString().notEmpty(),
];

export const notificationTemplateUpdateValidation = [
  body('name').optional().isString(),
  body('subject').optional().isString(),
  body('body').optional().isString(),
  body('channel').optional().isString(),
];

export const notificationValidation = [
  body('userId').optional().isString(),
  body('studentId').optional().isString(),
  body('institutionId').optional().isString(),
  body('templateId').optional().isString(),
  body('title').isString().notEmpty(),
  body('message').isString().notEmpty(),
  body('channel').isString().notEmpty(),
  body('metadata').optional(),
];

export const scheduleNotificationValidation = [
  body('templateId').isString().notEmpty(),
  body('sendAt').isISO8601(),
];

export const planValidation = [
  body('name').isString().notEmpty(),
  body('description').optional().isString(),
  body('priceCents').isInt({ min: 0 }),
  body('currency').isString().notEmpty(),
  body('interval').isString().notEmpty(),
  body('trialDays').optional().isInt({ min: 0 }),
  body('features').optional().isArray(),
  body('active').optional().isBoolean(),
];

export const couponValidation = [
  body('code').isString().notEmpty(),
  body('description').optional().isString(),
  body('discountPct').isFloat({ min: 0, max: 100 }),
  body('active').optional().isBoolean(),
  body('expiresAt').optional().isISO8601(),
  body('usageLimit').optional().isInt({ min: 0 }),
];

export const invoiceValidation = [
  body('institutionId').isString().notEmpty(),
  body('planId').isString().notEmpty(),
  body('couponId').optional().isString(),
  body('amountCents').isInt({ min: 0 }),
  body('currency').isString().notEmpty(),
  body('dueDate').isISO8601(),
];

export const paymentValidation = [
  body('invoiceId').isString().notEmpty(),
  body('institutionId').isString().notEmpty(),
  body('amountCents').isInt({ min: 0 }),
  body('currency').isString().notEmpty(),
  body('method').isString().notEmpty(),
  body('transactionId').optional().isString(),
  body('status').optional().isString(),
  body('paidAt').optional().isISO8601(),
];

export const healthCheckValidation = [
  body('institutionId').optional().isString(),
  body('category').isString().notEmpty(),
  body('status').isString().notEmpty(),
  body('details').optional().isString(),
];

export const securityAlertValidation = [
  body('userId').optional().isString(),
  body('institutionId').optional().isString(),
  body('type').isString().notEmpty(),
  body('severity').isString().notEmpty(),
  body('message').isString().notEmpty(),
  body('metadata').optional(),
];

export const sessionQueryValidation = [
  query('userId').optional().isString(),
];

export const reportTypeValidation = [
  param('type').isIn(['students', 'results']),
];
