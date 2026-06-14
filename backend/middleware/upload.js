const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadsRoot = path.join(__dirname, '..', 'uploads');
const avatarDir = path.join(uploadsRoot, 'avatars');
const postDir = path.join(uploadsRoot, 'posts');

// Ensure directories exist at startup
for (const dir of [uploadsRoot, avatarDir, postDir]) {
  try { fs.mkdirSync(dir, { recursive: true }); } catch (_) {}
}

// --- Avatar Upload ---
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${req.user?._id || 'user'}-${Date.now()}${ext}`;
    cb(null, safeName);
  }
});

function imageFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed'));
  }
  cb(null, true);
}

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// --- Post Image Upload ---
const postStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, postDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${req.user?._id || 'user'}-${Date.now()}${ext}`;
    cb(null, safeName);
  }
});

const uploadPost = multer({
  storage: postStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB for posts
});

module.exports = { uploadAvatar, uploadPost };
