const mongoose = require('mongoose');

const foodCategorySchema = new mongoose.Schema({
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

const nutritionSchema = new mongoose.Schema({
  calories: {
    type: Number,
    min: 0,
    default: 0
  },
  protein: {
    type: Number,
    min: 0,
    default: 0
  },
  carbs: {
    type: Number,
    min: 0,
    default: 0
  },
  fat: {
    type: Number,
    min: 0,
    default: 0
  },
  fiber: {
    type: Number,
    min: 0,
    default: 0
  },
  sugar: {
    type: Number,
    min: 0,
    default: 0
  },
  sodium: {
    type: Number,
    min: 0,
    default: 0
  }
});

const foodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodCategory'
  },
  mealTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    default: 'lunch'
  },
  quantity: {
    type: Number,
    min: 0,
    default: 1
  },
  unit: {
    type: String,
    trim: true,
    maxlength: 20,
    default: '份'
  },
  nutrition: {
    type: nutritionSchema,
    default: () => ({})
  },
  location: {
    type: String,
    trim: true,
    maxlength: 100,
    default: ''
  },
  price: {
    type: Number,
    min: 0
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  photos: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String
  }],
  remark: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  mood: {
    type: String,
    enum: ['excellent', 'good', 'neutral', 'bad', 'terrible'],
    default: 'good'
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
foodSchema.index({ userId: 1, isDeleted: 1 });
foodSchema.index({ userId: 1, mealTime: -1 });
foodSchema.index({ userId: 1, mealType: 1 });
foodSchema.index({ name: 'text' });

// Populate category information when querying
foodSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'categoryId',
    select: 'name icon color'
  });
  next();
});

// Calculate total calories for the day
foodSchema.statics.getDailyCalories = async function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const result = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        isDeleted: false,
        mealTime: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      }
    },
    {
      $group: {
        _id: null,
        totalCalories: { $sum: { $multiply: ['$nutrition.calories', '$quantity'] } },
        totalProtein: { $sum: { $multiply: ['$nutrition.protein', '$quantity'] } },
        totalCarbs: { $sum: { $multiply: ['$nutrition.carbs', '$quantity'] } },
        totalFat: { $sum: { $multiply: ['$nutrition.fat', '$quantity'] } },
        mealCount: { $sum: 1 }
      }
    }
  ]);

  return result.length > 0 ? result[0] : {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    mealCount: 0
  };
};

// Get nutrition summary by meal type
foodSchema.statics.getNutritionByMealType = async function(userId, startDate, endDate) {
  const result = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        isDeleted: false,
        mealTime: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$mealType',
        totalCalories: { $sum: { $multiply: ['$nutrition.calories', '$quantity'] } },
        totalProtein: { $sum: { $multiply: ['$nutrition.protein', '$quantity'] } },
        totalCarbs: { $sum: { $multiply: ['$nutrition.carbs', '$quantity'] } },
        totalFat: { $sum: { $multiply: ['$nutrition.fat', '$quantity'] } },
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { totalCalories: -1 }
    }
  ]);

  return result;
};

// Get favorite foods
foodSchema.statics.getFavoriteFoods = async function(userId, limit = 10) {
  const result = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        isDeleted: false,
        rating: { $exists: true }
      }
    },
    {
      $group: {
        _id: '$name',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
        lastEaten: { $max: '$mealTime' },
        totalCalories: { $sum: { $multiply: ['$nutrition.calories', '$quantity'] } }
      }
    },
    {
      $match: {
        count: { $gte: 2 }, // At least eaten twice
        avgRating: { $gte: 4 } // Average rating >= 4
      }
    },
    {
      $sort: { avgRating: -1, count: -1 }
    },
    {
      $limit: limit
    }
  ]);

  return result;
};

// Soft delete method
foodSchema.methods.softDelete = function() {
  this.isDeleted = true;
  return this.save();
};

// Add tag method
foodSchema.methods.addTag = function(tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
  }
  return this.save();
};

// Remove tag method
foodSchema.methods.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
  return this.save();
};

// Calculate total nutrition based on quantity
foodSchema.methods.getTotalNutrition = function() {
  return {
    calories: (this.nutrition.calories || 0) * this.quantity,
    protein: (this.nutrition.protein || 0) * this.quantity,
    carbs: (this.nutrition.carbs || 0) * this.quantity,
    fat: (this.nutrition.fat || 0) * this.quantity,
    fiber: (this.nutrition.fiber || 0) * this.quantity,
    sugar: (this.nutrition.sugar || 0) * this.quantity,
    sodium: (this.nutrition.sodium || 0) * this.quantity
  };
};

const FoodCategory = mongoose.model('FoodCategory', foodCategorySchema);
const Food = mongoose.model('Food', foodSchema);

module.exports = { Food, FoodCategory };
