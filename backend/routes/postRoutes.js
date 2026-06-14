const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { param, query, body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { uploadPost } = require('../middleware/upload');
const { createPost, getUserPosts, deletePost } = require('../controllers/postController');

// Create a post with image upload
router.post(
  '/',
  auth,
  uploadPost.single('image'),
  [body('caption').optional().isString().trim().isLength({ max: 1000 })],
  validate,
  createPost
);

// Get posts for a user
router.get(
  '/user/:userId',
  [
    param('userId').isMongoId(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  validate,
  getUserPosts
);

// Delete a post
router.delete('/:id', auth, [param('id').isMongoId()], validate, deletePost);

module.exports = router;
