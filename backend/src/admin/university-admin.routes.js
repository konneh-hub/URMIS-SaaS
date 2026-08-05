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

const router = express.Router();

router.get('/', auth, authorize(['SYSTEM_ADMIN']), listUniversityAdmins);
router.post('/', auth, authorize(['SYSTEM_ADMIN']), createUniversityAdmin);
router.put('/:userId', auth, authorize(['SYSTEM_ADMIN']), updateUniversityAdmin);
router.delete('/:userId', auth, authorize(['SYSTEM_ADMIN']), deleteUniversityAdmin);
router.patch('/:userId/assign-institution', auth, authorize(['SYSTEM_ADMIN']), assignInstitution);
router.patch('/:userId/remove-institution', auth, authorize(['SYSTEM_ADMIN']), removeInstitution);
router.patch('/:userId/activate', auth, authorize(['SYSTEM_ADMIN']), activateUniversityAdmin);
router.patch('/:userId/deactivate', auth, authorize(['SYSTEM_ADMIN']), deactivateUniversityAdmin);
router.post('/:userId/reset-password', auth, authorize(['SYSTEM_ADMIN']), resetUniversityAdminPassword);
router.get('/:userId/login-history', auth, authorize(['SYSTEM_ADMIN']), getUniversityAdminLoginHistory);
router.get('/:userId/audit-logs', auth, authorize(['SYSTEM_ADMIN']), getUniversityAdminAuditLogs);
router.get('/:userId/profile', auth, authorize(['SYSTEM_ADMIN', 'UNIVERSITY_ADMIN']), getUniversityAdminProfile);
router.patch('/:userId/permissions', auth, authorize(['SYSTEM_ADMIN']), updateUniversityAdminPermissions);

export default router;
