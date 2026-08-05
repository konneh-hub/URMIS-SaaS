import { body, param } from 'express-validator';

export const createBackupValidation = [
  body('name').isString().notEmpty(),
  body('provider').isIn(['LOCAL', 'CLOUD']),
  body('type').isIn(['DATABASE', 'STORAGE', 'FULL']),
];

export const updateBackupValidation = [
  body('status').optional().isIn(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED']),
  body('downloadUrl').optional().isString(),
  body('completedAt').optional().isISO8601(),
  body('sizeMb').optional().isFloat({ min: 0 }),
];

export const createBackupScheduleValidation = [
  body('name').isString().notEmpty(),
  body('cronExpression').isString().notEmpty(),
  body('provider').isIn(['LOCAL', 'CLOUD']),
  body('nextRunAt').isISO8601(),
];

export const updateBackupScheduleValidation = [
  body('name').optional().isString(),
  body('cronExpression').optional().isString(),
  body('provider').optional().isIn(['LOCAL', 'CLOUD']),
  body('nextRunAt').optional().isISO8601(),
  body('status').optional().isIn(['ACTIVE', 'PAUSED', 'CANCELLED']),
];

export const backupIdParamValidation = [param('backupId').isString().notEmpty()];
export const scheduleIdParamValidation = [param('scheduleId').isString().notEmpty()];
