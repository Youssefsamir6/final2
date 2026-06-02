const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  status: {
    type: String,
    enum: ['Authorized', 'Unauthorized'],
    required: true
  },
  method: {
    type: String,
    enum: ['card', 'face', 'manual'],
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  gateName: {
    type: String,
    default: 'Main Gate'
  },
  deviceId: {
    type: String
  },
  confidence: {
    type: Number
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound indexes for queries/analytics
logSchema.index({ timestamp: -1 });
logSchema.index({ userId: 1, timestamp: -1 });
logSchema.index({ method: 1, status: 1, timestamp: -1 });
logSchema.index({ gateName: 1, timestamp: -1 });
logSchema.index({ deviceId: 1 });

module.exports = mongoose.model('Log', logSchema);

