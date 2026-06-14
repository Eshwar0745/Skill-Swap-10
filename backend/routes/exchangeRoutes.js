const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const { validate } = require('../middleware/validate');
const {
	createExchange,
	listExchanges,
	getExchange,
	updateExchangeStatus,
} = require('../controllers/exchangeController');

router.post(
	'/',
	auth,
	[
		body('providerId').isMongoId().withMessage('Valid providerId required'),
		body('requesterSkillId').optional().isMongoId().withMessage('Valid requesterSkillId required'),
		body('providerSkillId').optional().isMongoId().withMessage('Valid providerSkillId required'),
		body('scheduledAt').optional().isISO8601().toDate().withMessage('Valid date required'),
		body('notes').optional().isString().trim().isLength({ max: 1000 }).withMessage('Notes max 1000 chars'),
	],
	validate,
	createExchange
);

router.get(
	'/',
	auth,
	[
		query('role').optional().isIn(['requester', 'provider', 'all']),
		query('status').optional().isIn(['proposed', 'accepted', 'declined', 'cancelled', 'completed']),
		query('page').optional().isInt({ min: 1 }).toInt(),
		query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
	],
	validate,
	listExchanges
);

router.get('/:id', auth, [param('id').isMongoId()], validate, getExchange);

router.patch(
	'/:id/status',
	auth,
	[
		param('id').isMongoId(),
		body('status').optional().isIn(['accepted', 'declined', 'cancelled', 'completed']),
		body('scheduledAt').optional().isISO8601().toDate(),
		body('notes').optional().isString().trim().isLength({ max: 1000 }),
	],
	validate,
	updateExchangeStatus
);

module.exports = router;
