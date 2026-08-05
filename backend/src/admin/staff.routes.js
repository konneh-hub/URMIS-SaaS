import express from 'express';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import * as ctrl from './staff.controller.js';

const router = express.Router();
router.use(auth, authorize(['SYSTEM_ADMIN', 'UNIVERSITY_ADMIN']));

router.get('/', ctrl.listStaff);
router.get('/:id', ctrl.getStaff);
router.post('/', ctrl.createStaff);
router.put('/:id', ctrl.updateStaff);
router.delete('/:id', ctrl.deleteStaff);

router.get('/:id/assignments', ctrl.listStaffAssignments);
router.post('/:id/assignments', ctrl.createStaffAssignment);
router.put('/assignments/:assignmentId', ctrl.updateStaffAssignment);
router.delete('/assignments/:assignmentId', ctrl.deleteStaffAssignment);

export default router;
