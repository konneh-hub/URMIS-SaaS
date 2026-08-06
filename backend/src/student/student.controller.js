import * as studentService from './student.service.js';

export async function getProfile(req, res, next) {
  try {
    const student = await studentService.getStudentProfile(req.user);
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });
    res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
}

export async function getCourses(req, res, next) {
  try {
    const courses = await studentService.listAvailableCourses(req.user);
    res.json({ success: true, data: courses });
  } catch (err) {
    next(err);
  }
}

export async function getRegisteredCourses(req, res, next) {
  try {
    const courses = await studentService.listRegisteredCourses(req.user);
