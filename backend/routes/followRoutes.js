const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { param, query } = require('express-validator');
const { validate } = require('../middleware/validate');
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowing,
} = require('../controllers/followController');

// Follow a user
router.post('/:id/follow', auth, [param('id').isMongoId()], validate, followUser);

// Unfollow a user
router.delete('/:id/follow', auth, [param('id').isMongoId()], validate, unfollowUser);

// Check if current user follows a user
router.get('/:id/is-following', auth, [param('id').isMongoId()], validate, checkFollowing);

// Get followers of a user
router.get(
  '/:id/followers',
  [
    param('id').isMongoId(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  validate,
  getFollowers
);

// Get following of a user
router.get(
  '/:id/following',
  [
    param('id').isMongoId(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  validate,
  getFollowing
);

module.exports = router;
