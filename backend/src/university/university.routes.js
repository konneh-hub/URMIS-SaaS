import express from 'express';
import { inviteStaffOrStudent, bulkUploadUsers } from './university.controller.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import upload from '../middleware/upload.js';
import requestValidator from '../middleware/requestValidator.js';
import { institutionIdParamValidation, inviteValidation } from './university.validation.js';
import requireTenantAccess from '../middleware/tenant.js';

const router = express.Router({ mergeParams: true });

// University admin can invite staff and students
router.post('/:institutionId/invite', auth, authorize(['UNIVERSITY_ADMIN']), institutionIdParamValidation, inviteValidation, requestValidator, requireTenantAccess, inviteStaffOrStudent);
router.post('/:institutionId/bulk-upload', auth, authorize(['UNIVERSITY_ADMIN']), institutionIdParamValidation, upload.single('file'), requestValidator, requireTenantAccess, bulkUploadUsers);

export default router;
