const { Bill, BillCategory } = require('../models/Bill');
const moment = require('moment');

/**
 * Get all bills for current user
 */
const getBills = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, categoryId, startDate, endDate, search } = req.query;

    const query = {
      userId,
      isDeleted: false
    };

    // Filter by category
    if (categoryId) {
      query.categoryId = categoryId;
    }

    // Filter by date range
    if (startDate && endDate) {
      query.spendingTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Search by order name
    if (search) {
      query.orderName = { $regex: search, $options: 'i' };
    }

    const bills = await Bill.find(query)
      .sort({ spendingTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Bill.countDocuments(query);

    res.json({
      success: true,
      data: {
        bills,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get bills error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get bill by ID
 */
const getBillById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const bill = await Bill.findOne({
      _id: id,
      userId,
      isDeleted: false
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    res.json({
      success: true,
      data: { bill }
    });
  } catch (error) {
    console.error('Get bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create new bill
 */
const createBill = async (req, res) => {
  try {
    const userId = req.user.id;
    const { categoryId, amount, orderName, description, spendingTime, tags } = req.body;

    // Verify category exists
    const category = await BillCategory.findById(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    const bill = new Bill({
      userId,
      categoryId,
      amount,
      orderName,
      description,
      spendingTime: spendingTime || new Date(),
      tags: tags || []
    });

    await bill.save();

    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      data: { bill }
    });
  } catch (error) {
    console.error('Create bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update bill
 */
const updateBill = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { categoryId, amount, orderName, description, spendingTime, tags } = req.body;

    const bill = await Bill.findOne({
      _id: id,
      userId,
      isDeleted: false
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Verify category exists if provided
    if (categoryId) {
      const category = await BillCategory.findById(categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }
      bill.categoryId = categoryId;
    }

    // Update fields
    if (amount !== undefined) bill.amount = amount;
    if (orderName !== undefined) bill.orderName = orderName;
    if (description !== undefined) bill.description = description;
    if (spendingTime !== undefined) bill.spendingTime = spendingTime;
    if (tags !== undefined) bill.tags = tags;

    await bill.save();

    res.json({
      success: true,
      message: 'Bill updated successfully',
      data: { bill }
    });
  } catch (error) {
    console.error('Update bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete bill (soft delete)
 */
const deleteBill = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const bill = await Bill.findOne({
      _id: id,
      userId,
      isDeleted: false
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    await bill.softDelete();

    res.json({
      success: true,
      message: 'Bill deleted successfully'
    });
  } catch (error) {
    console.error('Delete bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get spending statistics
 */
const getSpendingStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'month' } = req.query;

    let startDate, endDate;
    const now = moment();

    switch (period) {
      case 'week':
        startDate = now.clone().startOf('week').toDate();
        endDate = now.clone().endOf('week').toDate();
        break;
      case 'month':
        startDate = now.clone().startOf('month').toDate();
        endDate = now.clone().endOf('month').toDate();
        break;
      case 'year':
        startDate = now.clone().startOf('year').toDate();
        endDate = now.clone().endOf('year').toDate();
        break;
      default:
        startDate = now.clone().startOf('month').toDate();
        endDate = now.clone().endOf('month').toDate();
    }

    const stats = await Bill.getSpendingStats(userId, startDate, endDate);

    // Get total spending
    const totalSpending = await Bill.aggregate([
      {
        $match: {
          userId: req.user.id,
          isDeleted: false,
          spendingTime: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avg: { $avg: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        period,
        startDate,
        endDate,
        categoryStats: stats,
        total: totalSpending.length > 0 ? totalSpending[0] : { total: 0, count: 0, avg: 0 }
      }
    });
  } catch (error) {
    console.error('Get spending stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all categories
 */
const getCategories = async (req, res) => {
  try {
    const categories = await BillCategory.find({ isActive: true })
      .sort({ name: 1 });

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create category
 */
const createCategory = async (req, res) => {
  try {
    const { name, parentId, icon, color } = req.body;

    // Check if category with same name exists
    const existingCategory = await BillCategory.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const category = new BillCategory({
      name,
      parentId,
      icon,
      color
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getBills,
  getBillById,
  createBill,
  updateBill,
  deleteBill,
  getSpendingStats,
  getCategories,
  createCategory
};
