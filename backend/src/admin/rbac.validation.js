import { body, param } from 'express-validator';

export const roleIdParam = [param('roleId').isString().notEmpty()];
export const permissionIdParam = [param('permissionId').isString().notEmpty()];
export const userIdParam = [param('id').isString().notEmpty()];

export const createRoleValidation = [body('name').isString().notEmpty(), body('description').optional().isString()];
export const updateRoleValidation = [body('name').optional().isString(), body('description').optional().isString()];

export const createPermissionValidation = [
  body('name').isString().notEmpty(),
  body('description').optional().isString(),
  body('type').optional().isString(),
  body('module').optional().isString(),
  body('groupId').optional().isString(),
];
export const updatePermissionValidation = [
  body('name').optional().isString(),
  body('description').optional().isString(),
  body('type').optional().isString(),
  body('module').optional().isString(),
  body('groupId').optional().isString(),
];

export const assignPermissionToRoleValidation = [body('permissionId').isString().notEmpty()];
export const assignRoleToUserValidation = [body('roleId').isString().notEmpty()];
