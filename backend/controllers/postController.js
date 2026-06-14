const Post = require('../models/Post');
const { asyncHandler } = require('../utils/asyncHandler');

exports.createPost = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Image file is required' });
  }

  const caption = typeof req.body.caption === 'string' ? req.body.caption.slice(0, 1000) : '';
  const imageUrl = `/uploads/posts/${req.file.filename}`;

  const post = await Post.create({
    user: req.user._id,
    imageUrl,
    caption,
  });

  res.status(201).json(post);
});

exports.getUserPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Post.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Post.countDocuments({ user: req.params.userId }),
  ]);
  res.json({ items, total, page: Number(page), limit: Number(limit) });
});

exports.deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Not found' });
  if (String(post.user) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  await post.deleteOne();
  res.json({ message: 'Deleted' });
});
