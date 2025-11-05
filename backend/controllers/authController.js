const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { asyncHandler } = require('../utils/asyncHandler');
const User = require('../models/User');

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: 'Email already in use' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });
  const token = signToken(user._id);
  res.status(201).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      location: user.location,
      avatarUrl: user.avatarUrl,
      averageRating: user.averageRating,
      reviewsCount: user.reviewsCount,
      createdAt: user.createdAt,
    },
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
  const token = signToken(user._id);
  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      location: user.location,
      avatarUrl: user.avatarUrl,
      averageRating: user.averageRating,
      reviewsCount: user.reviewsCount,
      createdAt: user.createdAt,
    },
  });
});

exports.me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-passwordHash');
  res.json({ user });
});
