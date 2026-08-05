import { body, param } from 'express-validator';

export const userIdParamValidation = [param('userId').isString().notEmpty()];

export const createUniversityAdminValidation = [
  body('email').isEmail(),
  body('name').isString().notEmpty(),
  body('institutionId').optional().isString(),
  body('permissions').optional().isArray(),
];

export const updateUniversityAdminValidation = [
  body('email').optional().isEmail(),
  body('name').optional().isString(),
  body('institutionId').optional().isString(),
  body('permissions').optional().isArray(),
];

export const assignInstitutionValidation = [body('institutionId').isString().notEmpty()];
export const updateUniversityAdminPermissionsValidation = [body('permissions').isArray()];
