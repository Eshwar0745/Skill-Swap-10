const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Exchange = require('../models/Exchange');
const User = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');

exports.sendMessage = asyncHandler(async (req, res) => {
  const { recipientId, content, exchangeId } = req.body;
  if (!recipientId || !content) {
    return res.status(400).json({ message: 'recipientId and content are required' });
  }

  // Prevent messaging yourself
  if (String(req.user._id) === String(recipientId)) {
    return res.status(400).json({ message: 'You cannot message yourself' });
  }

  // Check if users are connected (have an accepted or completed exchange)
  const connection = await Exchange.findOne({
    $or: [
      { requester: req.user._id, provider: recipientId, status: { $in: ['accepted', 'completed'] } },
      { requester: recipientId, provider: req.user._id, status: { $in: ['accepted', 'completed'] } },
    ],
  });

  if (!connection) {
    return res.status(403).json({
      message: 'You can only message users with whom you have an accepted or completed skill exchange',
    });
  }

  const sanitizedContent = typeof content === 'string' ? content.slice(0, 4000) : '';

  const msg = await Message.create({
    sender: req.user._id,
    recipient: recipientId,
    content: sanitizedContent,
    exchange: exchangeId || connection._id,
  });

  // Real-time emit to recipient room
  const io = req.app.get('io');
  if (io) {
    io.to(`user:${String(recipientId)}`).emit('message:new', {
      _id: msg._id,
      sender: String(req.user._id),
      senderName: req.user.name,
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
      body: sanitizedContent.slice(0, 140),
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

/**
 * Get list of users current user can message (connected via accepted/completed exchanges)
 * Includes last message preview, unread count, and timestamp
 */
exports.getConnections = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find all accepted or completed exchanges
  const exchanges = await Exchange.find({
    $or: [
      { requester: userId, status: { $in: ['accepted', 'completed'] } },
      { provider: userId, status: { $in: ['accepted', 'completed'] } },
    ],
  })
    .populate('requester', 'name avatarUrl averageRating')
    .populate('provider', 'name avatarUrl averageRating')
    .lean();

  // Extract unique connected users
  const seenUserIds = new Set();
  const connections = [];
  for (const exchange of exchanges) {
    const isRequester = String(exchange.requester._id) === String(userId);
    const otherUser = isRequester ? exchange.provider : exchange.requester;
    const otherId = String(otherUser._id);
    if (seenUserIds.has(otherId)) continue;
    seenUserIds.add(otherId);

    // Get last message between users
    const lastMessage = await Message.findOne({
      $or: [
        { sender: userId, recipient: otherId },
        { sender: otherId, recipient: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .select('content createdAt sender')
      .lean();

    // Get unread count from this user
    const unreadCount = await Message.countDocuments({
      sender: otherId,
      recipient: userId,
      readAt: { $exists: false },
    });

    connections.push({
      userId: otherUser._id,
      name: otherUser.name,
      avatar: otherUser.avatarUrl,
      rating: otherUser.averageRating,
      exchangeId: exchange._id,
      lastMessage: lastMessage
        ? {
            content: lastMessage.content.slice(0, 100),
            createdAt: lastMessage.createdAt,
            isFromMe: String(lastMessage.sender) === String(userId),
          }
        : null,
      unreadCount,
    });
  }

  // Sort by last message timestamp (most recent first)
  connections.sort((a, b) => {
    const aTime = a.lastMessage?.createdAt?.getTime() || 0;
    const bTime = b.lastMessage?.createdAt?.getTime() || 0;
    return bTime - aTime;
  });

  res.json({ connections });
});
