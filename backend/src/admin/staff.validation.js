import { body, param, query } from 'express-validator';

export const idParam = [param('id').isString().notEmpty()];
export const assignmentIdParam = [param('assignmentId').isString().notEmpty()];

export const listStaffQuery = [query('role').optional().isString(), query('departmentId').optional().isString(), query('facultyId').optional().isString()];

export const createStaffValidation = [
  body('email').isEmail(),
  body('name').isString().notEmpty(),
  body('role').optional().isString(),
  body('institutionId').optional().isString(),
  body('departmentId').optional().isString(),
  body('facultyId').optional().isString(),
];
export const updateStaffValidation = [
  body('name').optional().isString(),
  body('role').optional().isString(),
  body('institutionId').optional().isString(),
];

export const createAssignmentValidation = [
  body('title').isString().notEmpty(),
  body('description').optional().isString(),
  body('courseId').optional().isString(),
  body('departmentId').optional().isString(),
  body('facultyId').optional().isString(),
  body('dueDate').optional().isISO8601(),
  body('status').optional().isString(),
];
export const updateAssignmentValidation = [
  body('title').optional().isString(),
  body('description').optional().isString(),
  body('courseId').optional().isString(),
  body('departmentId').optional().isString(),
  body('facultyId').optional().isString(),
  body('dueDate').optional().isISO8601(),
  body('status').optional().isString(),
];
