const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Exchange = require('../models/Exchange');
const User = require('../models/User');
const { sendMail } = require('../services/mailer');
const { asyncHandler } = require('../utils/asyncHandler');

exports.sendMessage = asyncHandler(async (req, res) => {
  const { recipientId, content, exchangeId } = req.body;
  if (!recipientId || !content) {
    return res.status(400).json({ message: 'recipientId and content are required' });
  }

  // Check if users are connected (have an accepted exchange or prior messages)
  const connection = await Exchange.findOne({
    $or: [
      { requester: req.user._id, provider: recipientId, status: 'accepted' },
      { requester: recipientId, provider: req.user._id, status: 'accepted' }
    ]
  });

  const pastMessage = await Message.findOne({
    $or: [
      { sender: req.user._id, recipient: recipientId },
      { sender: recipientId, recipient: req.user._id }
    ]
  });

  if (!connection && !pastMessage) {
    return res.status(403).json({
      message: 'You can only message users with whom you have an accepted skill exchange or prior conversation'
    });
  }

  const msg = await Message.create({
    sender: req.user._id,
    recipient: recipientId,
    content,
    exchange: exchangeId || connection._id,
  });

  // Real-time emit to recipient room (works across instances with Redis adapter)
  const io = req.app.get('io');
  if (io) {
    io.to(`user:${String(recipientId)}`).emit('message:new', {
      _id: msg._id,
      sender: String(req.user._id),
      recipient: String(recipientId),
      content: msg.content,
      createdAt: msg.createdAt,
    });
  }

  // Invalidate unread count cache for recipient
  const redis = req.app.get('redis');
  if (redis) {
    redis.del(`unread:count:${String(recipientId)}`).catch(() => {});
  }

  // Persist an in-app notification for recipient
  try {
    await Notification.create({
      user: recipientId,
      type: 'message',
      title: 'New message',
      body: content.slice(0, 140),
      data: { sender: req.user._id, messageId: msg._id },
    });
    // Optional email notification
    try {
      const toUser = await User.findById(recipientId).lean();
      if (toUser?.email) {
        await sendMail(toUser.email, 'New message on SkillSwap', `<p>You have a new message.</p><p>"${content.slice(0,200)}"</p>`);
      }
    } catch (_) {}
  } catch (_) {}

  res.status(201).json(msg);
});

exports.getThread = asyncHandler(async (req, res) => {
  const otherUserId = req.params.userId;
  const me = String(req.user._id);
  const them = String(otherUserId);
  const messages = await Message.find({
    $or: [
      { sender: me, recipient: them },
      { sender: them, recipient: me },
    ],
  })
    .sort({ createdAt: 1 })
    .select('-__v')
    .lean();
  res.json({ messages });
});

exports.markThreadRead = asyncHandler(async (req, res) => {
  const otherUserId = req.params.userId;
  const me = String(req.user._id);
  const them = String(otherUserId);
  const result = await Message.updateMany(
    { sender: them, recipient: me, readAt: { $exists: false } },
    { $set: { readAt: new Date() } }
  );
  // Invalidate unread count cache for me
  const redis = req.app.get('redis');
  if (redis) {
    redis.del(`unread:count:${me}`).catch(() => {});
  }
  res.json({ updated: result.modifiedCount });
});

exports.unreadCount = asyncHandler(async (req, res) => {
  const me = req.user._id;
  const redis = req.app.get('redis');
  if (redis) {
    const key = `unread:count:${String(me)}`;
    const cached = await redis.get(key);
    if (cached !== null) return res.json({ count: Number(cached) });
    const count = await Message.countDocuments({ recipient: me, readAt: { $exists: false } });
    await redis.setex(key, 30, String(count));
    return res.json({ count });
  } else {
    const count = await Message.countDocuments({ recipient: me, readAt: { $exists: false } });
    return res.json({ count });
  }
});

/**
 * Get list of users current user can message (connected via accepted exchanges)
 */
exports.getConnections = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  // 1. Get all unique users from past messages
  const pastMessages = await Message.find({
    $or: [{ sender: userId }, { recipient: userId }]
  }).sort({ createdAt: -1 }).lean();

  const messagedUserIds = new Set();
  pastMessages.forEach(msg => {
    messagedUserIds.add(String(msg.sender) === String(userId) ? String(msg.recipient) : String(msg.sender));
  });

  
  // 2. Find all accepted OR completed exchanges
  const exchanges = await Exchange.find({
    $or: [
      { requester: userId, status: { $in: ['accepted', 'completed'] } },
      { provider: userId, status: { $in: ['accepted', 'completed'] } }
    ]
  }).lean();

  const exchangeUserIds = new Set();
  const acceptedUserIds = new Set();

  exchanges.forEach(ex => {
    const otherId = String(ex.requester) === String(userId) ? String(ex.provider) : String(ex.requester);
    exchangeUserIds.add(otherId);
    if (ex.status === 'accepted') {
      acceptedUserIds.add(otherId);
    }
  });

  // Merge them
  const allUserIds = Array.from(new Set([...messagedUserIds, ...exchangeUserIds]));

  // Populate users
  const users = await User.find({ _id: { $in: allUserIds } })
    .select('name email avatarUrl averageRating')
    .lean();

  const connections = users.map(u => ({
    userId: u._id,
    name: u.name,
    email: u.email,
    avatar: u.avatarUrl,
    rating: u.averageRating,
    isReadOnly: !acceptedUserIds.has(String(u._id))
  }));

  res.json({ connections });

});
