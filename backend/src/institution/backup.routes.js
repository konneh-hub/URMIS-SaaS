import express from 'express';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import requestValidator from '../middleware/requestValidator.js';
import * as ctrl from './backup.controller.js';
import {
  createBackupValidation,
  updateBackupValidation,
  createBackupScheduleValidation,
  updateBackupScheduleValidation,
  backupIdParamValidation,
  scheduleIdParamValidation,
} from './backup.validation.js';

const router = express.Router({ mergeParams: true });
router.use(auth, authorize(['SYSTEM_ADMIN', 'UNIVERSITY_ADMIN']));

router.get('/', ctrl.listBackups);
router.post('/', createBackupValidation, requestValidator, ctrl.createBackup);
router.get('/:backupId', backupIdParamValidation, requestValidator, ctrl.getBackup);
router.put('/:backupId', backupIdParamValidation, updateBackupValidation, requestValidator, ctrl.updateBackup);
router.delete('/:backupId', backupIdParamValidation, requestValidator, ctrl.deleteBackup);
router.post('/:backupId/restore', backupIdParamValidation, requestValidator, ctrl.restoreBackup);
router.get('/:backupId/download', backupIdParamValidation, requestValidator, ctrl.downloadBackup);

router.get('/schedules', ctrl.listBackupSchedules);
router.post('/schedules', createBackupScheduleValidation, requestValidator, ctrl.createBackupSchedule);
router.put('/schedules/:scheduleId', scheduleIdParamValidation, updateBackupScheduleValidation, requestValidator, ctrl.updateBackupSchedule);
router.delete('/schedules/:scheduleId', scheduleIdParamValidation, requestValidator, ctrl.deleteBackupSchedule);

export default router;
