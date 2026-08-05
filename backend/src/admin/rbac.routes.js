import express from 'express';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import * as ctrl from './rbac.controller.js';
import requestValidator from '../middleware/requestValidator.js';
import {
	roleIdParam,
	permissionIdParam,
	userIdParam,
	createRoleValidation,
	updateRoleValidation,
	createPermissionValidation,
	updatePermissionValidation,
	assignPermissionToRoleValidation,
	assignRoleToUserValidation,
} from './rbac.validation.js';

const router = express.Router();

router.use(auth, authorize(['SYSTEM_ADMIN']));

router.get('/roles', ctrl.listRoles);
router.post('/roles', createRoleValidation, requestValidator, ctrl.createRole);
router.get('/roles/:roleId', roleIdParam, requestValidator, ctrl.getRole);
router.put('/roles/:roleId', roleIdParam, updateRoleValidation, requestValidator, ctrl.updateRole);
router.delete('/roles/:roleId', roleIdParam, requestValidator, ctrl.deleteRole);
router.post('/roles/:roleId/permissions', roleIdParam, assignPermissionToRoleValidation, requestValidator, ctrl.assignPermissionToRole);
router.delete('/roles/:roleId/permissions/:permissionId', roleIdParam, permissionIdParam, requestValidator, ctrl.removePermissionFromRole);

router.get('/permissions', ctrl.listPermissions);
router.post('/permissions', createPermissionValidation, requestValidator, ctrl.createPermission);
router.get('/permissions/:permissionId', permissionIdParam, requestValidator, ctrl.getPermission);
router.put('/permissions/:permissionId', permissionIdParam, updatePermissionValidation, requestValidator, ctrl.updatePermission);
router.delete('/permissions/:permissionId', permissionIdParam, requestValidator, ctrl.deletePermission);

router.post('/users/:id/roles', userIdParam, assignRoleToUserValidation, requestValidator, ctrl.assignRoleToUser);
router.delete('/users/:id/roles/:roleId', userIdParam, roleIdParam, requestValidator, ctrl.removeRoleFromUser);
router.get('/matrix', ctrl.getRoleMatrix);

export default router;
