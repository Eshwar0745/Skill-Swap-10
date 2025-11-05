const router = require('express').Router();
const {
  listRequested,
  getRequested,
  createRequested,
  updateRequested,
  deleteRequested,
} = require('../controllers/requestedSkillController');
const { auth } = require('../middleware/auth');

router.get('/', listRequested);
router.get('/:id', getRequested);
router.post('/', auth, createRequested);
router.put('/:id', auth, updateRequested);
router.delete('/:id', auth, deleteRequested);

module.exports = router;
