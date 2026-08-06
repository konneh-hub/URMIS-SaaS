import express from 'express';
import { login, register, logout, refresh, acceptInvite, updateProfileHandler, changePasswordHandler } from './auth.controller.js';
import requestValidator from '../middleware/requestValidator.js';
import { body } from 'express-validator';
import authMiddleware from '../middleware/auth.js';
import { me } from './auth.controller.js';

const router = express.Router();

router.post('/login', [body('email').isEmail(), body('password').isLength({ min: 6 }), requestValidator], login);
router.post(
  '/register',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('name').optional().isString(),
    body('role').optional().isIn(['STUDENT', 'LECTURER', 'HOD', 'DEAN', 'EXAM_OFFICER']),
    body('institutionId').optional().isString(),
    body('facultyId').optional().isString(),
    body('facultyName').optional().isString(),
    body('departmentId').optional().isString(),
    body('departmentName').optional().isString(),
    body('studentNumber').optional().isString(),
    body('admissionYear').optional().isInt({ min: 1900 }),
    body('phone').optional().isString(),
    body('profile').optional().isObject(),
    requestValidator,
  ],
  register
);
router.post('/logout', logout);
router.post('/accept-invite', [body('token').isString(), body('password').isLength({ min: 6 }), requestValidator], acceptInvite);

router.get('/me', authMiddleware, me);
router.put('/profile', authMiddleware, updateProfileHandler);
router.post('/change-password', authMiddleware, changePasswordHandler);
router.post('/refresh', refresh);

export default router;
