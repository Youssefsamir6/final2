const axios = require('axios');
const User = require('../models/User.model');

// AI Worker URL from env (default local)
const AI_URL = process.env.AI_URL || 'http://localhost:5000';

// face_recognition returns 128-dim embedding
const EMBEDDING_DIM = 128;

/**
 * Recognize face from base64 image against known user embeddings
 * @param {string} imageBase64 - Full image data:image/jpeg;base64,...
 * @returns {Promise<{userId, confidence:0-1, status, reason}>}
 */
const recognizeFace = async (imageBase64) => {
  try {
    // Call Python AI worker
    const response = await axios.post(`${AI_URL}/recognize`, { 
      image: imageBase64,
      embedding_dim: EMBEDDING_DIM 
    }, { 
      timeout: 10000 
    });

    const { userId, confidence, embedding } = response.data;

    if (confidence > 0.6) { // Threshold
      return { 
        userId, 
        confidence, 
        status: 'authorized', 
        reason: `Face match conf ${confidence.toFixed(2)}`,
        method: 'face'
      };
    } else {
      return { 
        userId: null, 
        confidence, 
        status: confidence > 0.3 ? 'suspicious' : 'unknown',
        reason: `Low confidence ${confidence.toFixed(2)}`,
        method: 'face'
      };
    }
  } catch (error) {
    console.error('AI service error:', error.message);
    
    // Fallback to legacy mock for dev/robustness
    const { recognizeFace: mock } = require('./accessEvent.service');
    return mock(imageBase64);
  }
};

/**
 * Extract embedding for storage (admin upload)
 */
const extractEmbedding = async (imageBase64) => {
  try {
    const response = await axios.post(`${AI_URL}/embedding`, { 
      image: imageBase64 
    });
    return response.data.embedding; // [0.1, 0.2, ...] 128 floats
  } catch (error) {
    throw new Error(`Embedding extraction failed: ${error.message}`);
  }
};

module.exports = { recognizeFace, extractEmbedding };

