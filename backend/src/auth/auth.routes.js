import express from 'express';
import { body } from 'express-validator';
import {
  login,
  register,
  logout,
  refresh,
  acceptInvite,
  updateProfileHandler,
  changePasswordHandler,
  me,
} from './auth.controller.js';
import requestValidator from '../middleware/requestValidator.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

const passwordRule = body('password').isString().isLength({ min: 8 }).withMessage('Password must be at least 8 characters');

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), passwordRule, requestValidator],
  login,
);

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    passwordRule,
    body('name').optional().isString().trim(),
    body('institutionId').optional().isString(),
    body('firstName').optional().isString(),
    body('middleName').optional().isString(),
    body('lastName').optional().isString(),
    body('gender').optional().isString(),
    body('dob').optional().isISO8601(),
    body('nationality').optional().isString(),
    body('address').optional().isString(),
    body('profilePhoto').optional().isString(),
    body('facultyId').optional().isString(),
    body('facultyName').optional().isString(),
    body('departmentId').optional().isString(),
    body('departmentName').optional().isString(),
    body('studentNumber').optional().isString(),
    body('admissionYear').optional().isInt({ min: 1900 }),
    body('profilePhotoBase64').optional().isString(),
    body('admissionDate').optional().isISO8601(),
    body('programme').optional().isString(),
    body('programmeType').optional().isString(),
    body('level').optional().isString(),
    body('academicSession').optional().isString(),
    body('studentStatus').optional().isString(),
    body('phone').optional().isString(),
    body('profile').optional().isObject(),
    requestValidator,
  ],
  register,
);

router.post('/logout', logout);
router.post('/refresh', refresh);
router.post(
  '/accept-invite',
  [body('token').isString().notEmpty(), passwordRule, requestValidator],
  acceptInvite,
);

router.use(authMiddleware);
router.get('/me', me);
router.put('/profile', updateProfileHandler);
router.post(
  '/change-password',
  [body('currentPassword').isString().notEmpty(), body('newPassword').isString().isLength({ min: 8 }), requestValidator],
  changePasswordHandler,
);

export default router;
