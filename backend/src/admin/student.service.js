import prisma from '../database/prismaClient.js';

function sanitizeStudent(student) {
  if (!student) return null;
  const { ...rest } = student;
  return rest;
}

export async function listStudents(filters) {
  const where = {};
  if (filters.departmentId) where.departmentId = filters.departmentId;
  if (filters.institutionId) where.institutionId = filters.institutionId;
  if (filters.admissionYear !== undefined) where.admissionYear = Number(filters.admissionYear);
  return prisma.student.findMany({ where, include: { department: true, institution: true, registrations: true, guardians: true, medicalRecords: true, documents: true, academicHistories: true } });
}

export async function getStudentById(studentId) {
  return prisma.student.findUnique({ where: { id: studentId }, include: { department: true, institution: true, registrations: true, guardians: true, medicalRecords: true, documents: true, academicHistories: true } });
}

export async function createStudent(data) {
  return prisma.student.create({
    data: {
      studentNumber: data.studentNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      admissionYear: data.admissionYear,
      institutionId: data.institutionId,
      departmentId: data.departmentId,
      guardians: data.guardian ? { create: data.guardian } : undefined,
      medicalRecords: data.medical ? { create: data.medical } : undefined,
      documents: data.documents ? { create: data.documents } : undefined,
    },
    include: { guardians: true, medicalRecords: true, documents: true, academicHistories: true },
  });
}

export async function updateStudent(studentId, data) {
  return prisma.student.update({
    where: { id: studentId },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      admissionYear: data.admissionYear,
      institutionId: data.institutionId,
      departmentId: data.departmentId,
      guardians: data.guardian
        ? { upsert: data.guardian.map((entry) => ({ where: { id: entry.id || '' }, update: entry, create: entry })) }
        : undefined,
      medicalRecords: data.medical
        ? { upsert: data.medical.map((entry) => ({ where: { id: entry.id || '' }, update: entry, create: entry })) }
        : undefined,
      documents: data.documents
        ? { upsert: data.documents.map((entry) => ({ where: { id: entry.id || '' }, update: entry, create: entry })) }
        : undefined,
    },
    include: { guardians: true, medicalRecords: true, documents: true, academicHistories: true },
  });
}

export async function deleteStudent(studentId) {
  return prisma.student.delete({ where: { id: studentId } });
}

export async function createRegistration(studentId, data) {
  return prisma.courseRegistration.create({ data: { studentId, ...data } });
}

export async function updateRegistration(registrationId, data) {
  return prisma.courseRegistration.update({ where: { id: registrationId }, data });
}

export async function approveRegistration(registrationId, userId, approvalNotes) {
  return prisma.courseRegistration.update({
    where: { id: registrationId },
    data: { approvalStatus: 'APPROVED', approvedById: userId, approvedAt: new Date(), approvalNotes },
  });
}

export async function dropRegistration(registrationId, userId) {
  return prisma.courseRegistration.update({
    where: { id: registrationId },
    data: { status: 'DROPPED', approvalStatus: 'CANCELLED', approvedById: userId, approvedAt: new Date() },
  });
}

export async function addRegistration(registrationId, data) {
  return prisma.courseRegistration.update({
    where: { id: registrationId },
    data: { courseId: data.courseId, semesterId: data.semesterId, sessionId: data.sessionId, status: 'ENROLLED', approvalStatus: 'PENDING' },
  });
}

export async function listRegistrations(studentId) {
  return prisma.courseRegistration.findMany({ where: { studentId } });
}

export async function listGuardians(studentId) {
  return prisma.guardian.findMany({ where: { studentId } });
}

export async function createGuardian(studentId, data) {
  return prisma.guardian.create({ data: { studentId, ...data } });
}

export async function updateGuardian(guardianId, data) {
  return prisma.guardian.update({ where: { id: guardianId }, data });
}

export async function deleteGuardian(guardianId) {
  return prisma.guardian.delete({ where: { id: guardianId } });
}

export async function listMedicalRecords(studentId) {
  return prisma.medicalRecord.findMany({ where: { studentId } });
}

export async function createMedicalRecord(studentId, data) {
  return prisma.medicalRecord.create({ data: { studentId, ...data } });
}

export async function updateMedicalRecord(medicalRecordId, data) {
  return prisma.medicalRecord.update({ where: { id: medicalRecordId }, data });
}

export async function deleteMedicalRecord(medicalRecordId) {
  return prisma.medicalRecord.delete({ where: { id: medicalRecordId } });
}

export async function listDocuments(studentId) {
  return prisma.document.findMany({ where: { studentId } });
}

export async function createDocument(studentId, data) {
  return prisma.document.create({ data: { studentId, ...data } });
}

export async function updateDocument(documentId, data) {
  return prisma.document.update({ where: { id: documentId }, data });
}

export async function deleteDocument(documentId) {
  return prisma.document.delete({ where: { id: documentId } });
}

export async function createAcademicHistory(studentId, data) {
  return prisma.academicHistory.create({ data: { studentId, ...data } });
}

export async function listAcademicHistory(studentId) {
  return prisma.academicHistory.findMany({ where: { studentId } });
}

export async function getGraduationStatus(studentId) {
  return prisma.student.findUnique({ where: { id: studentId }, include: { academicHistories: true, registrations: true, results: true } });
}

export { sanitizeStudent };
