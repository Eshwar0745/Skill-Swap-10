const Message = require('../models/Message');
const { asyncHandler } = require('../utils/asyncHandler');

exports.sendMessage = asyncHandler(async (req, res) => {
  const { recipientId, content } = req.body;
  if (!recipientId || !content) {
    return res.status(400).json({ message: 'recipientId and content are required' });
  }
  const msg = await Message.create({
    sender: req.user._id,
    recipient: recipientId,
    content,
  });

  // Real-time emit if recipient online
  const io = req.app.get('io');
  const onlineUsers = req.app.get('onlineUsers');
  const socketId = onlineUsers.get(String(recipientId));
  if (io && socketId) {
    io.to(socketId).emit('message:new', {
      _id: msg._id,
      sender: String(req.user._id),
      recipient: String(recipientId),
      content: msg.content,
      createdAt: msg.createdAt,
    });
  }

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
  res.json({ updated: result.modifiedCount });
});

exports.unreadCount = asyncHandler(async (req, res) => {
  const me = req.user._id;
  const count = await Message.countDocuments({ recipient: me, readAt: { $exists: false } });
  res.json({ count });
});
