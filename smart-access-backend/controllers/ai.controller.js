const multer = require('multer');
const path = require('path');
const { handleAccessEvent, smartDecision } = require('../services/accessEvent.service');
const { AppError } = require('../middleware/errorHandler');
const { logSuccess, logError } = require('../utils/logger');

// Multer config for image upload (5MB limit)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'), false);
    }
  }
});

/**
 * Single image upload handler
 * Handles multipart/form or base64 JSON
 */
const handleImage = (req, imageField = 'image') => {
  return new Promise((resolve, reject) => {
    upload.single(imageField)(req, null, (err) => {
      if (err) return reject(err);
      
      let image;
      if (req.file) {
        // Multipart: buffer → base64
        image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      } else if (req.body[imageField]) {
        // Base64 JSON
        image = req.body[imageField];
        if (!image.startsWith('data:image')) {
          image = `data:image/jpeg;base64,${image}`;
        }
      }
      
      if (!image) reject(new Error('No image provided'));
      resolve(image);
    });
  });
};

const recognition = async (req, res) => {
  const { deviceId, gateName } = req.body;
  
  if (!deviceId) {
    throw new AppError('deviceId is required', 400);
  }
  
  const image = await handleImage(req);
  const result = await smartDecision(image, gateName || 'Main Gate');
  
  logSuccess('Face recognition completed', { 
    deviceId,
    gateName: result.gateName,
    recognized: !!result.userId
  });
  
  // Auto log if deviceId
  let accessResult = null;
  if (deviceId) {
    accessResult = await handleAccessEvent({
      ...result,
      deviceId,
      method: 'face',
      timestamp: new Date()
    });
  }
  
  res.json({ success: true, data: { recognition: result, access: accessResult } });
};

const smartAccess = async (req, res) => {
  const { deviceId, gateName = 'Main Gate' } = req.body;
  
  const image = await handleImage(req);
  const decision = await smartDecision(image, gateName);
  
  if (!decision) {
    throw new AppError('Failed to process image', 500);
  }
  
  const result = await handleAccessEvent({
    ...decision,
    deviceId: deviceId || 'smart-ai',
    method: 'face',
    timestamp: new Date()
  });
  
  logSuccess('Smart access decision made', { 
    deviceId: decision.deviceId,
    decision: decision.status
  });
  
  res.json({ success: true, data: { decision, access: result } });
};

// Admin endpoint for embedding extraction (for user face upload)
const extractEmbedding = async (req, res) => {
  const image = await handleImage(req, 'image');
  
  if (!image) {
    throw new AppError('No image provided', 400);
  }
  
  const { extractEmbedding: extractEmbeddingFn } = require('../services/ai.service');
  const embedding = await extractEmbeddingFn(image);
  
  if (!embedding) {
    throw new AppError('Failed to extract embedding', 500);
  }
  
  logSuccess('Face embedding extracted', { embeddingLength: embedding.length });
  res.json({ success: true, data: { embedding } });
};

module.exports = { recognition, smartAccess, extractEmbedding, handleImage: upload.single('image') };

