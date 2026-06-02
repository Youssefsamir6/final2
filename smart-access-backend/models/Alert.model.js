const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  type: {
    type: String,
    enum: ['Unauthorized Access', 'Multiple Failed Attempts', 'Unknown Face', 'Suspicious Activity'],
    required: true
  },
  message: String,
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Indexes for queries
alertSchema.index({ userId: 1, isRead: 1, timestamp: -1 });
alertSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Alert', alertSchema);

