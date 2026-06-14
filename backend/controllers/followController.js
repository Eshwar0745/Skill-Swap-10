const Follow = require('../models/Follow');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { asyncHandler } = require('../utils/asyncHandler');

exports.followUser = asyncHandler(async (req, res) => {
  const followerId = String(req.user._id);
  const followingId = String(req.params.id);

  if (followerId === followingId) {
    return res.status(400).json({ message: 'You cannot follow yourself' });
  }

  const targetUser = await User.findById(followingId);
  if (!targetUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Check if already following
  const existing = await Follow.findOne({ follower: followerId, following: followingId });
  if (existing) {
    return res.status(409).json({ message: 'You are already following this user' });
  }

  await Follow.create({ follower: followerId, following: followingId });

  // Update counts
  await User.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } });
  await User.findByIdAndUpdate(followingId, { $inc: { followersCount: 1 } });

  // Notify the followed user
  try {
    await Notification.create({
      user: followingId,
      type: 'follow',
      title: 'New follower',
      body: `${req.user.name} started following you!`,
      data: { followerId },
    });
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${followingId}`).emit('notification:new', {
        type: 'follow',
        title: 'New follower',
      });
    }
  } catch (_) {}

  res.json({ message: 'Followed successfully' });
});

exports.unfollowUser = asyncHandler(async (req, res) => {
  const followerId = String(req.user._id);
  const followingId = String(req.params.id);

  const result = await Follow.findOneAndDelete({ follower: followerId, following: followingId });
  if (!result) {
    return res.status(404).json({ message: 'You are not following this user' });
  }

  // Update counts (floor at 0)
  await User.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } });
  await User.findByIdAndUpdate(followingId, { $inc: { followersCount: -1 } });

  // Ensure counts don't go negative
  await User.updateMany(
    { _id: { $in: [followerId, followingId] }, followersCount: { $lt: 0 } },
    { $set: { followersCount: 0 } }
  );
  await User.updateMany(
    { _id: { $in: [followerId, followingId] }, followingCount: { $lt: 0 } },
    { $set: { followingCount: 0 } }
  );

  res.json({ message: 'Unfollowed successfully' });
});

exports.getFollowers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Follow.find({ following: req.params.id })
      .populate('follower', 'name avatarUrl location averageRating followersCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Follow.countDocuments({ following: req.params.id }),
  ]);
  res.json({
    items: items.map((f) => f.follower),
    total,
    page: Number(page),
    limit: Number(limit),
  });
});

exports.getFollowing = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Follow.find({ follower: req.params.id })
      .populate('following', 'name avatarUrl location averageRating followersCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Follow.countDocuments({ follower: req.params.id }),
  ]);
  res.json({
    items: items.map((f) => f.following),
    total,
    page: Number(page),
    limit: Number(limit),
  });
});

exports.checkFollowing = asyncHandler(async (req, res) => {
  const followerId = String(req.user._id);
  const followingId = String(req.params.id);
  const isFollowing = !!(await Follow.findOne({ follower: followerId, following: followingId }));
  res.json({ isFollowing });
});
