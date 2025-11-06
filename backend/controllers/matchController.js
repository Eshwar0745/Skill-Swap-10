const OfferedSkill = require('../models/OfferedSkill');
const RequestedSkill = require('../models/RequestedSkill');
const User = require('../models/User');
const Exchange = require('../models/Exchange');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * Find users who offer a specific skill
 * Also checks if requesting user has skills that match what providers want (mutual match)
 */
exports.findMatchesForRequestedSkill = asyncHandler(async (req, res) => {
  const { skillTitle, category } = req.query;
  const requesterId = req.user._id;

  if (!skillTitle && !category) {
    return res.status(400).json({ message: 'skillTitle or category is required' });
  }

  // Build filter for offered skills
  const filter = {};
  if (skillTitle) {
    filter.$or = [
      { title: new RegExp(skillTitle, 'i') },
      { $text: { $search: skillTitle } }
    ];
  }
  if (category) {
    filter.categories = category;
  }

  // Find users who offer this skill (exclude self)
  const offeredSkills = await OfferedSkill.find(filter)
    .populate('user', 'name email avatarUrl location averageRating reviewsCount')
    .lean();

  // Get requester's offered skills to check for mutual matches
  const myOfferedSkills = await OfferedSkill.find({ user: requesterId }).lean();
  const myOfferedTitles = myOfferedSkills.map(s => s.title.toLowerCase());

  // For each provider, check if they want something I offer (mutual match)
  const matches = [];
  for (const offeredSkill of offeredSkills) {
    const providerId = offeredSkill.user._id;
    
    // Skip if it's me
    if (String(providerId) === String(requesterId)) continue;

    // Check if provider wants any skill I offer
    const providerWants = await RequestedSkill.find({ user: providerId }).lean();
    const mutualMatches = providerWants.filter(wanted => 
      myOfferedTitles.some(mySkill => 
        wanted.title.toLowerCase().includes(mySkill) || 
        mySkill.includes(wanted.title.toLowerCase())
      )
    );

    // Check if we already have an exchange (pending or accepted)
    const existingExchange = await Exchange.findOne({
      $or: [
        { requester: requesterId, provider: providerId },
        { requester: providerId, provider: requesterId }
      ],
      status: { $in: ['proposed', 'accepted'] }
    });

    matches.push({
      skill: {
        _id: offeredSkill._id,
        title: offeredSkill.title,
        description: offeredSkill.description,
        categories: offeredSkill.categories,
        availability: offeredSkill.availability,
        location: offeredSkill.location,
        remote: offeredSkill.remote
      },
      provider: offeredSkill.user,
      isMutualMatch: mutualMatches.length > 0,
      mutualSkills: mutualMatches.map(m => m.title),
      hasActiveExchange: !!existingExchange,
      exchangeStatus: existingExchange?.status
    });
  }

  // Sort by: mutual matches first, then by rating
  matches.sort((a, b) => {
    if (a.isMutualMatch && !b.isMutualMatch) return -1;
    if (!a.isMutualMatch && b.isMutualMatch) return 1;
    return (b.provider.averageRating || 0) - (a.provider.averageRating || 0);
  });

  res.json({
    query: { skillTitle, category },
    totalMatches: matches.length,
    mutualMatches: matches.filter(m => m.isMutualMatch).length,
    matches
  });
});

/**
 * Get all potential matches for the current user
 * Shows what they want and who offers it
 */
exports.getMyMatches = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get all skills I want to learn
  const myRequestedSkills = await RequestedSkill.find({ user: userId }).lean();

  if (myRequestedSkills.length === 0) {
    return res.json({
      message: 'Add skills you want to learn to find matches',
      matches: []
    });
  }

  // Get all skills I offer (for mutual match detection)
  const myOfferedSkills = await OfferedSkill.find({ user: userId }).lean();
  const myOfferedTitles = myOfferedSkills.map(s => s.title.toLowerCase());

  const allMatches = [];

  for (const requestedSkill of myRequestedSkills) {
    // Find users who offer this skill
    const providers = await OfferedSkill.find({
      $or: [
        { title: new RegExp(requestedSkill.title, 'i') },
        { categories: { $in: requestedSkill.categories } }
      ],
      user: { $ne: userId }
    })
    .populate('user', 'name email avatarUrl location averageRating reviewsCount')
    .limit(10)
    .lean();

    for (const provider of providers) {
      const providerId = provider.user._id;

      // Check mutual match
      const providerWants = await RequestedSkill.find({ user: providerId }).lean();
      const mutualMatches = providerWants.filter(wanted => 
        myOfferedTitles.some(mySkill => 
          wanted.title.toLowerCase().includes(mySkill) || 
          mySkill.includes(wanted.title.toLowerCase())
        )
      );

      // Check existing exchange
      const existingExchange = await Exchange.findOne({
        $or: [
          { requester: userId, provider: providerId },
          { requester: providerId, provider: userId }
        ],
        status: { $in: ['proposed', 'accepted'] }
      });

      allMatches.push({
        requestedSkill: {
          _id: requestedSkill._id,
          title: requestedSkill.title,
          categories: requestedSkill.categories
        },
        offeredSkill: {
          _id: provider._id,
          title: provider.title,
          description: provider.description,
          location: provider.location
        },
        provider: provider.user,
        isMutualMatch: mutualMatches.length > 0,
        mutualSkills: mutualMatches.map(m => m.title),
        hasActiveExchange: !!existingExchange,
        exchangeStatus: existingExchange?.status
      });
    }
  }

  // Sort by mutual matches first
  allMatches.sort((a, b) => {
    if (a.isMutualMatch && !b.isMutualMatch) return -1;
    if (!a.isMutualMatch && b.isMutualMatch) return 1;
    return (b.provider.averageRating || 0) - (a.provider.averageRating || 0);
  });

  res.json({
    totalMatches: allMatches.length,
    mutualMatches: allMatches.filter(m => m.isMutualMatch).length,
    matches: allMatches
  });
});

module.exports = exports;
