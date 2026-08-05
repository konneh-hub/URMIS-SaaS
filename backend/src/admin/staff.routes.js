import express from 'express';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import * as ctrl from './staff.controller.js';
import requestValidator from '../middleware/requestValidator.js';
import {
	idParam,
	assignmentIdParam,
	listStaffQuery,
	createStaffValidation,
	updateStaffValidation,
	createAssignmentValidation,
	updateAssignmentValidation,
} from './staff.validation.js';

const router = express.Router();
router.use(auth, authorize(['SYSTEM_ADMIN', 'UNIVERSITY_ADMIN']));

router.get('/', listStaffQuery, requestValidator, ctrl.listStaff);
router.get('/:id', idParam, requestValidator, ctrl.getStaff);
router.post('/', createStaffValidation, requestValidator, ctrl.createStaff);
router.put('/:id', idParam, updateStaffValidation, requestValidator, ctrl.updateStaff);
router.delete('/:id', idParam, requestValidator, ctrl.deleteStaff);

router.get('/:id/assignments', idParam, requestValidator, ctrl.listStaffAssignments);
router.post('/:id/assignments', idParam, createAssignmentValidation, requestValidator, ctrl.createStaffAssignment);
router.put('/assignments/:assignmentId', assignmentIdParam, updateAssignmentValidation, requestValidator, ctrl.updateStaffAssignment);
router.delete('/assignments/:assignmentId', assignmentIdParam, requestValidator, ctrl.deleteStaffAssignment);

export default router;
