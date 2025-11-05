const router = require('express').Router();
const { body, param, query } = require('express-validator');
const {
  listRequested,
  getRequested,
  createRequested,
  updateRequested,
  deleteRequested,
} = require('../controllers/requestedSkillController');
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
  listRequested
);
router.get('/:id', [param('id').isMongoId()], validate, getRequested);
router.post(
  '/',
  auth,
  [
    body('title').isString().trim().isLength({ min: 2 }),
    body('description').optional().isString().trim(),
    body('categories').optional().isArray(),
    body('urgency').optional().isIn(['low', 'medium', 'high']),
    body('location').optional().isString().trim(),
    body('remote').optional().isBoolean(),
    body('tags').optional().isArray(),
  ],
  validate,
  createRequested
);
router.put(
  '/:id',
  auth,
  [
    param('id').isMongoId(),
    body('title').optional().isString().trim().isLength({ min: 2 }),
    body('description').optional().isString().trim(),
    body('categories').optional().isArray(),
    body('urgency').optional().isIn(['low', 'medium', 'high']),
    body('location').optional().isString().trim(),
    body('remote').optional().isBoolean(),
    body('tags').optional().isArray(),
  ],
  validate,
  updateRequested
);
router.delete('/:id', auth, [param('id').isMongoId()], validate, deleteRequested);

module.exports = router;
