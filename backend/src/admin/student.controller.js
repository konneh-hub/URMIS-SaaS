import prisma from '../database/prismaClient.js';
import { recordUserAuditLog } from '../auth/auth.service.js';

function sanitizeStudent(student) {
  if (!student) return null;
  const { ...rest } = student;
  return rest;
}

export async function listStudents(req, res, next) {
  try {
    const { departmentId, institutionId, admissionYear } = req.query;
    const where = {};
    if (departmentId) where.departmentId = departmentId;
    if (institutionId) where.institutionId = institutionId;
    if (admissionYear) where.admissionYear = Number(admissionYear);
    const students = await prisma.student.findMany({ where, include: { department: true, institution: true, registrations: true, guardians: true, medicalRecords: true, documents: true, academicHistories: true } });
    res.json({ success: true, data: students.map(sanitizeStudent) });
  } catch (err) {
    next(err);
  }
}

export async function getStudent(req, res, next) {
  try {
    const { studentId } = req.params;
    const student = await prisma.student.findUnique({ where: { id: studentId }, include: { department: true, institution: true, registrations: true, guardians: true, medicalRecords: true, documents: true, academicHistories: true } });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: sanitizeStudent(student) });
  } catch (err) {
    next(err);
  }
}

export async function createStudent(req, res, next) {
  try {
    const { studentNumber, firstName, lastName, email, phone, admissionYear, institutionId, departmentId, profile, guardian, medical, documents } = req.body;
    const student = await prisma.student.create({ data: {
      studentNumber,
      firstName,
      lastName,
      email,
      phone,
      admissionYear,
      institutionId,
      departmentId,
      guardians: guardian ? { create: guardian } : undefined,
      medicalRecords: medical ? { create: medical } : undefined,
      documents: documents ? { create: documents } : undefined,
    }, include: { guardians: true, medicalRecords: true, documents: true, academicHistories: true } });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_student', details: student.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: sanitizeStudent(student) });
  } catch (err) {
    next(err);
  }
}

export async function updateStudent(req, res, next) {
  try {
    const { studentId } = req.params;
    const { firstName, lastName, email, phone, admissionYear, institutionId, departmentId, guardian, medical, documents } = req.body;
    const student = await prisma.student.update({
      where: { id: studentId },
      data: {
        firstName,
        lastName,
        email,
        phone,
        admissionYear,
        institutionId,
        departmentId,
        guardians: guardian ? { upsert: guardian.map((entry) => ({ where: { id: entry.id || '' }, update: entry, create: entry })) } : undefined,
        medicalRecords: medical ? { upsert: medical.map((entry) => ({ where: { id: entry.id || '' }, update: entry, create: entry })) } : undefined,
        documents: documents ? { upsert: documents.map((entry) => ({ where: { id: entry.id || '' }, update: entry, create: entry })) } : undefined,
      },
      include: { guardians: true, medicalRecords: true, documents: true, academicHistories: true },
    });
    await recordUserAuditLog({ userId: req.user.id, action: 'update_student', details: studentId, performedBy: req.user.id });
    res.json({ success: true, data: sanitizeStudent(student) });
  } catch (err) {
    next(err);
  }
}

