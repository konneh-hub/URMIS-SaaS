import express from 'express';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import requestValidator from '../middleware/requestValidator.js';
import * as ctrl from './student.controller.js';
import {
  studentIdParamValidation,
  registrationIdParamValidation,
  guardianIdParamValidation,
  medicalRecordIdParamValidation,
  documentIdParamValidation,
  createStudentValidation,
  updateStudentValidation,
  registrationValidation,
  registrationUpdateValidation,
  approveRegistrationValidation,
  guardianValidation,
  medicalRecordValidation,
  documentValidation,
  academicHistoryValidation,
  studentQueryValidation,
} from './student.validation.js';

const router = express.Router();
router.use(auth, authorize(['SYSTEM_ADMIN', 'UNIVERSITY_ADMIN', 'EXAM_OFFICER']));

router.get('/', studentQueryValidation, requestValidator, ctrl.listStudents);
router.get('/:studentId', studentIdParamValidation, requestValidator, ctrl.getStudent);
router.post('/', createStudentValidation, requestValidator, ctrl.createStudent);
router.put('/:studentId', studentIdParamValidation, updateStudentValidation, requestValidator, ctrl.updateStudent);
router.delete('/:studentId', studentIdParamValidation, requestValidator, ctrl.deleteStudent);

router.get('/:studentId/registrations', studentIdParamValidation, requestValidator, ctrl.listRegistrations);
router.post('/:studentId/registrations', studentIdParamValidation, registrationValidation, requestValidator, ctrl.createRegistration);
router.put('/registrations/:registrationId', registrationIdParamValidation, registrationUpdateValidation, requestValidator, ctrl.updateRegistration);
router.post('/registrations/:registrationId/approve', registrationIdParamValidation, approveRegistrationValidation, requestValidator, ctrl.approveRegistration);
router.post('/registrations/:registrationId/drop', registrationIdParamValidation, requestValidator, ctrl.dropRegistration);
router.post('/registrations/:registrationId/add', registrationIdParamValidation, registrationValidation, requestValidator, ctrl.addRegistration);

router.get('/:studentId/guardians', studentIdParamValidation, requestValidator, ctrl.listGuardians);
router.post('/:studentId/guardians', studentIdParamValidation, guardianValidation, requestValidator, ctrl.createGuardian);
router.put('/guardians/:guardianId', guardianIdParamValidation, guardianValidation, requestValidator, ctrl.updateGuardian);
router.delete('/guardians/:guardianId', guardianIdParamValidation, requestValidator, ctrl.deleteGuardian);

router.get('/:studentId/medical-records', studentIdParamValidation, requestValidator, ctrl.listMedicalRecords);
router.post('/:studentId/medical-records', studentIdParamValidation, medicalRecordValidation, requestValidator, ctrl.createMedicalRecord);
router.put('/medical-records/:medicalRecordId', medicalRecordIdParamValidation, medicalRecordValidation, requestValidator, ctrl.updateMedicalRecord);
router.delete('/medical-records/:medicalRecordId', medicalRecordIdParamValidation, requestValidator, ctrl.deleteMedicalRecord);

router.get('/:studentId/documents', studentIdParamValidation, requestValidator, ctrl.listDocuments);
router.post('/:studentId/documents', studentIdParamValidation, documentValidation, requestValidator, ctrl.createDocument);
router.put('/documents/:documentId', documentIdParamValidation, documentValidation, requestValidator, ctrl.updateDocument);
router.delete('/documents/:documentId', documentIdParamValidation, requestValidator, ctrl.deleteDocument);

router.get('/:studentId/academic-history', studentIdParamValidation, requestValidator, ctrl.listAcademicHistory);
router.post('/:studentId/academic-history', studentIdParamValidation, academicHistoryValidation, requestValidator, ctrl.createAcademicHistory);

router.get('/:studentId/graduation-status', studentIdParamValidation, requestValidator, ctrl.getGraduationStatus);

export default router;
