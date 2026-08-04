import express from 'express';
import { createInstitution, createSystemAdmin } from './system.controller.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();

// Only SYSTEM_ADMIN can manage institutions and system-level admins
router.post('/institutions', auth, authorize(['SYSTEM_ADMIN']), createInstitution);
router.post('/users/system-admin', auth, authorize(['SYSTEM_ADMIN']), createSystemAdmin);

export default router;
