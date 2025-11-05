const router = require('express').Router();
const { body, param, query } = require('express-validator');
const {
  listOffered,
  getOffered,
  createOffered,
  updateOffered,
  deleteOffered,
} = require('../controllers/offeredSkillController');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('q').optional().isString().trim(),
    query('userId').optional().isMongoId(),
    query('category').optional().isString().trim(),
  ],
  validate,
  listOffered
);
router.get('/:id', [param('id').isMongoId()], validate, getOffered);
router.post(
  '/',
  auth,
  [
    body('title').isString().trim().isLength({ min: 2 }),
    body('description').optional().isString().trim(),
    body('categories').optional().isArray(),
    body('rateType').optional().isIn(['hourly', 'swap', 'free']),
    body('rateValue').optional().isFloat({ min: 0 }),
    body('location').optional().isString().trim(),
    body('remote').optional().isBoolean(),
    body('tags').optional().isArray(),
  ],
  validate,
  createOffered
);
router.put(
  '/:id',
  auth,
  [
    param('id').isMongoId(),
    body('title').optional().isString().trim().isLength({ min: 2 }),
    body('description').optional().isString().trim(),
    body('categories').optional().isArray(),
    body('rateType').optional().isIn(['hourly', 'swap', 'free']),
    body('rateValue').optional().isFloat({ min: 0 }),
    body('location').optional().isString().trim(),
    body('remote').optional().isBoolean(),
    body('tags').optional().isArray(),
  ],
  validate,
  updateOffered
);
router.delete('/:id', auth, [param('id').isMongoId()], validate, deleteOffered);

module.exports = router;
