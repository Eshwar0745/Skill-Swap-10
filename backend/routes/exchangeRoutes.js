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
    body('providerId').optional().isMongoId(),
    body('offeredSkillId').optional().isMongoId(),
    body('requestedSkillId').optional().isMongoId(),
    body('scheduledAt').optional().isISO8601().toDate(),
    body('notes').optional().isString().trim().isLength({ max: 1000 }),
  ],
  validate,
  createExchange
);

router.get(
  '/',
  auth,
  [
    query('role').optional().isIn(['all', 'requester', 'provider']),
    query('status').optional().isIn(['proposed', 'accepted', 'declined', 'cancelled', 'completed']),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  validate,
  listExchanges
);

router.get('/:id', auth, [param('id').isMongoId()], validate, getExchange);

router.put(
  '/:id',
  auth,
  [
    param('id').isMongoId(),
    body('status').optional().isIn(['proposed', 'accepted', 'declined', 'cancelled', 'completed']),
    body('scheduledAt').optional().isISO8601().toDate(),
    body('notes').optional().isString().trim().isLength({ max: 1000 }),
  ],
  validate,
  updateExchangeStatus
);

module.exports = router;
