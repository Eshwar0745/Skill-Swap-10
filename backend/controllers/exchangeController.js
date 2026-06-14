const Exchange = require('../models/Exchange');
const Notification = require('../models/Notification');
const OfferedSkill = require('../models/OfferedSkill');
const RequestedSkill = require('../models/RequestedSkill');
const { asyncHandler } = require('../utils/asyncHandler');
const User = require('../models/User');
const mongoose = require('mongoose');

async function computeBadgesForUser(userId) {
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
  const { providerId, requesterSkillId, providerSkillId, scheduledAt, notes } = req.body;
  const requesterId = String(req.user._id);

  if (!providerId) {
    return res.status(400).json({ message: 'providerId is required' });
  }

  // Prevent self-swap
  if (requesterId === String(providerId)) {
    return res.status(400).json({ message: 'You cannot request a swap with yourself' });
  }

  // Validate providerId is a real user
  if (!mongoose.Types.ObjectId.isValid(providerId)) {
    return res.status(400).json({ message: 'Invalid providerId' });
  }
  const providerUser = await User.findById(providerId);
  if (!providerUser) {
    return res.status(404).json({ message: 'Provider user not found' });
  }

  // Prevent duplicate active swap requests between same two users
  const existingExchange = await Exchange.findOne({
    $or: [
      { requester: requesterId, provider: providerId },
      { requester: providerId, provider: requesterId },
    ],
    status: { $in: ['proposed', 'accepted'] },
  });
  if (existingExchange) {
    return res.status(409).json({ message: 'An active swap request already exists between you and this user' });
  }

  // Validate skills belong to correct users
  if (requesterSkillId) {
    const skill = await OfferedSkill.findById(requesterSkillId);
    if (!skill || String(skill.user) !== requesterId) {
      return res.status(400).json({ message: 'requesterSkillId does not belong to you' });
    }
  }
  if (providerSkillId) {
    const skill = await OfferedSkill.findById(providerSkillId);
    if (!skill || String(skill.user) !== String(providerId)) {
      return res.status(400).json({ message: 'providerSkillId does not belong to the provider' });
    }
  }

  const payload = {
    requester: requesterId,
    provider: providerId,
    requesterSkill: requesterSkillId || undefined,
    providerSkill: providerSkillId || undefined,
    scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
    notes: typeof notes === 'string' ? notes.slice(0, 1000) : '',
  };

  const ex = await Exchange.create(payload);
  const populated = await Exchange.findById(ex._id)
    .populate('requester', 'name avatarUrl')
    .populate('provider', 'name avatarUrl')
    .populate('requesterSkill', 'title')
    .populate('providerSkill', 'title')
    .lean();

  // Notify provider of new swap request
  try {
    await Notification.create({
      user: providerId,
      type: 'swap_request',
      title: 'New swap request',
      body: `${req.user.name} wants to swap skills with you!`,
      data: { exchangeId: ex._id, requesterId },
    });
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${String(providerId)}`).emit('notification:new', {
        type: 'swap_request',
        title: 'New swap request',
      });
    }
  } catch (_) {}

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
      .populate('requester', 'name avatarUrl location')
      .populate('provider', 'name avatarUrl location')
      .populate('requesterSkill', 'title')
      .populate('providerSkill', 'title')
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
    .populate('requester', 'name avatarUrl location')
    .populate('provider', 'name avatarUrl location')
    .populate('requesterSkill', 'title')
    .populate('providerSkill', 'title')
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
  const isRequester = String(ex.requester) === me;
  const isProvider = String(ex.provider) === me;
  if (!isRequester && !isProvider) return res.status(403).json({ message: 'Forbidden' });

  // Role-based status transitions
  if (status) {
    if (status === 'accepted' && !isProvider) {
      return res.status(403).json({ message: 'Only the provider can accept a swap request' });
    }
    if (status === 'declined' && !isProvider) {
      return res.status(403).json({ message: 'Only the provider can decline a swap request' });
    }
    if (status === 'cancelled') {
      if (ex.status !== 'proposed' && ex.status !== 'accepted') {
        return res.status(400).json({ message: 'Can only cancel proposed or accepted exchanges' });
      }
    }
    if (status === 'completed') {
      if (ex.status !== 'accepted') {
        return res.status(400).json({ message: 'Can only complete accepted exchanges' });
      }
    }
    if (status === 'accepted' && ex.status !== 'proposed') {
      return res.status(400).json({ message: 'Can only accept proposed exchanges' });
    }
    if (status === 'declined' && ex.status !== 'proposed') {
      return res.status(400).json({ message: 'Can only decline proposed exchanges' });
    }

    ex.status = status;
    if (status === 'completed') ex.completedAt = new Date();
  }
  if (scheduledAt !== undefined) ex.scheduledAt = scheduledAt ? new Date(scheduledAt) : undefined;
  if (notes !== undefined) ex.notes = typeof notes === 'string' ? notes.slice(0, 1000) : ex.notes;
  await ex.save();

  const populated = await Exchange.findById(ex._id)
    .populate('requester', 'name avatarUrl location')
    .populate('provider', 'name avatarUrl location')
    .populate('requesterSkill', 'title')
    .populate('providerSkill', 'title')
    .populate('offeredSkill', 'title')
    .populate('requestedSkill', 'title')
    .lean();
  res.json(populated);

  // Notify the other participant of status change
  try {
    const other = isRequester ? ex.provider : ex.requester;
    const statusLabels = {
      accepted: 'accepted your swap request!',
      declined: 'declined your swap request.',
      cancelled: 'cancelled the exchange.',
      completed: 'marked the exchange as completed!',
    };
    if (status && statusLabels[status]) {
      await Notification.create({
        user: other,
        type: 'exchange',
        title: 'Exchange updated',
        body: `${req.user.name} ${statusLabels[status]}`,
        data: { exchangeId: ex._id },
      });
      const io = req.app.get('io');
      if (io) {
        io.to(`user:${String(other)}`).emit('notification:new', {
          type: 'exchange',
          title: 'Exchange updated',
        });
      }
    }
  } catch (_) {}

  // Re-compute badges when completed
  try {
    if (ex.status === 'completed') {
      await Promise.all([computeBadgesForUser(ex.requester), computeBadgesForUser(ex.provider)]);
    }
  } catch (_) {}
});
