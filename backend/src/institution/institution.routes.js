import express from 'express';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import requestValidator from '../middleware/requestValidator.js';
import {
  getInstitutions,
  getInstitutionById,
  createInstitution,
  updateInstitution,
  deleteInstitution,
  restoreInstitution,
  getInstitutionSettings,
  updateInstitutionSettings,
  getInstitutionStatistics,
  updateInstitutionStatus,
  getInstitutionProfile,
  getInstitutionSubscription,
  getInstitutionStorage,
  getInstitutionActivityLogs,
  getInstitutionAuditLogs,
  resetInstitution,
  cloneInstitutionConfiguration,
} from './institution.controller.js';
import backupRoutes from './backup.routes.js';
import requireTenantAccess from '../middleware/tenant.js';
import {
  institutionIdParamValidation,
  createInstitutionValidation,
  updateInstitutionValidation,
  updateInstitutionSettingsValidation,
  updateInstitutionStatusValidation,
  cloneInstitutionConfigurationValidation,
} from './institution.validation.js';

const router = express.Router({ mergeParams: true });

router.get('/', auth, authorize(['SYSTEM_ADMIN', 'UNIVERSITY_ADMIN']), getInstitutions);
router.get('/:institutionId', auth, authorize(['SYSTEM_ADMIN', 'UNIVERSITY_ADMIN']), institutionIdParamValidation, requestValidator, requireTenantAccess, getInstitutionById);
router.post('/', auth, authorize(['SYSTEM_ADMIN']), createInstitutionValidation, requestValidator, createInstitution);
router.put('/:institutionId', auth, authorize(['SYSTEM_ADMIN']), institutionIdParamValidation, updateInstitutionValidation, requestValidator, requireTenantAccess, updateInstitution);
router.delete('/:institutionId', auth, authorize(['SYSTEM_ADMIN']), institutionIdParamValidation, requestValidator, requireTenantAccess, deleteInstitution);
router.post('/:institutionId/restore', auth, authorize(['SYSTEM_ADMIN']), institutionIdParamValidation, requestValidator, requireTenantAccess, restoreInstitution);
router.get('/:institutionId/settings', auth, authorize(['SYSTEM_ADMIN', 'UNIVERSITY_ADMIN']), institutionIdParamValidation, requestValidator, requireTenantAccess, getInstitutionSettings);
router.put('/:institutionId/settings', auth, authorize(['SYSTEM_ADMIN', 'UNIVERSITY_ADMIN']), institutionIdParamValidation, updateInstitutionSettingsValidation, requestValidator, requireTenantAccess, updateInstitutionSettings);
router.get('/:institutionId/statistics', auth, authorize(['SYSTEM_ADMIN', 'UNIVERSITY_ADMIN']), institutionIdParamValidation, requestValidator, requireTenantAccess, getInstitutionStatistics);
router.patch('/:institutionId/status', auth, authorize(['SYSTEM_ADMIN']), institutionIdParamValidation, updateInstitutionStatusValidation, requestValidator, requireTenantAccess, updateInstitutionStatus);
router.get('/:institutionId/profile', auth, authorize(['SYSTEM_ADMIN', 'UNIVERSITY_ADMIN']), institutionIdParamValidation, requestValidator, requireTenantAccess, getInstitutionProfile);
router.get('/:institutionId/subscription', auth, authorize(['SYSTEM_ADMIN', 'UNIVERSITY_ADMIN']), institutionIdParamValidation, requestValidator, requireTenantAccess, getInstitutionSubscription);
router.get('/:institutionId/storage', auth, authorize(['SYSTEM_ADMIN', 'UNIVERSITY_ADMIN']), institutionIdParamValidation, requestValidator, requireTenantAccess, getInstitutionStorage);
router.get('/:institutionId/activity-logs', auth, authorize(['SYSTEM_ADMIN', 'UNIVERSITY_ADMIN']), institutionIdParamValidation, requestValidator, requireTenantAccess, getInstitutionActivityLogs);
router.get('/:institutionId/audit-logs', auth, authorize(['SYSTEM_ADMIN', 'UNIVERSITY_ADMIN']), institutionIdParamValidation, requestValidator, requireTenantAccess, getInstitutionAuditLogs);
router.post('/:institutionId/clone', auth, authorize(['SYSTEM_ADMIN']), institutionIdParamValidation, cloneInstitutionConfigurationValidation, requestValidator, requireTenantAccess, cloneInstitutionConfiguration);
router.post('/:institutionId/reset', auth, authorize(['SYSTEM_ADMIN']), institutionIdParamValidation, requestValidator, requireTenantAccess, resetInstitution);
router.use('/:institutionId/backups', backupRoutes);

export default router;
