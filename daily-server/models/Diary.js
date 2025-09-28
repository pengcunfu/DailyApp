const mongoose = require('mongoose');

const diarySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  date: {
    type: Date,
    default: Date.now
  },
  mood: {
    type: String,
    enum: ['very_happy', 'happy', 'normal', 'sad', 'very_sad'],
    default: 'normal'
  },
  weather: {
    type: String,
    maxlength: 50
  },
  location: {
    type: String,
    maxlength: 200
  },
  images: [{
    type: String
  }],
  tags: [{
    type: String,
    maxlength: 50
  }],
  is_private: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 添加索引
diarySchema.index({ user_id: 1, date: -1 });
diarySchema.index({ user_id: 1, tags: 1 });

module.exports = mongoose.model('Diary', diarySchema);
