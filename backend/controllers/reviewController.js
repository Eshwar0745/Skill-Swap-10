const Review = require('../models/Review');
const User = require('../models/User');
const Exchange = require('../models/Exchange');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const { asyncHandler } = require('../utils/asyncHandler');

async function recomputeUserRating(userId) {
  const agg = await Review.aggregate([
    { $match: { reviewee: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$reviewee', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const avg = agg[0]?.avg || 0;
  const count = agg[0]?.count || 0;
  await User.findByIdAndUpdate(userId, { averageRating: avg, reviewsCount: count });
}

async function recomputeBadges(userId) {
  const user = await User.findById(userId).lean();
  if (!user) return;
  const completed = await Exchange.countDocuments({ $or: [{ requester: userId }, { provider: userId }], status: 'completed' });
  const badges = new Set(user.badges || []);
  if (completed >= 1) badges.add('First Swap');
  if (completed >= 5) badges.add('Skilled Mentor');
  if (completed >= 10) badges.add('Master Mentor');
  if ((user.averageRating || 0) >= 4.0 && (user.reviewsCount || 0) >= 5) badges.add('Rising Star');
  if ((user.averageRating || 0) >= 4.5 && (user.reviewsCount || 0) >= 10) badges.add('Top Rated');
  await User.findByIdAndUpdate(userId, { $set: { badges: Array.from(badges) } });
}

exports.createReview = asyncHandler(async (req, res) => {
  const { exchangeId, rating, comment = '' } = req.body;
  const reviewerId = String(req.user._id);

  if (!exchangeId || !rating) {
    return res.status(400).json({ message: 'exchangeId and rating are required' });
  }

  if (!mongoose.Types.ObjectId.isValid(exchangeId)) {
    return res.status(400).json({ message: 'Invalid exchangeId' });
  }

  // Validate exchange exists and is completed
  const exchange = await Exchange.findById(exchangeId);
  if (!exchange) {
    return res.status(404).json({ message: 'Exchange not found' });
  }
  if (exchange.status !== 'completed') {
    return res.status(400).json({ message: 'You can only review completed exchanges' });
  }

  // Validate reviewer is a participant
  const isRequester = String(exchange.requester) === reviewerId;
  const isProvider = String(exchange.provider) === reviewerId;
  if (!isRequester && !isProvider) {
    return res.status(403).json({ message: 'You are not a participant of this exchange' });
  }

  // Determine reviewee (the other participant)
  const revieweeId = isRequester ? String(exchange.provider) : String(exchange.requester);

  // Prevent self-review
  if (reviewerId === revieweeId) {
    return res.status(400).json({ message: 'You cannot review yourself' });
  }

  // Prevent duplicate review for same exchange by same reviewer
  const existing = await Review.findOne({ reviewer: reviewerId, exchange: exchangeId });
  if (existing) {
    return res.status(409).json({ message: 'You have already reviewed this exchange' });
  }

  const review = await Review.create({
    reviewer: reviewerId,
    reviewee: revieweeId,
    exchange: exchangeId,
    rating: Number(rating),
    comment: typeof comment === 'string' ? comment.slice(0, 2000) : '',
  });

  await recomputeUserRating(revieweeId);
  await recomputeBadges(revieweeId);

  // Notify reviewee
  try {
    await Notification.create({
      user: revieweeId,
      type: 'review',
      title: 'New review',
      body: `${req.user.name} left you a ${rating}-star review!`,
      data: { reviewId: review._id, exchangeId },
    });
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${revieweeId}`).emit('notification:new', {
        type: 'review',
        title: 'New review',
      });
    }
  } catch (_) {}

  const populated = await Review.findById(review._id)
    .populate('reviewer', 'name avatarUrl')
    .populate('reviewee', 'name avatarUrl')
    .lean();

  res.status(201).json(populated);
});

exports.getUserReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const filter = { reviewee: req.params.userId };
  const [items, total] = await Promise.all([
    Review.find(filter)
      .populate('reviewer', 'name avatarUrl')
      .populate('exchange', 'status completedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Review.countDocuments(filter),
  ]);
  res.json({ items, total, page: Number(page), limit: Number(limit) });
});

exports.updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: 'Not found' });
  if (String(review.reviewer) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  if (req.body.rating !== undefined) review.rating = req.body.rating;
  if (req.body.comment !== undefined) review.comment = typeof req.body.comment === 'string' ? req.body.comment.slice(0, 2000) : review.comment;
  await review.save();
  await recomputeUserRating(review.reviewee);
  await recomputeBadges(review.reviewee);
  res.json(review);
});

exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: 'Not found' });
  if (String(review.reviewer) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const reviewee = review.reviewee;
  await review.deleteOne();
  await recomputeUserRating(reviewee);
  await recomputeBadges(reviewee);
  res.json({ message: 'Deleted' });
});
