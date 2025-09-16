const mongoose = require('mongoose');

const billCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BillCategory',
    default: null
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

const billSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BillCategory',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  orderName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  spendingTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
billSchema.index({ userId: 1, isDeleted: 1 });
billSchema.index({ userId: 1, spendingTime: -1 });
billSchema.index({ categoryId: 1 });

// Populate category information when querying
billSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'categoryId',
    select: 'name icon color'
  });
  next();
});

// Static method to get user's spending statistics
billSchema.statics.getSpendingStats = async function(userId, startDate, endDate) {
  const pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        isDeleted: false,
        spendingTime: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$categoryId',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }
    },
    {
      $lookup: {
        from: 'billcategories',
        localField: '_id',
        foreignField: '_id',
        as: 'category'
      }
    },
    {
      $unwind: '$category'
    },
    {
      $project: {
        categoryName: '$category.name',
        categoryIcon: '$category.icon',
        categoryColor: '$category.color',
        totalAmount: 1,
        count: 1,
        avgAmount: { $round: ['$avgAmount', 2] }
      }
    },
    {
      $sort: { totalAmount: -1 }
    }
  ];

  return this.aggregate(pipeline);
};

// Soft delete method
billSchema.methods.softDelete = function() {
  this.isDeleted = true;
  return this.save();
};

const BillCategory = mongoose.model('BillCategory', billCategorySchema);
const Bill = mongoose.model('Bill', billSchema);

module.exports = { Bill, BillCategory };
