import express from 'express';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import * as ctrl from './student.controller.js';

const router = express.Router();
router.use(auth, authorize(['SYSTEM_ADMIN', 'UNIVERSITY_ADMIN', 'EXAM_OFFICER']));

router.get('/', ctrl.listStudents);
router.get('/:studentId', ctrl.getStudent);
router.post('/', ctrl.createStudent);
router.put('/:studentId', ctrl.updateStudent);
router.delete('/:studentId', ctrl.deleteStudent);

router.get('/:studentId/registrations', ctrl.listRegistrations);
router.post('/:studentId/registrations', ctrl.createRegistration);
router.put('/registrations/:registrationId', ctrl.updateRegistration);
router.post('/registrations/:registrationId/approve', ctrl.approveRegistration);
router.post('/registrations/:registrationId/drop', ctrl.dropRegistration);
router.post('/registrations/:registrationId/add', ctrl.addRegistration);

router.get('/:studentId/guardians', ctrl.listGuardians);
router.post('/:studentId/guardians', ctrl.createGuardian);
router.put('/guardians/:guardianId', ctrl.updateGuardian);
router.delete('/guardians/:guardianId', ctrl.deleteGuardian);

router.get('/:studentId/medical-records', ctrl.listMedicalRecords);
router.post('/:studentId/medical-records', ctrl.createMedicalRecord);
router.put('/medical-records/:medicalRecordId', ctrl.updateMedicalRecord);
router.delete('/medical-records/:medicalRecordId', ctrl.deleteMedicalRecord);

router.get('/:studentId/documents', ctrl.listDocuments);
router.post('/:studentId/documents', ctrl.createDocument);
router.put('/documents/:documentId', ctrl.updateDocument);
router.delete('/documents/:documentId', ctrl.deleteDocument);

router.get('/:studentId/academic-history', ctrl.listAcademicHistory);
router.post('/:studentId/academic-history', ctrl.createAcademicHistory);

router.get('/:studentId/graduation-status', ctrl.getGraduationStatus);

export default router;
