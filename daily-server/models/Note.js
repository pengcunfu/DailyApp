const mongoose = require('mongoose');

const noteTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  icon: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#409EFF'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const noteAttrSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  value: {
    type: String,
    trim: true,
    maxlength: 1000
  }
});

const noteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  typeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NoteType'
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
    maxlength: 10000,
    default: ''
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  attrs: [noteAttrSchema],
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
noteSchema.index({ userId: 1, isDeleted: 1 });
noteSchema.index({ userId: 1, typeId: 1 });
noteSchema.index({ title: 'text', content: 'text' });
noteSchema.index({ tags: 1 });

// Populate type information when querying
noteSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'typeId',
    select: 'name icon color'
  });
  next();
});

// Soft delete method
noteSchema.methods.softDelete = function() {
  this.isDeleted = true;
  return this.save();
};

// Add tag method
noteSchema.methods.addTag = function(tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
  }
  return this.save();
};

// Remove tag method
noteSchema.methods.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
  return this.save();
};

// Add attribute method
noteSchema.methods.addAttribute = function(key, value) {
  const existingAttr = this.attrs.find(attr => attr.key === key);
  if (existingAttr) {
    existingAttr.value = value;
  } else {
    this.attrs.push({ key, value });
  }
  return this.save();
};

// Remove attribute method
noteSchema.methods.removeAttribute = function(key) {
  this.attrs = this.attrs.filter(attr => attr.key !== key);
  return this.save();
};

// Static method to search notes
noteSchema.statics.searchNotes = async function(userId, query, filters = {}) {
  const searchConditions = {
    userId: new mongoose.Types.ObjectId(userId),
    isDeleted: false,
    ...filters
  };

  if (query) {
    searchConditions.$text = { $search: query };
  }

  const notes = await this.find(searchConditions)
    .sort({ score: { $meta: 'textScore' }, updatedAt: -1 })
    .limit(50);

  return notes;
};

// Static method to get user's note statistics
noteSchema.statics.getNoteStats = async function(userId) {
  const stats = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        isDeleted: false
      }
    },
    {
      $group: {
        _id: '$typeId',
        count: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'notetypes',
        localField: '_id',
        foreignField: '_id',
        as: 'type'
      }
    },
    {
      $unwind: {
        path: '$type',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        typeName: { $ifNull: ['$type.name', 'Uncategorized'] },
        typeIcon: { $ifNull: ['$type.icon', ''] },
        typeColor: { $ifNull: ['$type.color', '#409EFF'] },
        count: 1
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  const totalNotes = await this.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    isDeleted: false
  });

  return {
    total: totalNotes,
    byType: stats
  };
};

const NoteType = mongoose.model('NoteType', noteTypeSchema);
const Note = mongoose.model('Note', noteSchema);

module.exports = { Note, NoteType };
