import { body } from 'express-validator';

export const createInstitutionValidation = [
  body('name').isString().notEmpty(),
  body('code').optional().isString(),
  body('domain').optional().isString(),
  body('address').optional().isString(),
  body('phone').optional().isString(),
  body('email').optional().isEmail(),
];

export const createSystemAdminValidation = [
  body('email').isEmail(),
  body('name').optional().isString(),
  body('institutionId').optional().isString(),
  body('permissions').optional().isArray(),
];
