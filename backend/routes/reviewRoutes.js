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
		body('exchangeId').isMongoId().withMessage('Valid exchangeId required'),
		body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
		body('comment').optional().isString().trim().isLength({ max: 2000 }).withMessage('Comment max 2000 chars'),
	],
	validate,
	createReview
);

router.get(
	'/user/:userId',
	[
		param('userId').isMongoId(),
		query('page').optional().isInt({ min: 1 }).toInt(),
		query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
	],
	validate,
	getUserReviews
);

router.patch(
	'/:id',
	auth,
	[
		param('id').isMongoId(),
		body('rating').optional().isInt({ min: 1, max: 5 }),
		body('comment').optional().isString().trim().isLength({ max: 2000 }),
	],
	validate,
	updateReview
);

router.delete('/:id', auth, [param('id').isMongoId()], validate, deleteReview);

module.exports = router;
