const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { getReciprocalMatches } = require('../controllers/matchController');

/**
 * GET /api/matches/reciprocal
 * Get true reciprocal matches for the current user
 */
router.get('/reciprocal', auth, getReciprocalMatches);

module.exports = router;
