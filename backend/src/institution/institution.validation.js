import { body, param } from 'express-validator';

export const institutionIdParamValidation = [param('institutionId').isString().notEmpty()];

export const createInstitutionValidation = [
  body('name').isString().notEmpty(),
  body('code').isString().notEmpty(),
  body('domain').isString().optional({ nullable: true }),
  body('email').isEmail().optional({ nullable: true }),
  body('phone').isString().optional({ nullable: true }),
  body('subscriptionPlan').isString().optional({ nullable: true }),
  body('subscriptionStatus').isString().optional({ nullable: true }),
  body('subscriptionExpiresAt').optional().isISO8601(),
  body('storageLimitMb').optional().isInt({ min: 0 }),
];

export const updateInstitutionValidation = [
  body('name').optional().isString(),
  body('code').optional().isString(),
  body('domain').optional().isString(),
  body('email').optional().isEmail(),
  body('phone').optional().isString(),
  body('subscriptionPlan').optional().isString(),
  body('subscriptionStatus').optional().isString(),
  body('subscriptionExpiresAt').optional().isISO8601(),
  body('storageLimitMb').optional().isInt({ min: 0 }),
];

export const updateInstitutionSettingsValidation = [
  body('timezone').optional().isString(),
  body('locale').optional().isString(),
  body('language').optional().isString(),
  body('theme').optional().isString(),
  body('brandColor').optional().isString(),
  body('logoUrl').optional().isString(),
  body('customDomain').optional().isString(),
  body('supportEmail').optional().isEmail(),
  body('enableMultiCampus').optional().isBoolean(),
];

export const updateInstitutionStatusValidation = [
  body('status').isString().notEmpty(),
];

export const cloneInstitutionConfigurationValidation = [
  body('targetInstitutionId').isString().notEmpty(),
];
