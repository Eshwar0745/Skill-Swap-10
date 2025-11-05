const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    averageRating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
