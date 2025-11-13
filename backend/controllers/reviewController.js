const Review = require('../models/Review');
const User = require('../models/User');
const Exchange = require('../models/Exchange');
const { asyncHandler } = require('../utils/asyncHandler');

async function recomputeUserRating(userId) {
  const agg = await Review.aggregate([
    { $match: { reviewee: new (require('mongoose').Types.ObjectId)(userId) } },
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
  const { revieweeId, rating, comment = '', context = 'general', skillId } = req.body;
  if (!revieweeId || !rating) {
    return res.status(400).json({ message: 'revieweeId and rating are required' });
  }
  if (String(revieweeId) === String(req.user._id)) {
    return res.status(400).json({ message: 'You cannot review yourself' });
  }
  const review = await Review.create({
    reviewer: req.user._id,
    reviewee: revieweeId,
    rating,
    comment,
    context,
    skillId,
  });
  await recomputeUserRating(revieweeId);
  await recomputeBadges(revieweeId);
  res.status(201).json(review);
});

exports.getUserReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const filter = { reviewee: req.params.userId };
  const [items, total] = await Promise.all([
    Review.find(filter)
      .populate('reviewer', 'name avatarUrl')
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
  if (req.body.comment !== undefined) review.comment = req.body.comment;
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
