const Todo = require('../models/Todo');

/**
 * Get all todos for current user
 */
const getTodos = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, priority, search, startDate, endDate } = req.query;

    const query = {
      userId,
      isDeleted: false
    };

    // Filter by status
    if (status !== undefined) {
      query.status = parseInt(status);
    }

    // Filter by priority
    if (priority !== undefined) {
      query.priority = parseInt(priority);
    }

    // Filter by date range
    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Search by title or content
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const todos = await Todo.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Todo.countDocuments(query);

    res.json({
      success: true,
      data: {
        todos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get todo by ID
 */
const getTodoById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const todo = await Todo.findOne({
      _id: id,
      userId,
      isDeleted: false
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    res.json({
      success: true,
      data: { todo }
    });
  } catch (error) {
    console.error('Get todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create new todo
 */
const createTodo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content, startTime, endTime, priority, tags, details } = req.body;

    const todo = new Todo({
      userId,
      title,
      content,
      startTime,
      endTime,
      priority: priority || 0,
      tags: tags || [],
      details: details || []
    });

    await todo.save();

    res.status(201).json({
      success: true,
      message: 'Todo created successfully',
      data: { todo }
    });
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update todo
 */
const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, content, startTime, endTime, priority, tags, details } = req.body;

    const todo = await Todo.findOne({
      _id: id,
      userId,
      isDeleted: false
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    // Update fields
    if (title !== undefined) todo.title = title;
    if (content !== undefined) todo.content = content;
    if (startTime !== undefined) todo.startTime = startTime;
    if (endTime !== undefined) todo.endTime = endTime;
    if (priority !== undefined) todo.priority = priority;
    if (tags !== undefined) todo.tags = tags;
    if (details !== undefined) todo.details = details;

    await todo.save();

    res.json({
      success: true,
      message: 'Todo updated successfully',
      data: { todo }
    });
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Toggle todo status
 */
const toggleTodoStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const todo = await Todo.findOne({
      _id: id,
      userId,
      isDeleted: false
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    if (todo.status === 0) {
      await todo.markCompleted();
    } else {
      await todo.markIncomplete();
    }

    res.json({
      success: true,
      message: 'Todo status updated successfully',
      data: { todo }
    });
  } catch (error) {
    console.error('Toggle todo status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete todo (soft delete)
 */
const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const todo = await Todo.findOne({
      _id: id,
      userId,
      isDeleted: false
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    await todo.softDelete();

    res.json({
      success: true,
      message: 'Todo deleted successfully'
    });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get todo statistics
 */
const getTodoStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await Todo.getTodoStats(userId);

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get todo stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  toggleTodoStatus,
  deleteTodo,
  getTodoStats
};
