const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { query } = require('express-validator');
const { validate } = require('../middleware/validate');
const {
  findMatchesForRequestedSkill,
  getMyMatches
} = require('../controllers/matchController');

/**
 * GET /api/matches/find
 * Find users who offer a specific skill
 * Query params: skillTitle, category
 */
router.get(
  '/find',
  auth,
  [
    query('skillTitle').optional().isString().trim(),
    query('category').optional().isString().trim()
  ],
  validate,
  findMatchesForRequestedSkill
);

/**
 * GET /api/matches/my-matches
 * Get all potential matches for current user's wanted skills
 */
router.get('/my-matches', auth, getMyMatches);

module.exports = router;
