const router = require('express').Router();
const {
  listOffered,
  getOffered,
  createOffered,
  updateOffered,
  deleteOffered,
} = require('../controllers/offeredSkillController');
const { auth } = require('../middleware/auth');

router.get('/', listOffered);
router.get('/:id', getOffered);
router.post('/', auth, createOffered);
router.put('/:id', auth, updateOffered);
router.delete('/:id', auth, deleteOffered);

module.exports = router;
