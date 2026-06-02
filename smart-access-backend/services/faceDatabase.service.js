const axios = require('axios');

// AI Worker URL from env (default local)
const AI_URL = process.env.AI_URL || 'http://localhost:5000';

/**
 * Get face database status
 * @returns {Promise<{status, people, ready, people_list}>}
 */
const getDatabaseStatus = async () => {
  try {
    const response = await axios.get(`${AI_URL}/db-status`, { timeout: 5000 });
    return response.data;
  } catch (error) {
    console.error('Failed to get DB status:', error.message);
    throw new Error(`Database status check failed: ${error.message}`);
  }
};

/**
 * Add a person to the face database
 * @param {string} userId - User identifier
 * @param {Buffer} imageBuffer - Image file buffer
 * @param {string} filename - Original filename
 * @returns {Promise<{success, message, folder}>}
 */
const addPersonToDatabase = async (userId, imageBuffer, filename) => {
  try {
    const formData = new FormData();
    formData.append('user_id', userId);
    
    // Create a Blob from the buffer
    const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
    formData.append('image', blob, filename);
    
    const response = await axios.post(
      `${AI_URL}/add-person`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // Longer timeout for database rebuild
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Failed to add person to database:', error.message);
    throw new Error(`Failed to add person to database: ${error.message}`);
  }
};

/**
 * Rebuild the face recognition database
 * @returns {Promise<{success, message, ready}>}
 */
const rebuildDatabase = async () => {
  try {
    const response = await axios.post(
      `${AI_URL}/rebuild-db`,
      {},
      { timeout: 60000 } // Very long timeout for database rebuild
    );
    return response.data;
  } catch (error) {
    console.error('Failed to rebuild database:', error.message);
    throw new Error(`Database rebuild failed: ${error.message}`);
  }
};

/**
 * Check AI worker health
 * @returns {Promise<{status, ai_available, models_ready}>}
 */
const checkAIHealth = async () => {
  try {
    const response = await axios.get(`${AI_URL}/health`, { timeout: 5000 });
    return response.data;
  } catch (error) {
    console.error('AI worker health check failed:', error.message);
    return {
      status: 'error',
      ai_available: false,
      models_ready: false,
      error: error.message
    };
  }
};

module.exports = {
  getDatabaseStatus,
  addPersonToDatabase,
  rebuildDatabase,
  checkAIHealth
};
