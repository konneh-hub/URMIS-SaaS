import { body, param } from 'express-validator';

export const userIdParamValidation = [param('id').isString().notEmpty()];

export const createUserValidation = [
  body('email').isEmail(),
  body('name').optional().isString(),
  body('role').isString().notEmpty(),
  body('institutionId').optional().isString(),
  body('permissions').optional().isArray(),
];

export const updateUserValidation = [
  body('email').optional().isEmail(),
  body('name').optional().isString(),
  body('institutionId').optional().isString(),
  body('permissions').optional().isArray(),
];

export const assignRoleValidation = [body('roleName').isString().notEmpty()];
export const removeRoleValidation = [body('roleName').isString().notEmpty()];
export const updatePermissionsValidation = [body('permissions').isArray()];
export const setActiveValidation = [body('active').isBoolean()];
