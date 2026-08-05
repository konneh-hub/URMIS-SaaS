import express from 'express';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import * as ctrl from './academic.controller.js';
import requestValidator from '../middleware/requestValidator.js';
import {
	facultyIdParam,
	departmentIdParam,
	levelIdParam,
	programmeIdParam,
	sessionIdParam,
	curriculumIdParam,
	allocationIdParam,
	createFacultyValidation,
	updateFacultyValidation,
	createDepartmentValidation,
	updateDepartmentValidation,
	createLevelValidation,
	updateLevelValidation,
	createProgrammeValidation,
	updateProgrammeValidation,
	createAcademicSessionValidation,
	updateAcademicSessionValidation,
	createCurriculumValidation,
	updateCurriculumValidation,
	createCourseAllocationValidation,
	updateCourseAllocationValidation,
} from './academic.validation.js';

const router = express.Router();
router.use(auth, authorize(['SYSTEM_ADMIN', 'UNIVERSITY_ADMIN']));

// Faculty
router.get('/faculties', ctrl.listFaculties);
router.post('/faculties', createFacultyValidation, requestValidator, ctrl.createFaculty);
router.put('/faculties/:facultyId', facultyIdParam, updateFacultyValidation, requestValidator, ctrl.updateFaculty);
router.delete('/faculties/:facultyId', facultyIdParam, requestValidator, ctrl.deleteFaculty);

// Department
router.get('/departments', ctrl.listDepartments);
router.post('/departments', createDepartmentValidation, requestValidator, ctrl.createDepartment);
router.put('/departments/:departmentId', departmentIdParam, updateDepartmentValidation, requestValidator, ctrl.updateDepartment);
router.delete('/departments/:departmentId', departmentIdParam, requestValidator, ctrl.deleteDepartment);

// Level
router.get('/levels', ctrl.listLevels);
router.post('/levels', createLevelValidation, requestValidator, ctrl.createLevel);
router.put('/levels/:levelId', levelIdParam, updateLevelValidation, requestValidator, ctrl.updateLevel);
router.delete('/levels/:levelId', levelIdParam, requestValidator, ctrl.deleteLevel);

// Programme
router.get('/programmes', ctrl.listProgrammes);
router.post('/programmes', createProgrammeValidation, requestValidator, ctrl.createProgramme);
router.put('/programmes/:programmeId', programmeIdParam, updateProgrammeValidation, requestValidator, ctrl.updateProgramme);
router.delete('/programmes/:programmeId', programmeIdParam, requestValidator, ctrl.deleteProgramme);

// Academic Session
router.get('/sessions', ctrl.listAcademicSessions);
router.post('/sessions', createAcademicSessionValidation, requestValidator, ctrl.createAcademicSession);
router.put('/sessions/:sessionId', sessionIdParam, updateAcademicSessionValidation, requestValidator, ctrl.updateAcademicSession);
router.delete('/sessions/:sessionId', sessionIdParam, requestValidator, ctrl.deleteAcademicSession);

// Curriculum
router.get('/curricula', ctrl.listCurricula);
router.post('/curricula', createCurriculumValidation, requestValidator, ctrl.createCurriculum);
router.put('/curricula/:curriculumId', curriculumIdParam, updateCurriculumValidation, requestValidator, ctrl.updateCurriculum);
router.delete('/curricula/:curriculumId', curriculumIdParam, requestValidator, ctrl.deleteCurriculum);

// Course allocation
router.get('/allocations', ctrl.listCourseAllocations);
router.post('/allocations', createCourseAllocationValidation, requestValidator, ctrl.createCourseAllocation);
router.put('/allocations/:allocationId', allocationIdParam, updateCourseAllocationValidation, requestValidator, ctrl.updateCourseAllocation);
router.delete('/allocations/:allocationId', allocationIdParam, requestValidator, ctrl.deleteCourseAllocation);

export default router;
