const OfferedSkill = require('../models/OfferedSkill');
const { asyncHandler } = require('../utils/asyncHandler');
const { normalizeCategories } = require('../constants/categories');
const { normalizeSkillTitle, normalizeTags } = require('../utils/normalizeSkill');

exports.listOffered = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, q = '', userId, category } = req.query;
  const filter = {};
  if (q) filter.$text = { $search: q };
  if (userId) filter.user = userId;
  if (category) filter.categories = category;
  const skip = (Number(page) - 1) * Number(limit);
  const redis = req.app.get('redis');
  const verKey = 'offered:ver';
  const version = redis ? (await redis.get(verKey)) || '0' : '0';
  const cacheKey = redis
    ? `offered:list:v:${version}:q:${q}:u:${userId || ''}:c:${category || ''}:p:${page}:l:${limit}`
    : null;
  if (redis && cacheKey) {
    const cached = await redis.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));
  }
  const [items, total] = await Promise.all([
    OfferedSkill.find(filter, '-__v')
      .populate('user', 'name avatarUrl averageRating reviewsCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    OfferedSkill.countDocuments(filter),
  ]);
  const payload = { items, total, page: Number(page), limit: Number(limit) };
  if (redis && cacheKey) await redis.setex(cacheKey, 60, JSON.stringify(payload));
  res.json(payload);
});

exports.getOffered = asyncHandler(async (req, res) => {
  const item = await OfferedSkill.findById(req.params.id, '-__v').populate(
    'user',
    'name avatarUrl averageRating reviewsCount'
  ).lean();
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
});

exports.createOffered = asyncHandler(async (req, res) => {
  // Normalize inputs to prevent duplicates from different spellings/caps
  const normalized = { ...req.body };
  if (normalized.title) normalized.title = normalizeSkillTitle(normalized.title);
  if (normalized.categories) normalized.categories = normalizeCategories(normalized.categories);
  if (normalized.tags) normalized.tags = normalizeTags(normalized.tags);
  
  const payload = { ...normalized, user: req.user._id };
  const created = await OfferedSkill.create(payload);
  const redis = req.app.get('redis');
  if (redis) await redis.incr('offered:ver');
  res.status(201).json(created);
});

exports.updateOffered = asyncHandler(async (req, res) => {
  const item = await OfferedSkill.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  if (String(item.user) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  // Normalize inputs to prevent duplicates from different spellings/caps
  const normalized = { ...req.body };
  if (normalized.title) normalized.title = normalizeSkillTitle(normalized.title);
  if (normalized.categories) normalized.categories = normalizeCategories(normalized.categories);
  if (normalized.tags) normalized.tags = normalizeTags(normalized.tags);
  
  Object.assign(item, normalized);
  await item.save();
  const redis = req.app.get('redis');
  if (redis) await redis.incr('offered:ver');
  res.json(item);
});

exports.deleteOffered = asyncHandler(async (req, res) => {
  const item = await OfferedSkill.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  if (String(item.user) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  await item.deleteOne();
  const redis = req.app.get('redis');
  if (redis) await redis.incr('offered:ver');
  res.json({ message: 'Deleted' });
});
