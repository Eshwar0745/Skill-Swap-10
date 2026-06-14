const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: '' }, // Not required for Google OAuth users
    provider: { type: String, enum: ['local', 'google'], default: 'local' },
    googleId: { type: String, sparse: true },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    badges: { type: [String], default: [] },
    averageRating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// unique index is already defined on the email field; no separate schema.index needed
userSchema.index({ googleId: 1 }, { sparse: true });

module.exports = mongoose.model('User', userSchema);
