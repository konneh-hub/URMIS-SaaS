import express from 'express';
import { login, register, logout, refresh } from './auth.controller.js';
import requestValidator from '../middleware/requestValidator.js';
import { body } from 'express-validator';
import authMiddleware from '../middleware/auth.js';
import { me } from './auth.controller.js';

const router = express.Router();

router.post('/login', [body('email').isEmail(), body('password').isLength({ min: 6 }), requestValidator], login);
router.post('/register', [body('email').isEmail(), body('password').isLength({ min: 6 }), requestValidator], register);
router.post('/logout', logout);
router.post('/accept-invite', [body('token').isString(), body('password').isLength({ min: 6 }), requestValidator], async (req, res, next) => {
	try {
		const { token, password } = req.body;
		const user = await (await import('./auth.service.js')).acceptInvite(token, password);
		res.json({ success: true, data: user });
	} catch (err) {
		next(err);
	}
});

router.get('/me', authMiddleware, me);
router.post('/refresh', refresh);

export default router;
