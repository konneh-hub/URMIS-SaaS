import prisma from '../database/prismaClient.js';
import { recordUserAuditLog } from '../auth/auth.service.js';

// Faculty
export async function listFaculties(req, res, next) {
  try {
    const faculties = await prisma.faculty.findMany({ include: { institution: true, departments: true, programmes: true } });
    res.json({ success: true, data: faculties });
  } catch (err) {
    next(err);
  }
}

export async function createFaculty(req, res, next) {
  try {
    const { name, code, institutionId } = req.body;
    const faculty = await prisma.faculty.create({ data: { name, code, institutionId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_faculty', details: faculty.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: faculty });
  } catch (err) {
    next(err);
  }
}

export async function updateFaculty(req, res, next) {
  try {
    const { facultyId } = req.params;
    const { name, code, institutionId } = req.body;
    const faculty = await prisma.faculty.update({ where: { id: facultyId }, data: { name, code, institutionId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'update_faculty', details: facultyId, performedBy: req.user.id });
    res.json({ success: true, data: faculty });
  } catch (err) {
    next(err);
  }
}

export async function deleteFaculty(req, res, next) {
  try {
    const { facultyId } = req.params;
    await prisma.faculty.delete({ where: { id: facultyId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'delete_faculty', details: facultyId, performedBy: req.user.id });
    res.json({ success: true, message: 'Faculty deleted' });
  } catch (err) {
    next(err);
  }
}

// Department
export async function listDepartments(req, res, next) {
  try {
    const departments = await prisma.department.findMany({ include: { faculty: true, institution: true, programmes: true } });
    res.json({ success: true, data: departments });
  } catch (err) {
    next(err);
  }
}

export async function createDepartment(req, res, next) {
  try {
    const { name, code, facultyId, institutionId } = req.body;
    const department = await prisma.department.create({ data: { name, code, facultyId, institutionId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_department', details: department.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: department });
  } catch (err) {
    next(err);
  }
}

export async function updateDepartment(req, res, next) {
  try {
    const { departmentId } = req.params;
    const { name, code, facultyId, institutionId } = req.body;
    const department = await prisma.department.update({ where: { id: departmentId }, data: { name, code, facultyId, institutionId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'update_department', details: departmentId, performedBy: req.user.id });
    res.json({ success: true, data: department });
  } catch (err) {
    next(err);
  }
}

export async function deleteDepartment(req, res, next) {
  try {
    const { departmentId } = req.params;
    await prisma.department.delete({ where: { id: departmentId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'delete_department', details: departmentId, performedBy: req.user.id });
    res.json({ success: true, message: 'Department deleted' });
  } catch (err) {
    next(err);
  }
}

// Level
export async function listLevels(req, res, next) {
  try {
    const levels = await prisma.level.findMany({ include: { institution: true, programmes: true } });
    res.json({ success: true, data: levels });
  } catch (err) {
    next(err);
  }
}

export async function createLevel(req, res, next) {
  try {
    const { name, code, description, institutionId } = req.body;
    const level = await prisma.level.create({ data: { name, code, description, institutionId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_level', details: level.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: level });
  } catch (err) {
    next(err);
  }
}

export async function updateLevel(req, res, next) {
  try {
    const { levelId } = req.params;
    const { name, code, description, institutionId } = req.body;
    const level = await prisma.level.update({ where: { id: levelId }, data: { name, code, description, institutionId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'update_level', details: levelId, performedBy: req.user.id });
    res.json({ success: true, data: level });
  } catch (err) {
    next(err);
  }
}

export async function deleteLevel(req, res, next) {
  try {
    const { levelId } = req.params;
    await prisma.level.delete({ where: { id: levelId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'delete_level', details: levelId, performedBy: req.user.id });
    res.json({ success: true, message: 'Level deleted' });
  } catch (err) {
    next(err);
  }
}

// Programme
export async function listProgrammes(req, res, next) {
  try {
    const programmes = await prisma.programme.findMany({ include: { institution: true, faculty: true, department: true, level: true } });
    res.json({ success: true, data: programmes });
  } catch (err) {
    next(err);
  }
}

export async function createProgramme(req, res, next) {
  try {
    const { title, code, description, institutionId, facultyId, departmentId, levelId } = req.body;
    const programme = await prisma.programme.create({ data: { title, code, description, institutionId, facultyId, departmentId, levelId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_programme', details: programme.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: programme });
  } catch (err) {
    next(err);
  }
}

export async function updateProgramme(req, res, next) {
  try {
    const { programmeId } = req.params;
    const { title, code, description, institutionId, facultyId, departmentId, levelId } = req.body;
    const programme = await prisma.programme.update({ where: { id: programmeId }, data: { title, code, description, institutionId, facultyId, departmentId, levelId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'update_programme', details: programmeId, performedBy: req.user.id });
    res.json({ success: true, data: programme });
  } catch (err) {
    next(err);
  }
}

export async function deleteProgramme(req, res, next) {
  try {
    const { programmeId } = req.params;
    await prisma.programme.delete({ where: { id: programmeId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'delete_programme', details: programmeId, performedBy: req.user.id });
    res.json({ success: true, message: 'Programme deleted' });
  } catch (err) {
    next(err);
  }
}

// Academic Session
export async function listAcademicSessions(req, res, next) {
  try {
    const sessions = await prisma.academicSession.findMany({ include: { institution: true, semesters: true } });
    res.json({ success: true, data: sessions });
  } catch (err) {
    next(err);
  }
}

export async function createAcademicSession(req, res, next) {
  try {
    const { name, institutionId, startDate, endDate, active } = req.body;
    const session = await prisma.academicSession.create({ data: { name, institutionId, startDate: new Date(startDate), endDate: new Date(endDate), active: !!active } });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_academic_session', details: session.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
}

export async function updateAcademicSession(req, res, next) {
  try {
    const { sessionId } = req.params;
    const { name, institutionId, startDate, endDate, active } = req.body;
    const session = await prisma.academicSession.update({ where: { id: sessionId }, data: { name, institutionId, startDate: startDate ? new Date(startDate) : undefined, endDate: endDate ? new Date(endDate) : undefined, active: active !== undefined ? !!active : undefined } });
    await recordUserAuditLog({ userId: req.user.id, action: 'update_academic_session', details: sessionId, performedBy: req.user.id });
    res.json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
}

export async function deleteAcademicSession(req, res, next) {
  try {
    const { sessionId } = req.params;
    await prisma.academicSession.delete({ where: { id: sessionId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'delete_academic_session', details: sessionId, performedBy: req.user.id });
    res.json({ success: true, message: 'Academic session deleted' });
  } catch (err) {
    next(err);
  }
}

// Curriculum
export async function listCurricula(req, res, next) {
  try {
    const curricula = await prisma.curriculum.findMany({ include: { programme: true, semester: true, course: true } });
    res.json({ success: true, data: curricula });
  } catch (err) {
    next(err);
  }
}

export async function createCurriculum(req, res, next) {
  try {
    const { programmeId, year, semesterId, courseId } = req.body;
    const curriculum = await prisma.curriculum.create({ data: { programmeId, year, semesterId, courseId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_curriculum', details: curriculum.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: curriculum });
  } catch (err) {
    next(err);
  }
}

export async function updateCurriculum(req, res, next) {
  try {
    const { curriculumId } = req.params;
    const { programmeId, year, semesterId, courseId } = req.body;
    const curriculum = await prisma.curriculum.update({ where: { id: curriculumId }, data: { programmeId, year, semesterId, courseId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'update_curriculum', details: curriculumId, performedBy: req.user.id });
    res.json({ success: true, data: curriculum });
  } catch (err) {
    next(err);
  }
}

export async function deleteCurriculum(req, res, next) {
  try {
    const { curriculumId } = req.params;
    await prisma.curriculum.delete({ where: { id: curriculumId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'delete_curriculum', details: curriculumId, performedBy: req.user.id });
    res.json({ success: true, message: 'Curriculum deleted' });
  } catch (err) {
    next(err);
  }
}

// Course allocation
export async function listCourseAllocations(req, res, next) {
  try {
    const allocations = await prisma.courseAllocation.findMany({ include: { course: true, lecturer: true, semester: true, session: true, institution: true } });
    res.json({ success: true, data: allocations });
  } catch (err) {
    next(err);
  }
}

export async function createCourseAllocation(req, res, next) {
  try {
    const { courseId, lecturerId, semesterId, sessionId, institutionId } = req.body;
    const allocation = await prisma.courseAllocation.create({ data: { courseId, lecturerId, semesterId, sessionId, institutionId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_course_allocation', details: allocation.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: allocation });
  } catch (err) {
    next(err);
  }
}

export async function updateCourseAllocation(req, res, next) {
  try {
    const { allocationId } = req.params;
    const { courseId, lecturerId, semesterId, sessionId, institutionId } = req.body;
    const allocation = await prisma.courseAllocation.update({ where: { id: allocationId }, data: { courseId, lecturerId, semesterId, sessionId, institutionId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'update_course_allocation', details: allocationId, performedBy: req.user.id });
    res.json({ success: true, data: allocation });
  } catch (err) {
    next(err);
  }
}

export async function deleteCourseAllocation(req, res, next) {
  try {
    const { allocationId } = req.params;
    await prisma.courseAllocation.delete({ where: { id: allocationId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'delete_course_allocation', details: allocationId, performedBy: req.user.id });
    res.json({ success: true, message: 'Course allocation deleted' });
  } catch (err) {
    next(err);
  }
}
