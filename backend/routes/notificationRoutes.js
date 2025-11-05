const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { query, param } = require('express-validator');
const { validate } = require('../middleware/validate');
const {
  listNotifications,
  unreadNotificationsCount,
  markNotificationRead,
  markAllNotificationsRead,
} = require('../controllers/notificationController');

router.get(
  '/',
  auth,
  [query('page').optional().isInt({ min: 1 }).toInt(), query('limit').optional().isInt({ min: 1, max: 100 }).toInt(), query('unreadOnly').optional().isBoolean().toBoolean()],
  validate,
  listNotifications
);
router.get('/unread-count', auth, unreadNotificationsCount);
router.post('/:id/read', auth, [param('id').isMongoId()], validate, markNotificationRead);
router.post('/mark-all-read', auth, markAllNotificationsRead);

module.exports = router;
