const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { asyncHandler } = require('../utils/asyncHandler');

exports.sendMessage = asyncHandler(async (req, res) => {
  const { recipientId, content, exchangeId } = req.body;
  if (!recipientId || !content) {
    return res.status(400).json({ message: 'recipientId and content are required' });
  }
  const msg = await Message.create({
    sender: req.user._id,
    recipient: recipientId,
    content,
    exchange: exchangeId || undefined,
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
