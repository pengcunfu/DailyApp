const mongoose = require('mongoose');

const appearanceSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  photo: {
    type: String,
    required: true
  },
  record_date: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    maxlength: 500
  },
  weight: {
    type: Number,
    min: 0
  },
  height: {
    type: Number,
    min: 0
  },
  body_fat_rate: {
    type: Number,
    min: 0,
    max: 100
  },
  notes: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// 添加索引
appearanceSchema.index({ user_id: 1, record_date: -1 });

module.exports = mongoose.model('Appearance', appearanceSchema);