export async function deleteStudent(req, res, next) {
  try {
    const { studentId } = req.params;
    await prisma.student.delete({ where: { id: studentId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'delete_student', details: studentId, performedBy: req.user.id });
    res.json({ success: true, message: 'Student deleted' });
  } catch (err) {
    next(err);
  }
}

export async function createRegistration(req, res, next) {
  try {
    const { studentId } = req.params;
    const { courseId, sessionId, semesterId, status } = req.body;
    const registration = await prisma.courseRegistration.create({ data: { studentId, courseId, sessionId, semesterId, status } });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_registration', details: registration.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: registration });
  } catch (err) {
    next(err);
  }
}

export async function updateRegistration(req, res, next) {
  try {
    const { registrationId } = req.params;
    const { courseId, sessionId, semesterId, status } = req.body;
    const registration = await prisma.courseRegistration.update({ where: { id: registrationId }, data: { courseId, sessionId, semesterId, status } });
    await recordUserAuditLog({ userId: req.user.id, action: 'update_registration', details: registrationId, performedBy: req.user.id });
    res.json({ success: true, data: registration });
  } catch (err) {
    next(err);
  }
}

export async function approveRegistration(req, res, next) {
  try {
    const { registrationId } = req.params;
    const { approvalNotes } = req.body;
    const registration = await prisma.courseRegistration.update({ where: { id: registrationId }, data: { approvalStatus: 'APPROVED', approvedById: req.user.id, approvedAt: new Date(), approvalNotes } });
    await recordUserAuditLog({ userId: req.user.id, action: 'approve_registration', details: registrationId, performedBy: req.user.id });
    res.json({ success: true, data: registration });
  } catch (err) {
    next(err);
  }
}

export async function dropRegistration(req, res, next) {
  try {
    const { registrationId } = req.params;
    const registration = await prisma.courseRegistration.update({ where: { id: registrationId }, data: { status: 'DROPPED', approvalStatus: 'CANCELLED', approvedById: req.user.id, approvedAt: new Date() } });
    await recordUserAuditLog({ userId: req.user.id, action: 'drop_registration', details: registrationId, performedBy: req.user.id });
    res.json({ success: true, data: registration });
  } catch (err) {
    next(err);
  }
}

export async function addRegistration(req, res, next) {
  try {
    const { registrationId } = req.params;
    const { courseId, semesterId, sessionId } = req.body;
    const registration = await prisma.courseRegistration.update({ where: { id: registrationId }, data: { courseId, semesterId, sessionId, status: 'ENROLLED', approvalStatus: 'PENDING' } });
    await recordUserAuditLog({ userId: req.user.id, action: 'add_registration', details: registrationId, performedBy: req.user.id });
    res.json({ success: true, data: registration });
  } catch (err) {
    next(err);
  }
}

export async function listRegistrations(req, res, next) {
  try {
    const { studentId } = req.params;
    const registrations = await prisma.courseRegistration.findMany({ where: { studentId } });
    res.json({ success: true, data: registrations });
  } catch (err) {
    next(err);
  }
}

export async function listGuardians(req, res, next) {
  try {
    const { studentId } = req.params;
    const guardians = await prisma.guardian.findMany({ where: { studentId } });
    res.json({ success: true, data: guardians });
  } catch (err) {
    next(err);
  }
}

export async function createGuardian(req, res, next) {
  try {
    const { studentId } = req.params;
    const { name, relationship, phone, email, address } = req.body;
    const guardian = await prisma.guardian.create({ data: { studentId, name, relationship, phone, email, address } });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_guardian', details: guardian.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: guardian });
  } catch (err) {
    next(err);
  }
}

export async function updateGuardian(req, res, next) {
  try {
    const { guardianId } = req.params;
    const { name, relationship, phone, email, address } = req.body;
    const guardian = await prisma.guardian.update({ where: { id: guardianId }, data: { name, relationship, phone, email, address } });
    await recordUserAuditLog({ userId: req.user.id, action: 'update_guardian', details: guardianId, performedBy: req.user.id });
    res.json({ success: true, data: guardian });
  } catch (err) {
    next(err);
  }
}

export async function deleteGuardian(req, res, next) {
  try {
    const { guardianId } = req.params;
    await prisma.guardian.delete({ where: { id: guardianId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'delete_guardian', details: guardianId, performedBy: req.user.id });
    res.json({ success: true, message: 'Guardian deleted' });
  } catch (err) {
    next(err);
  }
}

export async function listMedicalRecords(req, res, next) {
  try {
    const { studentId } = req.params;
    const medicalRecords = await prisma.medicalRecord.findMany({ where: { studentId } });
    res.json({ success: true, data: medicalRecords });
  } catch (err) {
    next(err);
  }
}

export async function createMedicalRecord(req, res, next) {
  try {
    const { studentId } = req.params;
    const { recordType, description, date, notes } = req.body;
    const record = await prisma.medicalRecord.create({ data: { studentId, recordType, description, date: date ? new Date(date) : undefined, notes } });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_medical_record', details: record.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

export async function updateMedicalRecord(req, res, next) {
  try {
    const { medicalRecordId } = req.params;
    const { recordType, description, date, notes } = req.body;
    const record = await prisma.medicalRecord.update({ where: { id: medicalRecordId }, data: { recordType, description, date: date ? new Date(date) : undefined, notes } });
    await recordUserAuditLog({ userId: req.user.id, action: 'update_medical_record', details: medicalRecordId, performedBy: req.user.id });
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

export async function deleteMedicalRecord(req, res, next) {
  try {
    const { medicalRecordId } = req.params;
    await prisma.medicalRecord.delete({ where: { id: medicalRecordId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'delete_medical_record', details: medicalRecordId, performedBy: req.user.id });
    res.json({ success: true, message: 'Medical record deleted' });
  } catch (err) {
    next(err);
  }
}

export async function listDocuments(req, res, next) {
  try {
    const { studentId } = req.params;
    const documents = await prisma.document.findMany({ where: { studentId } });
    res.json({ success: true, data: documents });
  } catch (err) {
    next(err);
  }
}

export async function createDocument(req, res, next) {
  try {
    const { studentId } = req.params;
    const { type, url, description } = req.body;
    const document = await prisma.document.create({ data: { studentId, type, url, description } });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_document', details: document.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: document });
  } catch (err) {
    next(err);
  }
}

export async function updateDocument(req, res, next) {
  try {
    const { documentId } = req.params;
    const { type, url, description } = req.body;
    const document = await prisma.document.update({ where: { id: documentId }, data: { type, url, description } });
    await recordUserAuditLog({ userId: req.user.id, action: 'update_document', details: documentId, performedBy: req.user.id });
    res.json({ success: true, data: document });
  } catch (err) {
    next(err);
  }
}

export async function deleteDocument(req, res, next) {
  try {
    const { documentId } = req.params;
    await prisma.document.delete({ where: { id: documentId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'delete_document', details: documentId, performedBy: req.user.id });
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) {
    next(err);
  }
}

export async function createAcademicHistory(req, res, next) {
  try {
    const { studentId } = req.params;
    const { sessionId, semesterId, level, gpa, remarks } = req.body;
    const history = await prisma.academicHistory.create({ data: { studentId, sessionId, semesterId, level, gpa, remarks } });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_academic_history', details: history.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
}

export async function listAcademicHistory(req, res, next) {
  try {
    const { studentId } = req.params;
    const history = await prisma.academicHistory.findMany({ where: { studentId } });
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
}

export async function getGraduationStatus(req, res, next) {
  try {
    const { studentId } = req.params;
    const student = await prisma.student.findUnique({ where: { id: studentId }, include: { academicHistories: true, registrations: true, results: true } });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    const graduated = student.academicHistories.some((record) => record.level === 'GRADUATED');
    res.json({ success: true, data: { graduated, academicHistories: student.academicHistories } });
  } catch (err) {
    next(err);
  }
}
