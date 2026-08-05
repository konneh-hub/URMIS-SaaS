import { body, param } from 'express-validator';

// Params
export const facultyIdParam = [param('facultyId').isString().notEmpty()];
export const departmentIdParam = [param('departmentId').isString().notEmpty()];
export const levelIdParam = [param('levelId').isString().notEmpty()];
export const programmeIdParam = [param('programmeId').isString().notEmpty()];
export const sessionIdParam = [param('sessionId').isString().notEmpty()];
export const curriculumIdParam = [param('curriculumId').isString().notEmpty()];
export const allocationIdParam = [param('allocationId').isString().notEmpty()];

// Faculty
export const createFacultyValidation = [body('name').isString().notEmpty(), body('code').optional().isString(), body('institutionId').optional().isString()];
export const updateFacultyValidation = [body('name').optional().isString(), body('code').optional().isString(), body('institutionId').optional().isString()];

// Department
export const createDepartmentValidation = [body('name').isString().notEmpty(), body('code').optional().isString(), body('facultyId').isString().notEmpty(), body('institutionId').optional().isString()];
export const updateDepartmentValidation = [body('name').optional().isString(), body('code').optional().isString(), body('facultyId').optional().isString(), body('institutionId').optional().isString()];

// Level
export const createLevelValidation = [body('name').isString().notEmpty(), body('code').optional().isString(), body('description').optional().isString(), body('institutionId').optional().isString()];
export const updateLevelValidation = [body('name').optional().isString(), body('code').optional().isString(), body('description').optional().isString(), body('institutionId').optional().isString()];

// Programme
export const createProgrammeValidation = [body('title').isString().notEmpty(), body('code').optional().isString(), body('description').optional().isString(), body('institutionId').optional().isString(), body('facultyId').optional().isString(), body('departmentId').optional().isString(), body('levelId').optional().isString()];
export const updateProgrammeValidation = [body('title').optional().isString(), body('code').optional().isString(), body('description').optional().isString(), body('institutionId').optional().isString(), body('facultyId').optional().isString(), body('departmentId').optional().isString(), body('levelId').optional().isString()];

// Academic Session
export const createAcademicSessionValidation = [body('name').isString().notEmpty(), body('institutionId').optional().isString(), body('startDate').optional().isISO8601(), body('endDate').optional().isISO8601(), body('active').optional().isBoolean()];
export const updateAcademicSessionValidation = [body('name').optional().isString(), body('institutionId').optional().isString(), body('startDate').optional().isISO8601(), body('endDate').optional().isISO8601(), body('active').optional().isBoolean()];

// Curriculum
export const createCurriculumValidation = [body('programmeId').isString().notEmpty(), body('year').isInt(), body('semesterId').isString().notEmpty(), body('courseId').isString().notEmpty()];
export const updateCurriculumValidation = [body('programmeId').optional().isString(), body('year').optional().isInt(), body('semesterId').optional().isString(), body('courseId').optional().isString()];

// Course allocation
export const createCourseAllocationValidation = [body('courseId').isString().notEmpty(), body('lecturerId').isString().notEmpty(), body('semesterId').isString().notEmpty(), body('sessionId').isString().notEmpty(), body('institutionId').optional().isString()];
export const updateCourseAllocationValidation = [body('courseId').optional().isString(), body('lecturerId').optional().isString(), body('semesterId').optional().isString(), body('sessionId').optional().isString(), body('institutionId').optional().isString()];
