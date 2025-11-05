const Notification = require('../models/Notification');
const { asyncHandler } = require('../utils/asyncHandler');

exports.listNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const filter = { user: req.user._id };
  if (String(unreadOnly) === 'true') filter.readAt = { $exists: false };
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Notification.find(filter, '-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Notification.countDocuments(filter),
  ]);
  res.json({ items, total, page: Number(page), limit: Number(limit) });
});

exports.unreadNotificationsCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ user: req.user._id, readAt: { $exists: false } });
  res.json({ count });
});

exports.markNotificationRead = asyncHandler(async (req, res) => {
  const n = await Notification.findOne({ _id: req.params.id, user: req.user._id });
  if (!n) return res.status(404).json({ message: 'Not found' });
  if (!n.readAt) n.readAt = new Date();
  await n.save();
  res.json(n);
});

exports.markAllNotificationsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { user: req.user._id, readAt: { $exists: false } },
    { $set: { readAt: new Date() } }
  );
  res.json({ updated: result.modifiedCount });
});
