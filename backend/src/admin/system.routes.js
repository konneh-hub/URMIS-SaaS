import express from 'express';
import { createInstitution, createSystemAdmin } from './system.controller.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import requestValidator from '../middleware/requestValidator.js';
import { createInstitutionValidation, createSystemAdminValidation } from './system.validation.js';

const router = express.Router();

router.post('/institutions', auth, authorize(['SYSTEM_ADMIN']), createInstitutionValidation, requestValidator, createInstitution);
router.post('/users/system-admin', auth, authorize(['SYSTEM_ADMIN']), createSystemAdminValidation, requestValidator, createSystemAdmin);

export default router;
