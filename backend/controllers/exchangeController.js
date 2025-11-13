const Exchange = require('../models/Exchange');
const Notification = require('../models/Notification');
const { asyncHandler } = require('../utils/asyncHandler');
const User = require('../models/User');
const { sendMail } = require('../services/mailer');

async function computeBadgesForUser(userId) {
  // Count completed exchanges
  const completedAsRequester = await Exchange.countDocuments({ requester: userId, status: 'completed' });
  const completedAsProvider = await Exchange.countDocuments({ provider: userId, status: 'completed' });
  const totalCompleted = completedAsRequester + completedAsProvider;
  const user = await User.findById(userId).lean();
  const badges = new Set(user?.badges || []);
  if (totalCompleted >= 1) badges.add('First Swap');
  if (totalCompleted >= 5) badges.add('Skilled Mentor');
  if (totalCompleted >= 10) badges.add('Master Mentor');
  if ((user?.averageRating || 0) >= 4.0 && (user?.reviewsCount || 0) >= 5) badges.add('Rising Star');
  if ((user?.averageRating || 0) >= 4.5 && (user?.reviewsCount || 0) >= 10) badges.add('Top Rated');
  await User.findByIdAndUpdate(userId, { $set: { badges: Array.from(badges) } });
}

exports.createExchange = asyncHandler(async (req, res) => {
  const { providerId, offeredSkillId, requestedSkillId, scheduledAt, notes } = req.body;
  if (!providerId && !offeredSkillId && !requestedSkillId) {
    return res.status(400).json({ message: 'At least one of providerId/offeredSkillId/requestedSkillId is required' });
  }
  const payload = {
    requester: req.user._id,
    provider: providerId || undefined,
    offeredSkill: offeredSkillId || undefined,
    requestedSkill: requestedSkillId || undefined,
    scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
    notes,
  };
  const ex = await Exchange.create(payload);
  const populated = await Exchange.findById(ex._id)
    .populate('requester', 'name avatarUrl')
    .populate('provider', 'name avatarUrl')
    .populate('offeredSkill', 'title')
    .populate('requestedSkill', 'title')
    .lean();
  res.status(201).json(populated);
});

exports.listExchanges = asyncHandler(async (req, res) => {
  const { role = 'all', status, page = 1, limit = 20 } = req.query;
  const me = String(req.user._id);
  const filter = {};
  if (role === 'requester') filter.requester = me;
  else if (role === 'provider') filter.provider = me;
  else filter.$or = [{ requester: me }, { provider: me }];
  if (status) filter.status = status;
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Exchange.find(filter, '-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('requester', 'name avatarUrl')
      .populate('provider', 'name avatarUrl')
      .populate('offeredSkill', 'title')
      .populate('requestedSkill', 'title')
      .lean(),
    Exchange.countDocuments(filter),
  ]);
  res.json({ items, total, page: Number(page), limit: Number(limit) });
});

exports.getExchange = asyncHandler(async (req, res) => {
  const me = String(req.user._id);
  const ex = await Exchange.findById(req.params.id, '-__v')
    .populate('requester', 'name avatarUrl')
    .populate('provider', 'name avatarUrl')
    .populate('offeredSkill', 'title')
    .populate('requestedSkill', 'title')
    .lean();
  if (!ex) return res.status(404).json({ message: 'Not found' });
  if (String(ex.requester?._id || ex.requester) !== me && String(ex.provider?._id || ex.provider) !== me) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  res.json(ex);
});

exports.updateExchangeStatus = asyncHandler(async (req, res) => {
  const { status, scheduledAt, notes } = req.body;
  const ex = await Exchange.findById(req.params.id);
  if (!ex) return res.status(404).json({ message: 'Not found' });
  const me = String(req.user._id);
  const isParticipant = [String(ex.requester), String(ex.provider)].includes(me);
  if (!isParticipant) return res.status(403).json({ message: 'Forbidden' });
  if (status) {
    ex.status = status;
    if (status === 'completed') ex.completedAt = new Date();
  }
  if (scheduledAt !== undefined) ex.scheduledAt = scheduledAt ? new Date(scheduledAt) : undefined;
  if (notes !== undefined) ex.notes = notes;
  await ex.save();
  const populated = await Exchange.findById(ex._id)
    .populate('requester', 'name avatarUrl')
    .populate('provider', 'name avatarUrl')
    .populate('offeredSkill', 'title')
    .populate('requestedSkill', 'title')
    .lean();
  res.json(populated);
  // Notify the other participant of status change or schedule update
  try {
    const other = String(ex.requester) === String(me) ? ex.provider : ex.requester;
    await Notification.create({
      user: other,
      type: 'exchange',
      title: 'Exchange updated',
      body: `Status: ${ex.status}`,
      data: { exchangeId: ex._id },
    });
    // Email notification (if configured)
    try {
      await sendMail(String(other.email || ''), 'Exchange updated', `<p>Your exchange status is now <b>${ex.status}</b>.</p>`);
    } catch (_) {}
  } catch (_) {}

  // Re-compute badges when completed
  try {
    if (ex.status === 'completed') {
      await Promise.all([computeBadgesForUser(ex.requester), computeBadgesForUser(ex.provider)]);
    }
  } catch (_) {}
});
