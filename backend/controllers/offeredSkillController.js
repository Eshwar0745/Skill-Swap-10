const OfferedSkill = require('../models/OfferedSkill');
const { asyncHandler } = require('../utils/asyncHandler');

exports.listOffered = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, q = '', userId, category } = req.query;
  const filter = {};
  if (q) filter.$text = { $search: q };
  if (userId) filter.user = userId;
  if (category) filter.categories = category;
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    OfferedSkill.find(filter)
      .populate('user', 'name avatarUrl averageRating reviewsCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    OfferedSkill.countDocuments(filter),
  ]);
  res.json({ items, total, page: Number(page), limit: Number(limit) });
});

exports.getOffered = asyncHandler(async (req, res) => {
  const item = await OfferedSkill.findById(req.params.id).populate(
    'user',
    'name avatarUrl averageRating reviewsCount'
  );
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
});

exports.createOffered = asyncHandler(async (req, res) => {
  const payload = { ...req.body, user: req.user._id };
  const created = await OfferedSkill.create(payload);
  res.status(201).json(created);
});

exports.updateOffered = asyncHandler(async (req, res) => {
  const item = await OfferedSkill.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  if (String(item.user) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  Object.assign(item, req.body);
  await item.save();
  res.json(item);
});

exports.deleteOffered = asyncHandler(async (req, res) => {
  const item = await OfferedSkill.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  if (String(item.user) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  await item.deleteOne();
  res.json({ message: 'Deleted' });
});
