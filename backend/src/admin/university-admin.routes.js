import express from 'express';
import {
  listUniversityAdmins,
  createUniversityAdmin,
  updateUniversityAdmin,
  deleteUniversityAdmin,
  assignInstitution,
  removeInstitution,
  activateUniversityAdmin,
  deactivateUniversityAdmin,
  resetUniversityAdminPassword,
  getUniversityAdminLoginHistory,
  getUniversityAdminAuditLogs,
  getUniversityAdminProfile,
  updateUniversityAdminPermissions,
} from './university-admin.controller.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import requestValidator from '../middleware/requestValidator.js';
import {
  userIdParamValidation,
  createUniversityAdminValidation,
  updateUniversityAdminValidation,
  assignInstitutionValidation,
  updateUniversityAdminPermissionsValidation,
} from './university-admin.validation.js';

const router = express.Router();

router.get('/', auth, authorize(['SYSTEM_ADMIN']), listUniversityAdmins);
router.post('/', auth, authorize(['SYSTEM_ADMIN']), createUniversityAdminValidation, requestValidator, createUniversityAdmin);
router.put('/:userId', auth, authorize(['SYSTEM_ADMIN']), userIdParamValidation, updateUniversityAdminValidation, requestValidator, updateUniversityAdmin);
router.delete('/:userId', auth, authorize(['SYSTEM_ADMIN']), userIdParamValidation, requestValidator, deleteUniversityAdmin);
router.patch('/:userId/assign-institution', auth, authorize(['SYSTEM_ADMIN']), userIdParamValidation, assignInstitutionValidation, requestValidator, assignInstitution);
router.patch('/:userId/remove-institution', auth, authorize(['SYSTEM_ADMIN']), userIdParamValidation, requestValidator, removeInstitution);
router.patch('/:userId/activate', auth, authorize(['SYSTEM_ADMIN']), userIdParamValidation, requestValidator, activateUniversityAdmin);
router.patch('/:userId/deactivate', auth, authorize(['SYSTEM_ADMIN']), userIdParamValidation, requestValidator, deactivateUniversityAdmin);
router.post('/:userId/reset-password', auth, authorize(['SYSTEM_ADMIN']), userIdParamValidation, requestValidator, resetUniversityAdminPassword);
router.get('/:userId/login-history', auth, authorize(['SYSTEM_ADMIN']), userIdParamValidation, requestValidator, getUniversityAdminLoginHistory);
router.get('/:userId/audit-logs', auth, authorize(['SYSTEM_ADMIN']), userIdParamValidation, requestValidator, getUniversityAdminAuditLogs);
router.get('/:userId/profile', auth, authorize(['SYSTEM_ADMIN', 'UNIVERSITY_ADMIN']), userIdParamValidation, requestValidator, getUniversityAdminProfile);
router.patch('/:userId/permissions', auth, authorize(['SYSTEM_ADMIN']), userIdParamValidation, updateUniversityAdminPermissionsValidation, requestValidator, updateUniversityAdminPermissions);

export default router;
