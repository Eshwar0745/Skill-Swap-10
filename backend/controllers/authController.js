const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { asyncHandler } = require('../utils/asyncHandler');
const User = require('../models/User');

const ACCESS_TTL = process.env.ACCESS_TOKEN_TTL || '15m';
const REFRESH_TTL = process.env.REFRESH_TOKEN_TTL || '30d';

const signAccessToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: ACCESS_TTL });

const signRefreshToken = (user) =>
  jwt.sign({ id: user._id, tokenVersion: user.tokenVersion }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TTL,
  });

function setRefreshCookie(res, token) {
  const secure = (process.env.COOKIE_SECURE || 'false').toLowerCase() === 'true';
  const domain = process.env.COOKIE_DOMAIN || undefined;
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    path: '/api/auth/refresh',
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days client hint; server validates JWT
    ...(domain ? { domain } : {}),
  });
}

/** Build safe user payload – never expose passwordHash, tokenVersion, or email to public */
function safeUserPayload(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email, // only returned to the user themselves during auth
    bio: user.bio,
    location: user.location,
    avatarUrl: user.avatarUrl,
    averageRating: user.averageRating,
    reviewsCount: user.reviewsCount,
    followersCount: user.followersCount || 0,
    followingCount: user.followingCount || 0,
    provider: user.provider || 'local',
    createdAt: user.createdAt,
  };
}

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: 'Email already in use' });
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash, provider: 'local' });
  const token = signAccessToken(user._id);
  const refresh = signRefreshToken(user);
  setRefreshCookie(res, refresh);
  res.status(201).json({
    token,
    user: safeUserPayload(user),
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  if (user.provider === 'google' && !user.passwordHash) {
    return res.status(401).json({ message: 'This account uses Google Sign-In. Please sign in with Google.' });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
  const token = signAccessToken(user._id);
  const refresh = signRefreshToken(user);
  setRefreshCookie(res, refresh);
  res.json({
    token,
    user: safeUserPayload(user),
  });
});

exports.googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ message: 'Google ID token is required' });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ message: 'Google OAuth is not configured on the server' });
  }

  const client = new OAuth2Client(clientId);
  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientId,
    });
    payload = ticket.getPayload();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid Google token' });
  }

  const { sub: googleId, email, name, picture } = payload;

  // Find existing user by googleId or email
  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (user) {
    // Link Google ID if not already linked
    if (!user.googleId) {
      user.googleId = googleId;
      user.provider = 'google';
      if (picture && !user.avatarUrl) user.avatarUrl = picture;
      await user.save();
    }
  } else {
    // Create new user
    user = await User.create({
      name: name || email.split('@')[0],
      email,
      googleId,
      provider: 'google',
      avatarUrl: picture || '',
    });
  }

  const token = signAccessToken(user._id);
  const refresh = signRefreshToken(user);
  setRefreshCookie(res, refresh);
  res.json({
    token,
    user: safeUserPayload(user),
  });
});

exports.me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-passwordHash');
  res.json({ user: safeUserPayload(user) });
});

exports.refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refresh_token;
  if (!token) return res.status(401).json({ message: 'No refresh token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'Invalid refresh token' });
    if (payload.tokenVersion !== user.tokenVersion)
      return res.status(401).json({ message: 'Refresh token revoked' });
    const access = signAccessToken(user._id);
    const refresh = signRefreshToken(user); // rotate cookie
    setRefreshCookie(res, refresh);
    return res.json({ token: access });
  } catch (e) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

exports.logout = asyncHandler(async (req, res) => {
  // Clear cookie and bump tokenVersion to revoke outstanding refresh tokens
  res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { $inc: { tokenVersion: 1 } });
  }
  res.json({ message: 'Logged out' });
});
