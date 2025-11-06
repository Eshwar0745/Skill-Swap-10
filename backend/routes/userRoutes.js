const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validate');
const {
  getUserProfile,
  updateUserProfile,
  getMe,
} = require('../controllers/userController');

// Get current user profile
router.get('/me', auth, getMe);

// Get user profile by ID
router.get('/:id', [param('id').isMongoId()], validate, getUserProfile);

// Update user profile
router.put(
  '/:id',
  auth,
  [
    param('id').isMongoId(),
    body('name').optional().isString().trim().isLength({ min: 2, max: 100 }),
    body('bio').optional().isString().trim().isLength({ max: 500 }),
    body('location').optional().isString().trim().isLength({ max: 100 }),
    body('avatarUrl').optional().isURL(),
  ],
  validate,
  updateUserProfile
);

module.exports = router;
