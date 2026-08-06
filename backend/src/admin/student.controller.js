import * as studentService from './student.service.js';
import { recordUserAuditLog } from '../auth/auth.service.js';

export async function listStudents(req, res, next) {
  try {
    const students = await studentService.listStudents(req.query);
    res.json({ success: true, data: students.map(studentService.sanitizeStudent) });
  } catch (err) {
    next(err);
  }
}

export async function getStudent(req, res, next) {
  try {
    const student = await studentService.getStudentById(req.params.studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: studentService.sanitizeStudent(student) });
  } catch (err) {
    next(err);
  }
}

export async function createStudent(req, res, next) {
  try {
    const student = await studentService.createStudent(req.body, req.user?.id);
    if (req.user?.id) {
      await recordUserAuditLog({ userId: req.user.id, action: 'create_student', details: student.id, performedBy: req.user.id });
    }
    res.status(201).json({ success: true, data: studentService.sanitizeStudent(student) });
  } catch (err) {
    next(err);
  }
}

export async function updateStudent(req, res, next) {
  try {
    const student = await studentService.updateStudent(req.params.studentId, req.body);
    if (req.user?.id) {
      await recordUserAuditLog({ userId: req.user.id, action: 'update_student', details: req.params.studentId, performedBy: req.user.id });
    }
    res.json({ success: true, data: studentService.sanitizeStudent(student) });
  } catch (err) {
    next(err);
  }
}

export async function deleteStudent(req, res, next) {
  try {
    await studentService.deleteStudent(req.params.studentId);
    if (req.user?.id) {
      await recordUserAuditLog({ userId: req.user.id, action: 'delete_student', details: req.params.studentId, performedBy: req.user.id });
    }
    res.json({ success: true, message: 'Student deleted' });
  } catch (err) {
    next(err);
  }
}

export async function createRegistration(req, res, next) {
  try {
    const registration = await studentService.createRegistration(req.params.studentId, req.body);
    if (req.user?.id) {
      await recordUserAuditLog({ userId: req.user.id, action: 'create_registration', details: registration.id, performedBy: req.user.id });
    }
    res.status(201).json({ success: true, data: registration });
  } catch (err) {
    next(err);
  }
}

export async function updateRegistration(req, res, next) {
  try {
    const registration = await studentService.updateRegistration(req.params.registrationId, req.body);
    if (req.user?.id) {
      await recordUserAuditLog({ userId: req.user.id, action: 'update_registration', details: req.params.registrationId, performedBy: req.user.id });
    }
    res.json({ success: true, data: registration });
  } catch (err) {
    next(err);
  }
}

export async function approveRegistration(req, res, next) {
  try {
    const registration = await studentService.approveRegistration(req.params.registrationId, req.user.id, req.body.approvalNotes);
    if (req.user?.id) {
      await recordUserAuditLog({ userId: req.user.id, action: 'approve_registration', details: req.params.registrationId, performedBy: req.user.id });
    }
    res.json({ success: true, data: registration });
  } catch (err) {
    next(err);
  }
}

export async function dropRegistration(req, res, next) {
  try {
    const registration = await studentService.dropRegistration(req.params.registrationId, req.user.id);
    if (req.user?.id) {
      await recordUserAuditLog({ userId: req.user.id, action: 'drop_registration', details: req.params.registrationId, performedBy: req.user.id });
    }
    res.json({ success: true, data: registration });
  } catch (err) {
    next(err);
  }
}

export async function addRegistration(req, res, next) {
  try {
    const registration = await studentService.addRegistration(req.params.registrationId, req.body);
    if (req.user?.id) {
      await recordUserAuditLog({ userId: req.user.id, action: 'add_registration', details: req.params.registrationId, performedBy: req.user.id });
    }
    res.json({ success: true, data: registration });
  } catch (err) {
    next(err);
  }
}

export async function listRegistrations(req, res, next) {
  try {
    const registrations = await studentService.listRegistrations(req.params.studentId);
    res.json({ success: true, data: registrations });
  } catch (err) {
    next(err);
  }
}

export async function listGuardians(req, res, next) {
  try {
    const guardians = await studentService.listGuardians(req.params.studentId);
    res.json({ success: true, data: guardians });
  } catch (err) {
    next(err);
  }
}

