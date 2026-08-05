import express from 'express';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import * as ctrl from './users.controller.js';
import requestValidator from '../middleware/requestValidator.js';
import {
	userIdParamValidation,
	createUserValidation,
	updateUserValidation,
	assignRoleValidation,
	removeRoleValidation,
	updatePermissionsValidation,
	setActiveValidation,
} from './users.validation.js';

const router = express.Router();

// All admin actions require authentication; most require SYSTEM_ADMIN
router.post('/', auth, authorize(['SYSTEM_ADMIN']), createUserValidation, requestValidator, ctrl.createUser);
router.get('/', auth, authorize(['SYSTEM_ADMIN']), ctrl.listUsers);
router.get('/:id', auth, authorize(['SYSTEM_ADMIN']), userIdParamValidation, requestValidator, ctrl.getUser);
router.put('/:id', auth, authorize(['SYSTEM_ADMIN']), userIdParamValidation, updateUserValidation, requestValidator, ctrl.updateUser);
router.delete('/:id', auth, authorize(['SYSTEM_ADMIN']), userIdParamValidation, requestValidator, ctrl.deleteUser);

router.post('/:id/roles', auth, authorize(['SYSTEM_ADMIN']), userIdParamValidation, assignRoleValidation, requestValidator, ctrl.assignRole);
router.delete('/:id/roles', auth, authorize(['SYSTEM_ADMIN']), userIdParamValidation, removeRoleValidation, requestValidator, ctrl.removeRole);

router.put('/:id/permissions', auth, authorize(['SYSTEM_ADMIN']), userIdParamValidation, updatePermissionsValidation, requestValidator, ctrl.updatePermissions);
router.put('/:id/active', auth, authorize(['SYSTEM_ADMIN']), userIdParamValidation, setActiveValidation, requestValidator, ctrl.setActive);
router.post('/:id/reset-password', auth, authorize(['SYSTEM_ADMIN']), userIdParamValidation, requestValidator, ctrl.resetPassword);

router.get('/:id/login-history', auth, authorize(['SYSTEM_ADMIN']), userIdParamValidation, requestValidator, ctrl.getLoginHistory);
router.get('/:id/audit-logs', auth, authorize(['SYSTEM_ADMIN']), userIdParamValidation, requestValidator, ctrl.getAuditLogs);

export default router;
