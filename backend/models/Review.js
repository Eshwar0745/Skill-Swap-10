const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: '' },
    context: {
      type: String,
      enum: ['offered', 'requested', 'general'],
      default: 'general',
    },
    skillId: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

reviewSchema.index({ reviewee: 1, createdAt: -1 });
reviewSchema.index({ reviewer: 1, reviewee: 1 });

module.exports = mongoose.model('Review', reviewSchema);
