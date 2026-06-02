const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');
const { validateRequest } = require('../middleware/validation.middleware');
const { createUserSchema, updateUserSchema } = require('../utils/schemas');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const {
  getUsers,
  getUser,
  createNewUser,
  updateExistingUser,
  deleteExistingUser,
  deleteOwnAccount,
  addFaceImages,
  deleteFaceImages
} = require('../controllers/user.controller');

// Protect all routes - authenticate first
router.use(authenticateToken);

// User's own account deletion (any authenticated user)
router.delete('/me', asyncHandler(deleteOwnAccount));

// Admin-only routes
router.use(authorizeRoles('admin'));

// Routes with validation and async error handling
router.get('/', asyncHandler(getUsers));
router.post('/', validateRequest(createUserSchema), asyncHandler(createNewUser));

router.get('/:id', asyncHandler(getUser));
router.put('/:id', validateRequest(updateUserSchema), asyncHandler(updateExistingUser));
router.delete('/:id', asyncHandler(deleteExistingUser));

// Safe upload wrapper
const uploadHandler = (fieldName, maxCount) => (req, res, next) => {
  const uploader = upload.array(fieldName, maxCount);
  uploader(req, res, (err) => {
    if (err) {
      const code = err.code || 'UPLOAD_ERROR';
      if (code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'One or more files exceed 10MB limit' });
      }
      if (code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: 'Too many files uploaded' });
      }
      return res.status(400).json({ error: err.message || 'File upload error' });
    }
    next();
  });
};

const validateFaceUpload = (req, res, next) => {
  const files = req.files || [];
  if (!files.length && !req.body.image) {
    return res.status(400).json({ error: 'No image provided. Use multipart images[] or image (base64).' });
  }

  for (let f of files) {
    if (!f.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'All uploaded files must be images (jpeg/png/etc.)' });
    }
  }

  if (files.length > 5) return res.status(400).json({ error: 'Maximum 5 images allowed' });

  next();
};

router.post('/:id/face-images', uploadHandler('images', 5), validateFaceUpload, addFaceImages);
router.delete('/:id/face-images', deleteFaceImages);


module.exports = router;