const router = require('express').Router();
const { body } = require('express-validator');
const { register, login, me, refresh, logout } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimit');

router.post(
	'/register',
	authLimiter,
	[
		body('name').isString().trim().isLength({ min: 2 }).withMessage('Name required'),
		body('email').isEmail().withMessage('Valid email required'),
		body('password').isLength({ min: 8 }).withMessage('Password min 8 chars'),
	],
	validate,
	register
);

router.post(
	'/login',
	authLimiter,
	[body('email').isEmail(), body('password').isString().isLength({ min: 8 })],
	validate,
	login
);
router.get('/me', auth, me);
router.post('/refresh', refresh);
router.post('/logout', auth, logout);

module.exports = router;
