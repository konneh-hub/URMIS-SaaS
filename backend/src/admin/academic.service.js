import prisma from '../database/prismaClient.js';
import { recordUserAuditLog } from '../auth/auth.service.js';

// Faculty
export async function listFaculties() {
  return prisma.faculty.findMany({ include: { institution: true, departments: true, programmes: true } });
}
export async function createFaculty(data, performedBy) {
  const faculty = await prisma.faculty.create({ data });
  await recordUserAuditLog({ userId: performedBy, action: 'create_faculty', details: faculty.id, performedBy });
  return faculty;
}
export async function updateFaculty(id, data, performedBy) {
  const faculty = await prisma.faculty.update({ where: { id }, data });
  await recordUserAuditLog({ userId: performedBy, action: 'update_faculty', details: id, performedBy });
  return faculty;
}
export async function deleteFaculty(id, performedBy) {
  await prisma.faculty.delete({ where: { id } });
  await recordUserAuditLog({ userId: performedBy, action: 'delete_faculty', details: id, performedBy });
}

// Department
export async function listDepartments() {
  return prisma.department.findMany({ include: { faculty: true, institution: true, programmes: true } });
}
export async function createDepartment(data, performedBy) {
  const department = await prisma.department.create({ data });
  await recordUserAuditLog({ userId: performedBy, action: 'create_department', details: department.id, performedBy });
  return department;
}
export async function updateDepartment(id, data, performedBy) {
  const department = await prisma.department.update({ where: { id }, data });
  await recordUserAuditLog({ userId: performedBy, action: 'update_department', details: id, performedBy });
  return department;
}
export async function deleteDepartment(id, performedBy) {
  await prisma.department.delete({ where: { id } });
  await recordUserAuditLog({ userId: performedBy, action: 'delete_department', details: id, performedBy });
}

// Level
export async function listLevels() {
  return prisma.level.findMany({ include: { institution: true, programmes: true } });
}
export async function createLevel(data, performedBy) {
  const level = await prisma.level.create({ data });
  await recordUserAuditLog({ userId: performedBy, action: 'create_level', details: level.id, performedBy });
  return level;
}
export async function updateLevel(id, data, performedBy) {
  const level = await prisma.level.update({ where: { id }, data });
  await recordUserAuditLog({ userId: performedBy, action: 'update_level', details: id, performedBy });
  return level;
}
export async function deleteLevel(id, performedBy) {
  await prisma.level.delete({ where: { id } });
  await recordUserAuditLog({ userId: performedBy, action: 'delete_level', details: id, performedBy });
}

// Programme
export async function listProgrammes() {
  return prisma.programme.findMany({ include: { institution: true, faculty: true, department: true, level: true } });
}
export async function createProgramme(data, performedBy) {
  const programme = await prisma.programme.create({ data });
  await recordUserAuditLog({ userId: performedBy, action: 'create_programme', details: programme.id, performedBy });
  return programme;
}
export async function updateProgramme(id, data, performedBy) {
  const programme = await prisma.programme.update({ where: { id }, data });
  await recordUserAuditLog({ userId: performedBy, action: 'update_programme', details: id, performedBy });
  return programme;
}
export async function deleteProgramme(id, performedBy) {
  await prisma.programme.delete({ where: { id } });
  await recordUserAuditLog({ userId: performedBy, action: 'delete_programme', details: id, performedBy });
}

// Academic Session
export async function listAcademicSessions() {
  return prisma.academicSession.findMany({ include: { institution: true, semesters: true } });
}
export async function createAcademicSession(data, performedBy) {
  const session = await prisma.academicSession.create({ data });
  await recordUserAuditLog({ userId: performedBy, action: 'create_academic_session', details: session.id, performedBy });
  return session;
}
export async function updateAcademicSession(id, data, performedBy) {
  const session = await prisma.academicSession.update({ where: { id }, data });
  await recordUserAuditLog({ userId: performedBy, action: 'update_academic_session', details: id, performedBy });
  return session;
}
export async function deleteAcademicSession(id, performedBy) {
  await prisma.academicSession.delete({ where: { id } });
  await recordUserAuditLog({ userId: performedBy, action: 'delete_academic_session', details: id, performedBy });
}

// Curriculum
export async function listCurricula() {
  return prisma.curriculum.findMany({ include: { programme: true, semester: true, course: true } });
}
export async function createCurriculum(data, performedBy) {
  const curriculum = await prisma.curriculum.create({ data });
  await recordUserAuditLog({ userId: performedBy, action: 'create_curriculum', details: curriculum.id, performedBy });
  return curriculum;
}
export async function updateCurriculum(id, data, performedBy) {
  const curriculum = await prisma.curriculum.update({ where: { id }, data });
  await recordUserAuditLog({ userId: performedBy, action: 'update_curriculum', details: id, performedBy });
  return curriculum;
}
export async function deleteCurriculum(id, performedBy) {
  await prisma.curriculum.delete({ where: { id } });
  await recordUserAuditLog({ userId: performedBy, action: 'delete_curriculum', details: id, performedBy });
}

// Course allocation
export async function listCourseAllocations() {
  return prisma.courseAllocation.findMany({ include: { course: true, lecturer: true, semester: true, session: true, institution: true } });
}
export async function createCourseAllocation(data, performedBy) {
  const allocation = await prisma.courseAllocation.create({ data });
  await recordUserAuditLog({ userId: performedBy, action: 'create_course_allocation', details: allocation.id, performedBy });
  return allocation;
}
export async function updateCourseAllocation(id, data, performedBy) {
  const allocation = await prisma.courseAllocation.update({ where: { id }, data });
  await recordUserAuditLog({ userId: performedBy, action: 'update_course_allocation', details: id, performedBy });
  return allocation;
}
export async function deleteCourseAllocation(id, performedBy) {
  await prisma.courseAllocation.delete({ where: { id } });
  await recordUserAuditLog({ userId: performedBy, action: 'delete_course_allocation', details: id, performedBy });
}