export async function createGuardian(req, res, next) {
  try {
    const guardian = await studentService.createGuardian(req.params.studentId, req.body);
    if (req.user?.id) {
      await recordUserAuditLog({ userId: req.user.id, action: 'create_guardian', details: guardian.id, performedBy: req.user.id });
    }
    res.status(201).json({ success: true, data: guardian });
  } catch (err) {
    next(err);
  }
}

export async function updateGuardian(req, res, next) {
  try {
    const guardian = await studentService.updateGuardian(req.params.guardianId, req.body);
    if (req.user?.id) {
      await recordUserAuditLog({ userId: req.user.id, action: 'update_guardian', details: req.params.guardianId, performedBy: req.user.id });
    }
    res.json({ success: true, data: guardian });
  } catch (err) {
    next(err);
  }
}

export async function deleteGuardian(req, res, next) {
  try {
    await studentService.deleteGuardian(req.params.guardianId);
    if (req.user?.id) {
      await recordUserAuditLog({ userId: req.user.id, action: 'delete_guardian', details: req.params.guardianId, performedBy: req.user.id });
    }
    res.json({ success: true, message: 'Guardian deleted' });
  } catch (err) {
    next(err);
  }
}

export async function listMedicalRecords(req, res, next) {
  try {
    const records = await studentService.listMedicalRecords(req.params.studentId);
    res.json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
}

export async function createMedicalRecord(req, res, next) {
  try {
    const record = await studentService.createMedicalRecord(req.params.studentId, req.body);
    if (req.user?.id) {
      await recordUserAuditLog({ userId: req.user.id, action: 'create_medical_record', details: record.id, performedBy: req.user.id });
    }
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

export async function updateMedicalRecord(req, res, next) {
  try {
    const record = await studentService.updateMedicalRecord(req.params.medicalRecordId, req.body);
    if (req.user?.id) {
      await recordUserAuditLog({ userId: req.user.id, action: 'update_medical_record', details: req.params.medicalRecordId, performedBy: req.user.id });
    }
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

export async function deleteMedicalRecord(req, res, next) {
  try {
    await studentService.deleteMedicalRecord(req.params.medicalRecordId);
    if (req.user?.id) {
      await recordUserAuditLog({ userId: req.user.id, action: 'delete_medical_record', details: req.params.medicalRecordId, performedBy: req.user.id });
    }
    res.json({ success: true, message: 'Medical record deleted' });
  } catch (err) {
    next(err);
  }
}

export async function listDocuments(req, res, next) {
  try {
    const documents = await studentService.listDocuments(req.params.studentId);
    res.json({ success: true, data: documents });
  } catch (err) {
    next(err);
  }
}

export async function createDocument(req, res, next) {
  try {
    const document = await studentService.createDocument(req.params.studentId, req.body);
    if (req.user?.id) {
      await recordUserAuditLog({ userId: req.user.id, action: 'create_document', details: document.id, performedBy: req.user.id });
    }
    res.status(201).json({ success: true, data: document });
  } catch (err) {
    next(err);
  }
}

export async function updateDocument(req, res, next) {
  try {
    const document = await studentService.updateDocument(req.params.documentId, req.body);
    if (req.user?.id) {
      await recordUserAuditLog({ userId: req.user.id, action: 'update_document', details: req.params.documentId, performedBy: req.user.id });
    }
    res.json({ success: true, data: document });
  } catch (err) {
    next(err);
  }
}

export async function deleteDocument(req, res, next) {
  try {
    await studentService.deleteDocument(req.params.documentId);
    if (req.user?.id) {
      await recordUserAuditLog({ userId: req.user.id, action: 'delete_document', details: req.params.documentId, performedBy: req.user.id });
    }
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) {
    next(err);
  }
}

export async function createAcademicHistory(req, res, next) {
  try {
    const history = await studentService.createAcademicHistory(req.params.studentId, req.body);
    if (req.user?.id) {
      await recordUserAuditLog({ userId: req.user.id, action: 'create_academic_history', details: history.id, performedBy: req.user.id });
    }
    res.status(201).json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
}

export async function listAcademicHistory(req, res, next) {
  try {
    const history = await studentService.listAcademicHistory(req.params.studentId);
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
}

export async function getGraduationStatus(req, res, next) {
  try {
    const student = await studentService.getGraduationStatus(req.params.studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    const graduated = student.academicHistories.some((record) => record.level === 'GRADUATED');
    res.json({ success: true, data: { graduated, academicHistories: student.academicHistories } });
  } catch (err) {
    next(err);
  }
}

export { studentService as studentServiceApi };
