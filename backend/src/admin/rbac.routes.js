import express from 'express';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import * as ctrl from './rbac.controller.js';

const router = express.Router();

router.use(auth, authorize(['SYSTEM_ADMIN']));

router.get('/roles', ctrl.listRoles);
router.post('/roles', ctrl.createRole);
router.get('/roles/:roleId', ctrl.getRole);
router.put('/roles/:roleId', ctrl.updateRole);
router.delete('/roles/:roleId', ctrl.deleteRole);
router.post('/roles/:roleId/permissions', ctrl.assignPermissionToRole);
router.delete('/roles/:roleId/permissions/:permissionId', ctrl.removePermissionFromRole);

router.get('/permissions', ctrl.listPermissions);
router.post('/permissions', ctrl.createPermission);
router.get('/permissions/:permissionId', ctrl.getPermission);
router.put('/permissions/:permissionId', ctrl.updatePermission);
router.delete('/permissions/:permissionId', ctrl.deletePermission);

router.post('/users/:id/roles', ctrl.assignRoleToUser);
router.delete('/users/:id/roles/:roleId', ctrl.removeRoleFromUser);
router.get('/matrix', ctrl.getRoleMatrix);

export default router;
