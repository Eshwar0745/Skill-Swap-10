const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { param, query } = require('express-validator');
const { validate } = require('../middleware/validate');
const {
	listNotifications,
	markAllNotificationsRead,
	markNotificationRead,
    unreadNotificationsCount
} = require('../controllers/notificationController');

// Ensure /mark-all-read comes before /:id to prevent routing conflicts
router.patch('/mark-all-read', auth, markAllNotificationsRead);

router.get('/unread-count', auth, unreadNotificationsCount);

router.get(
	'/',
	auth,
	[
		query('page').optional().isInt({ min: 1 }).toInt(),
		query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
	],
	validate,
	listNotifications
);

router.patch('/:id/read', auth, [param('id').isMongoId()], validate, markNotificationRead);

module.exports = router;
