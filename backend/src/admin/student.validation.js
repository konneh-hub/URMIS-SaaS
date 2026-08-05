import { body, param, query } from 'express-validator';

export const studentIdParamValidation = [param('studentId').isString().notEmpty()];
export const registrationIdParamValidation = [param('registrationId').isString().notEmpty()];
export const guardianIdParamValidation = [param('guardianId').isString().notEmpty()];
export const medicalRecordIdParamValidation = [param('medicalRecordId').isString().notEmpty()];
export const documentIdParamValidation = [param('documentId').isString().notEmpty()];

export const createStudentValidation = [
  body('studentNumber').isString().notEmpty(),
  body('firstName').isString().notEmpty(),
  body('lastName').isString().notEmpty(),
  body('email').optional().isEmail(),
  body('phone').optional().isString(),
  body('admissionYear').optional().isInt({ min: 1900 }),
  body('institutionId').optional().isString(),
  body('departmentId').optional().isString(),
  body('guardian').optional().isArray(),
  body('medical').optional().isArray(),
  body('documents').optional().isArray(),
];

export const updateStudentValidation = [
  body('firstName').optional().isString(),
  body('lastName').optional().isString(),
  body('email').optional().isEmail(),
  body('phone').optional().isString(),
  body('admissionYear').optional().isInt({ min: 1900 }),
  body('institutionId').optional().isString(),
  body('departmentId').optional().isString(),
  body('guardian').optional().isArray(),
  body('medical').optional().isArray(),
  body('documents').optional().isArray(),
];

export const registrationValidation = [
  body('courseId').isString().notEmpty(),
  body('sessionId').isString().notEmpty(),
  body('semesterId').isString().notEmpty(),
  body('status').optional().isString(),
];

export const registrationUpdateValidation = [
  body('courseId').optional().isString(),
  body('sessionId').optional().isString(),
  body('semesterId').optional().isString(),
  body('status').optional().isString(),
];

export const approveRegistrationValidation = [
  body('approvalNotes').optional().isString(),
];

export const guardianValidation = [
  body('name').isString().notEmpty(),
  body('relationship').optional().isString(),
  body('phone').optional().isString(),
  body('email').optional().isEmail(),
  body('address').optional().isString(),
];

export const medicalRecordValidation = [
  body('recordType').isString().notEmpty(),
  body('description').optional().isString(),
  body('date').optional().isISO8601(),
  body('notes').optional().isString(),
];

export const documentValidation = [
  body('type').isString().notEmpty(),
  body('url').isString().notEmpty(),
  body('description').optional().isString(),
];

export const academicHistoryValidation = [
  body('sessionId').isString().notEmpty(),
  body('semesterId').isString().notEmpty(),
  body('level').isString().notEmpty(),
  body('gpa').optional().isFloat({ min: 0, max: 10 }),
  body('remarks').optional().isString(),
];

export const studentQueryValidation = [
  query('departmentId').optional().isString(),
  query('institutionId').optional().isString(),
  query('admissionYear').optional().isInt({ min: 1900 }),
];
