// =====================================================================
// Multer + Cloudinary configuration
// =====================================================================
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'complaint-system',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'],
  },
});

function fileFilter(req, file, cb) {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WEBP, HEIC) are allowed.'));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;