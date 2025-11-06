const User = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * Get user profile by ID
 */
exports.getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -tokenVersion')
    .lean();

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user);
});

/**
 * Update user profile
 * Can update: name, bio, location, avatarUrl
 */
exports.updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // Only allow users to update their own profile
  if (String(req.user._id) !== String(userId)) {
    return res.status(403).json({ message: 'You can only update your own profile' });
  }

  const { name, bio, location, avatarUrl } = req.body;

  const updateFields = {};
  if (name !== undefined) updateFields.name = name;
  if (bio !== undefined) updateFields.bio = bio;
  if (location !== undefined) updateFields.location = location;
  if (avatarUrl !== undefined) updateFields.avatarUrl = avatarUrl;

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select('-password -tokenVersion');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user);
});

/**
 * Get current authenticated user's profile
 */
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password -tokenVersion')
    .lean();

  res.json(user);
});
