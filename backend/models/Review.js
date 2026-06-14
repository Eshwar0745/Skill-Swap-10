const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    exchange: { type: mongoose.Schema.Types.ObjectId, ref: 'Exchange', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: '' },
  },
  { timestamps: true }
);

reviewSchema.index({ reviewee: 1, createdAt: -1 });
// Prevent duplicate reviews: one review per reviewer per exchange
reviewSchema.index({ reviewer: 1, exchange: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
