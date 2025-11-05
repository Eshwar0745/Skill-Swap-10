const router = require('express').Router();
const { auth } = require('../middleware/auth');
const {
  createReview,
  getUserReviews,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');

router.post('/', auth, createReview);
router.get('/user/:userId', getUserReviews);
router.put('/:id', auth, updateReview);
router.delete('/:id', auth, deleteReview);

module.exports = router;
