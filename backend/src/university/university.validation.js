import { body, param } from 'express-validator';

export const institutionIdParamValidation = [param('institutionId').isString().notEmpty()];

export const inviteValidation = [
  body('email').isEmail(),
  body('name').optional().isString(),
  body('role').optional().isIn(['STUDENT', 'LECTURER', 'HOD', 'DEAN', 'UNIVERSITY_ADMIN', 'SYSTEM_ADMIN', 'STAFF']),
];

export const bulkUploadValidation = []; // file presence validated in controller
