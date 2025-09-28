const { Food, FoodCategory } = require('../models/Food');
const moment = require('moment');

/**
 * Get all food records for current user
 */
const getFoods = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, categoryId, mealType, startDate, endDate, search } = req.query;

    const query = {
      userId,
      isDeleted: false
    };

    // Filter by category
    if (categoryId) {
      query.categoryId = categoryId;
    }

    // Filter by meal type
    if (mealType) {
      query.mealType = mealType;
    }

    // Filter by date range
    if (startDate && endDate) {
      query.mealTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Search by name
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const foods = await Food.find(query)
      .sort({ mealTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Food.countDocuments(query);

    res.json({
      success: true,
      data: {
        foods,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get foods error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get food by ID
 */
const getFoodById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const food = await Food.findOne({
      _id: id,
      userId,
      isDeleted: false
    });

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food record not found'
      });
    }

    res.json({
      success: true,
      data: { food }
    });
  } catch (error) {
    console.error('Get food error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create new food record
 */
const createFood = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      name, 
      categoryId, 
      mealTime, 
      mealType, 
      quantity, 
      unit, 
      nutrition, 
      location, 
      price, 
      rating, 
      tags, 
      remark, 
      mood 
    } = req.body;

    // Verify category exists if provided
    if (categoryId) {
      const category = await FoodCategory.findById(categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid food category'
        });
      }
    }

    const food = new Food({
      userId,
      name,
      categoryId,
      mealTime: mealTime || new Date(),
      mealType: mealType || 'lunch',
      quantity: quantity || 1,
      unit: unit || '份',
      nutrition: nutrition || {},
      location,
      price,
      rating,
      tags: tags || [],
      remark,
      mood: mood || 'good'
    });

    await food.save();

    res.status(201).json({
      success: true,
      message: 'Food record created successfully',
      data: { food }
    });
  } catch (error) {
    console.error('Create food error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update food record
 */
const updateFood = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const food = await Food.findOne({
      _id: id,
      userId,
      isDeleted: false
    });

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food record not found'
      });
    }

    // Verify category exists if provided
    if (updateData.categoryId) {
      const category = await FoodCategory.findById(updateData.categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid food category'
        });
      }
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        food[key] = updateData[key];
      }
    });

    await food.save();

    res.json({
      success: true,
      message: 'Food record updated successfully',
      data: { food }
    });
  } catch (error) {
    console.error('Update food error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete food record (soft delete)
 */
const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const food = await Food.findOne({
      _id: id,
      userId,
      isDeleted: false
    });

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food record not found'
      });
    }

    await food.softDelete();

    res.json({
      success: true,
      message: 'Food record deleted successfully'
    });
  } catch (error) {
    console.error('Delete food error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get daily nutrition summary
 */
const getDailyNutrition = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date = new Date() } = req.query;

    const targetDate = new Date(date);
    const dailyNutrition = await Food.getDailyCalories(userId, targetDate);

    res.json({
      success: true,
      data: {
        date: targetDate,
        nutrition: dailyNutrition
      }
    });
  } catch (error) {
    console.error('Get daily nutrition error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get nutrition by meal type
 */
const getNutritionByMealType = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : moment().startOf('month').toDate();
    const end = endDate ? new Date(endDate) : moment().endOf('month').toDate();

    const nutritionData = await Food.getNutritionByMealType(userId, start, end);

    res.json({
      success: true,
      data: {
        startDate: start,
        endDate: end,
        nutritionByMealType: nutritionData
      }
    });
  } catch (error) {
    console.error('Get nutrition by meal type error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get favorite foods
 */
const getFavoriteFoods = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const favoriteFoods = await Food.getFavoriteFoods(userId, parseInt(limit));

    res.json({
      success: true,
      data: { favoriteFoods }
    });
  } catch (error) {
    console.error('Get favorite foods error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all food categories
 */
const getFoodCategories = async (req, res) => {
  try {
    const categories = await FoodCategory.find({ isActive: true })
      .sort({ name: 1 });

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get food categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create food category
 */
const createFoodCategory = async (req, res) => {
  try {
    const { name, icon, color } = req.body;

    // Check if category with same name exists
    const existingCategory = await FoodCategory.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Food category with this name already exists'
      });
    }

    const category = new FoodCategory({
      name,
      icon,
      color
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: 'Food category created successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Create food category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
  getDailyNutrition,
  getNutritionByMealType,
  getFavoriteFoods,
  getFoodCategories,
  createFoodCategory
};
