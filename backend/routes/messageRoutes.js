const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validate');
const {
  sendMessage,
  getThread,
  markThreadRead,
  unreadCount,
} = require('../controllers/messageController');

router.post(
  '/',
  auth,
  [
    body('recipientId').isMongoId(),
    body('content').isString().trim().isLength({ min: 1, max: 4000 }),
    body('exchangeId').optional().isMongoId(),
  ],
  validate,
  sendMessage
);
router.get('/thread/:userId', auth, [param('userId').isMongoId()], validate, getThread);
router.post('/thread/:userId/read', auth, [param('userId').isMongoId()], validate, markThreadRead);
router.get('/unread-count', auth, unreadCount);

module.exports = router;
