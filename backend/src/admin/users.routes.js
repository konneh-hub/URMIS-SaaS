import express from 'express';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import * as ctrl from './users.controller.js';

const router = express.Router();

// All admin actions require authentication; most require SYSTEM_ADMIN
router.post('/', auth, authorize(['SYSTEM_ADMIN']), ctrl.createUser);
router.get('/', auth, authorize(['SYSTEM_ADMIN']), ctrl.listUsers);
router.get('/:id', auth, authorize(['SYSTEM_ADMIN']), ctrl.getUser);
router.put('/:id', auth, authorize(['SYSTEM_ADMIN']), ctrl.updateUser);
router.delete('/:id', auth, authorize(['SYSTEM_ADMIN']), ctrl.deleteUser);

router.post('/:id/roles', auth, authorize(['SYSTEM_ADMIN']), ctrl.assignRole);
router.delete('/:id/roles', auth, authorize(['SYSTEM_ADMIN']), ctrl.removeRole);

router.put('/:id/permissions', auth, authorize(['SYSTEM_ADMIN']), ctrl.updatePermissions);
router.put('/:id/active', auth, authorize(['SYSTEM_ADMIN']), ctrl.setActive);
router.post('/:id/reset-password', auth, authorize(['SYSTEM_ADMIN']), ctrl.resetPassword);

router.get('/:id/login-history', auth, authorize(['SYSTEM_ADMIN']), ctrl.getLoginHistory);
router.get('/:id/audit-logs', auth, authorize(['SYSTEM_ADMIN']), ctrl.getAuditLogs);

export default router;
