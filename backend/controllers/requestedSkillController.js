const RequestedSkill = require('../models/RequestedSkill');
const { asyncHandler } = require('../utils/asyncHandler');
const { normalizeCategories } = require('../constants/categories');
const { normalizeSkillTitle, normalizeTags } = require('../utils/normalizeSkill');

exports.listRequested = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, q = '', userId, category } = req.query;
  const filter = {};
  if (q) filter.$text = { $search: q };
  if (userId) filter.user = userId;
  if (category) filter.categories = category;
  const skip = (Number(page) - 1) * Number(limit);
  const redis = req.app.get('redis');
  const verKey = 'requested:ver';
  const version = redis ? (await redis.get(verKey)) || '0' : '0';
  const cacheKey = redis
    ? `requested:list:v:${version}:q:${q}:u:${userId || ''}:c:${category || ''}:p:${page}:l:${limit}`
    : null;
  if (redis && cacheKey) {
    const cached = await redis.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));
  }
  const [items, total] = await Promise.all([
    RequestedSkill.find(filter, '-__v')
      .populate('user', 'name avatarUrl averageRating reviewsCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    RequestedSkill.countDocuments(filter),
  ]);
  const payload = { items, total, page: Number(page), limit: Number(limit) };
  if (redis && cacheKey) await redis.setex(cacheKey, 60, JSON.stringify(payload));
  res.json(payload);
});

exports.getRequested = asyncHandler(async (req, res) => {
  const item = await RequestedSkill.findById(req.params.id, '-__v').populate(
    'user',
    'name avatarUrl averageRating reviewsCount'
  ).lean();
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
});

exports.createRequested = asyncHandler(async (req, res) => {
  // Normalize inputs to prevent duplicates from different spellings/caps
  const normalized = { ...req.body };
  if (normalized.title) normalized.title = normalizeSkillTitle(normalized.title);
  if (normalized.categories) normalized.categories = normalizeCategories(normalized.categories);
  if (normalized.tags) normalized.tags = normalizeTags(normalized.tags);
  
  const payload = { ...normalized, user: req.user._id };
  const created = await RequestedSkill.create(payload);
  const redis = req.app.get('redis');
  if (redis) await redis.incr('requested:ver');
  res.status(201).json(created);
});

exports.updateRequested = asyncHandler(async (req, res) => {
  const item = await RequestedSkill.findById(req.params.id);
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
  if (redis) await redis.incr('requested:ver');
  res.json(item);
});

exports.deleteRequested = asyncHandler(async (req, res) => {
  const item = await RequestedSkill.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  if (String(item.user) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  await item.deleteOne();
  const redis = req.app.get('redis');
  if (redis) await redis.incr('requested:ver');
  res.json({ message: 'Deleted' });
});
