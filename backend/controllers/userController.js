const User = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * Get user profile by ID (public — no email, no passwordHash, no tokenVersion)
 */
exports.getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-passwordHash -tokenVersion -email -googleId')
    .lean();

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user);
});

/**
 * Update user profile
 * Can update: name, bio, location
 */
exports.updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // Only allow users to update their own profile
  if (String(req.user._id) !== String(userId)) {
    return res.status(403).json({ message: 'You can only update your own profile' });
  }

  const { name, bio, location } = req.body;

  const updateFields = {};
  if (name !== undefined) updateFields.name = typeof name === 'string' ? name.trim().slice(0, 100) : undefined;
  if (bio !== undefined) updateFields.bio = typeof bio === 'string' ? bio.trim().slice(0, 500) : undefined;
  if (location !== undefined) updateFields.location = typeof location === 'string' ? location.trim().slice(0, 100) : undefined;

  // Remove undefined fields
  Object.keys(updateFields).forEach((k) => updateFields[k] === undefined && delete updateFields[k]);

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select('-passwordHash -tokenVersion -googleId');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user);
});

/**
 * Get current authenticated user's profile (includes email for own use)
 */
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-passwordHash -tokenVersion -googleId')
    .lean();

  res.json(user);
});

/**
 * Upload and set avatar image for current user
 */
exports.uploadAvatar = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  if (String(req.user._id) !== String(userId)) {
    return res.status(403).json({ message: 'You can only update your own avatar' });
  }
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const relPath = `/uploads/avatars/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { avatarUrl: relPath } },
    { new: true }
  ).select('-passwordHash -tokenVersion -googleId');
  res.json({ avatarUrl: relPath, user });
});
