const OfferedSkill = require('../models/OfferedSkill');
const RequestedSkill = require('../models/RequestedSkill');
const User = require('../models/User');
const Exchange = require('../models/Exchange');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * Normalize a skill title for comparison: trim, lowercase, collapse spaces
 */
function norm(title) {
  if (!title || typeof title !== 'string') return '';
  return title.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * GET /api/matches/reciprocal
 *
 * True reciprocal matching:
 *  - User A wants at least one skill that User B offers
 *  - User B wants at least one skill that User A offers
 *
 * Returns only mutual matches. No one-sided. No counters. No scores.
 */
exports.getReciprocalMatches = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 1. Fetch my skills
  const [myOffered, myRequested] = await Promise.all([
    OfferedSkill.find({ user: userId }).lean(),
    RequestedSkill.find({ user: userId }).lean(),
  ]);

  if (myOffered.length === 0 || myRequested.length === 0) {
    return res.json({
      matches: [],
      message: myOffered.length === 0
        ? 'Add skills you can teach to find matches'
        : 'Add skills you want to learn to find matches',
    });
  }

  const myOfferedNorm = myOffered.map((s) => norm(s.title));
  const myRequestedNorm = myRequested.map((s) => norm(s.title));

  // 2. Find users who OFFER skills I WANT (candidates who can teach me)
  //    Use case-insensitive exact match via normalized titles
  const candidateOffered = await OfferedSkill.find({
    user: { $ne: userId },
  }).lean();

  // Map: userId -> list of offered skill titles that match my requested
  const canTeachMeMap = new Map(); // userId -> [{ title, _id }]
  for (const skill of candidateOffered) {
    const skillNorm = norm(skill.title);
    if (myRequestedNorm.includes(skillNorm)) {
      const uid = String(skill.user);
      if (!canTeachMeMap.has(uid)) canTeachMeMap.set(uid, []);
      canTeachMeMap.get(uid).push({ title: skill.title, _id: skill._id });
    }
  }

  // 3. Find users who WANT skills I OFFER (candidates I can teach)
  const candidateRequested = await RequestedSkill.find({
    user: { $ne: userId },
  }).lean();

  const iCanTeachMap = new Map(); // userId -> [{ title, _id }]
  for (const skill of candidateRequested) {
    const skillNorm = norm(skill.title);
    if (myOfferedNorm.includes(skillNorm)) {
      const uid = String(skill.user);
      if (!iCanTeachMap.has(uid)) iCanTeachMap.set(uid, []);
      iCanTeachMap.get(uid).push({ title: skill.title, _id: skill._id });
    }
  }

  // 4. Intersect: only users in BOTH maps are reciprocal matches
  const reciprocalUserIds = [];
  for (const uid of canTeachMeMap.keys()) {
    if (iCanTeachMap.has(uid)) {
      reciprocalUserIds.push(uid);
    }
  }

  if (reciprocalUserIds.length === 0) {
    return res.json({ matches: [] });
  }

  // 5. Fetch user details for all reciprocal matches
  const users = await User.find({ _id: { $in: reciprocalUserIds } })
    .select('name avatarUrl location averageRating reviewsCount followersCount')
    .lean();

  const userMap = new Map();
  for (const u of users) userMap.set(String(u._id), u);

  // 6. Check active exchanges between me and each match
  const activeExchanges = await Exchange.find({
    $or: reciprocalUserIds.flatMap((uid) => [
      { requester: userId, provider: uid, status: { $in: ['proposed', 'accepted'] } },
      { requester: uid, provider: userId, status: { $in: ['proposed', 'accepted'] } },
    ]),
  }).lean();

  const exchangeMap = new Map(); // other userId -> exchange
  for (const ex of activeExchanges) {
    const other = String(ex.requester) === String(userId) ? String(ex.provider) : String(ex.requester);
    if (!exchangeMap.has(other)) exchangeMap.set(other, ex);
  }

  // 7. Build match cards
  const matches = reciprocalUserIds
    .map((uid) => {
      const u = userMap.get(uid);
      if (!u) return null;
      const activeEx = exchangeMap.get(uid);
      return {
        user: {
          _id: u._id,
          name: u.name,
          avatarUrl: u.avatarUrl,
          location: u.location,
          averageRating: u.averageRating || 0,
          reviewsCount: u.reviewsCount || 0,
          followersCount: u.followersCount || 0,
        },
        skillsTheyCanTeachMe: canTeachMeMap.get(uid).map((s) => s.title),
        skillsICanTeachThem: iCanTeachMap.get(uid).map((s) => s.title),
        hasActiveExchange: !!activeEx,
        exchangeStatus: activeEx?.status || null,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (b.user.averageRating || 0) - (a.user.averageRating || 0));

  res.json({ matches });
});

module.exports = exports;
