import express from 'express';
import { inviteStaffOrStudent, bulkUploadUsers } from './university.controller.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import upload from '../middleware/upload.js';

const router = express.Router({ mergeParams: true });

// University admin can invite staff and students
router.post('/:institutionId/invite', auth, authorize(['UNIVERSITY_ADMIN']), inviteStaffOrStudent);
router.post('/:institutionId/bulk-upload', auth, authorize(['UNIVERSITY_ADMIN']), upload.single('file'), bulkUploadUsers);

export default router;
