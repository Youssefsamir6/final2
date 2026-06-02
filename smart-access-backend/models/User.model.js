const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const EMBEDDING_DIM = 128;

const faceImageSchema = new mongoose.Schema({
  data: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: false,
    trim: true
  },
idNumber: {
    type: String,
    required: false,
    unique: false
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'guard', 'user'],
    default: 'user'
  },
isActive: {
    type: Boolean,
    default: true
  },
  rfid: {
    type: String
  },
  faceImages: {
    type: [faceImageSchema],
    default: [] ,
    validate: {
      validator: function(arr) {
        if (!Array.isArray(arr)) return true;
        if (arr.length > 10) return false; // max 10 images per user
        for (let item of arr) {
          try {
            const parts = item.data.split(',');
            const b64 = parts.length > 1 ? parts[1] : parts[0];
            const size = Buffer.from(b64, 'base64').length;
            if (size > MAX_IMAGE_BYTES) return false;
          } catch (e) {
            return false;
          }
        }
        return true;
      },
      message: 'faceImages exceed limits (count or size)'
    }
  },
  faceEmbedding: {
    type: [Number],
    validate: {
      validator: function(arr) {
        if (!arr) return true;
        return Array.isArray(arr) && arr.length === EMBEDDING_DIM;
      },
      message: `faceEmbedding must be an array of length ${EMBEDDING_DIM}`
    }
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ rfid: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ idNumber: 1 });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

