const multer = require('multer');
const { AppError } = require('../middleware/errorHandler');
const { logSuccess, logError } = require('../utils/logger');
const {
  getDatabaseStatus,
  addPersonToDatabase,
  rebuildDatabase,
  checkAIHealth
} = require('../services/faceDatabase.service');

// Multer config for image upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

/**
 * Get face database status
 */
const getStatus = async (req, res) => {
  try {
    const status = await getDatabaseStatus();
    logSuccess('Database status retrieved', { people: status.people });
    res.json({ success: true, data: status });
  } catch (error) {
    logError('Failed to get database status', error);
    throw new AppError(error.message, 500);
  }
};

/**
 * Add person to face database
 */
const addPerson = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      throw new AppError('userId is required', 400);
    }

    if (!req.file) {
      throw new AppError('Image file is required', 400);
    }

    const result = await addPersonToDatabase(
      userId,
      req.file.buffer,
      req.file.originalname
    );

    logSuccess('Person added to face database', { userId });
    res.json({ success: true, data: result });
  } catch (error) {
    logError('Failed to add person to database', error);
    throw new AppError(error.message, 500);
  }
};

/**
 * Rebuild face recognition database
 */
const rebuild = async (req, res) => {
  // Demo/test friendly: rebuild can be slow (model rebuild + DB rebuild). Queue it and respond immediately.
  try {
    logSuccess('Rebuild requested (queued)...');

    // Fire-and-forget async rebuild
    (async () => {
      try {
        const result = await rebuildDatabase();
        logSuccess('Face database rebuilt', { ready: result.ready });
      } catch (error) {
        logError('Failed to rebuild database (async)', error);
      }
    })();

    res.json({ success: true, data: { queued: true } });
  } catch (error) {
    logError('Failed to rebuild database', error);
    throw new AppError(error.message, 500);
  }
};

/**
 * Check AI worker health status
 */
const healthCheck = async (req, res) => {
  try {
    const health = await checkAIHealth();
    res.json({ success: true, data: health });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

module.exports = {
  getStatus,
  addPerson,
  rebuild,
  healthCheck,
  upload: upload.single('image')
};
