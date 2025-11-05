const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const { validate } = require('../middleware/validate');
const {
  createReview,
  getUserReviews,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');

router.post(
  '/',
  auth,
  [
    body('revieweeId').isMongoId(),
    body('rating').isInt({ min: 1, max: 5 }).toInt(),
    body('comment').optional().isString().trim().isLength({ max: 2000 }),
    body('context').optional().isIn(['offered', 'requested', 'general']),
    body('skillId').optional().isMongoId(),
  ],
  validate,
  createReview
);
router.get(
  '/user/:userId',
  [param('userId').isMongoId(), query('page').optional().isInt({ min: 1 }).toInt(), query('limit').optional().isInt({ min: 1, max: 100 }).toInt()],
  validate,
  getUserReviews
);
router.put('/:id', auth, [param('id').isMongoId(), body('rating').optional().isInt({ min: 1, max: 5 }).toInt(), body('comment').optional().isString().trim().isLength({ max: 2000 })], validate, updateReview);
router.delete('/:id', auth, [param('id').isMongoId()], validate, deleteReview);

module.exports = router;
