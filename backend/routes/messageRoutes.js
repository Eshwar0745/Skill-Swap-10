const router = require('express').Router();
const { auth } = require('../middleware/auth');
const {
  sendMessage,
  getThread,
  markThreadRead,
  unreadCount,
} = require('../controllers/messageController');

router.post('/', auth, sendMessage);
router.get('/thread/:userId', auth, getThread);
router.post('/thread/:userId/read', auth, markThreadRead);
router.get('/unread-count', auth, unreadCount);

module.exports = router;
