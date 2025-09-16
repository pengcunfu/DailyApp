const mongoose = require('mongoose');

const todoDetailSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  status: {
    type: Number,
    enum: [0, 1], // 0: 未完成, 1: 已完成
    default: 0
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

const todoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    trim: true,
    maxlength: 2000,
    default: ''
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  status: {
    type: Number,
    enum: [0, 1], // 0: 未完成, 1: 已完成
    default: 0
  },
  priority: {
    type: Number,
    enum: [0, 1, 2], // 0: 普通, 1: 重要, 2: 紧急
    default: 0
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  details: [todoDetailSchema],
  completedAt: {
    type: Date
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
todoSchema.index({ userId: 1, isDeleted: 1 });
todoSchema.index({ userId: 1, status: 1 });
todoSchema.index({ userId: 1, priority: -1 });
todoSchema.index({ endTime: 1 });

// Calculate progress based on completed details
todoSchema.methods.calculateProgress = function() {
  if (this.details.length === 0) {
    this.progress = this.status === 1 ? 100 : 0;
  } else {
    const completedDetails = this.details.filter(detail => detail.status === 1).length;
    this.progress = Math.round((completedDetails / this.details.length) * 100);
  }
  return this.progress;
};

// Mark as completed
todoSchema.methods.markCompleted = function() {
  this.status = 1;
  this.completedAt = new Date();
  this.progress = 100;
  return this.save();
};

// Mark as incomplete
todoSchema.methods.markIncomplete = function() {
  this.status = 0;
  this.completedAt = null;
  this.calculateProgress();
  return this.save();
};

// Soft delete method
todoSchema.methods.softDelete = function() {
  this.isDeleted = true;
  return this.save();
};

// Update progress before saving
todoSchema.pre('save', function(next) {
  if (this.isModified('details') || this.isModified('status')) {
    this.calculateProgress();
  }
  next();
});

// Static method to get user's todo statistics
todoSchema.statics.getTodoStats = async function(userId) {
  const stats = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        isDeleted: false
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 1] }, 1, 0] }
        },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 0] }, 1, 0] }
        },
        urgent: {
          $sum: { $cond: [{ $eq: ['$priority', 2] }, 1, 0] }
        },
        important: {
          $sum: { $cond: [{ $eq: ['$priority', 1] }, 1, 0] }
        },
        avgProgress: { $avg: '$progress' }
      }
    }
  ]);

  return stats.length > 0 ? stats[0] : {
    total: 0,
    completed: 0,
    pending: 0,
    urgent: 0,
    important: 0,
    avgProgress: 0
  };
};

module.exports = mongoose.model('Todo', todoSchema);
