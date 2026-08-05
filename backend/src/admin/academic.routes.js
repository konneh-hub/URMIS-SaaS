import express from 'express';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import * as ctrl from './academic.controller.js';

const router = express.Router();
router.use(auth, authorize(['SYSTEM_ADMIN', 'UNIVERSITY_ADMIN']));

// Faculty
router.get('/faculties', ctrl.listFaculties);
router.post('/faculties', ctrl.createFaculty);
router.put('/faculties/:facultyId', ctrl.updateFaculty);
router.delete('/faculties/:facultyId', ctrl.deleteFaculty);

// Department
router.get('/departments', ctrl.listDepartments);
router.post('/departments', ctrl.createDepartment);
router.put('/departments/:departmentId', ctrl.updateDepartment);
router.delete('/departments/:departmentId', ctrl.deleteDepartment);

// Level
router.get('/levels', ctrl.listLevels);
router.post('/levels', ctrl.createLevel);
router.put('/levels/:levelId', ctrl.updateLevel);
router.delete('/levels/:levelId', ctrl.deleteLevel);

// Programme
router.get('/programmes', ctrl.listProgrammes);
router.post('/programmes', ctrl.createProgramme);
router.put('/programmes/:programmeId', ctrl.updateProgramme);
router.delete('/programmes/:programmeId', ctrl.deleteProgramme);

// Academic Session
router.get('/sessions', ctrl.listAcademicSessions);
router.post('/sessions', ctrl.createAcademicSession);
router.put('/sessions/:sessionId', ctrl.updateAcademicSession);
router.delete('/sessions/:sessionId', ctrl.deleteAcademicSession);

// Curriculum
router.get('/curricula', ctrl.listCurricula);
router.post('/curricula', ctrl.createCurriculum);
router.put('/curricula/:curriculumId', ctrl.updateCurriculum);
router.delete('/curricula/:curriculumId', ctrl.deleteCurriculum);

// Course allocation
router.get('/allocations', ctrl.listCourseAllocations);
router.post('/allocations', ctrl.createCourseAllocation);
router.put('/allocations/:allocationId', ctrl.updateCourseAllocation);
router.delete('/allocations/:allocationId', ctrl.deleteCourseAllocation);

export default router;
