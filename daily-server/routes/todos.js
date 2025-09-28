const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const { auth } = require('../middleware/auth');
const { validateTodo, handleValidationErrors } = require('../middleware/validation');
const { body } = require('express-validator');

/**
 * @route   GET /api/todos
 * @desc    Get all todos for current user
 * @access  Private
 */
router.get('/', auth, todoController.getTodos);

/**
 * @route   GET /api/todos/stats
 * @desc    Get todo statistics
 * @access  Private
 */
router.get('/stats', auth, todoController.getTodoStats);

/**
 * @route   GET /api/todos/:id
 * @desc    Get todo by ID
 * @access  Private
 */
router.get('/:id', auth, todoController.getTodoById);

/**
 * @route   POST /api/todos
 * @desc    Create new todo
 * @access  Private
 */
router.post('/', auth, validateTodo, todoController.createTodo);

/**
 * @route   PUT /api/todos/:id
 * @desc    Update todo
 * @access  Private
 */
router.put('/:id',
  auth,
  [
    body('title')
      .optional()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('content')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('Content must not exceed 2000 characters'),
    body('priority')
      .optional()
      .isIn([0, 1, 2])
      .withMessage('Priority must be 0 (normal), 1 (important), or 2 (urgent)'),
    body('startTime')
      .optional()
      .isISO8601()
      .withMessage('Valid start time is required'),
    body('endTime')
      .optional()
      .isISO8601()
      .withMessage('Valid end time is required'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('tags.*')
      .optional()
      .isLength({ min: 1, max: 20 })
      .withMessage('Each tag must be between 1 and 20 characters'),
    body('details')
      .optional()
      .isArray()
      .withMessage('Details must be an array'),
    body('details.*.content')
      .optional()
      .isLength({ min: 1, max: 500 })
      .withMessage('Detail content must be between 1 and 500 characters'),
    handleValidationErrors
  ],
  todoController.updateTodo
);

/**
 * @route   PATCH /api/todos/:id/toggle
 * @desc    Toggle todo status (complete/incomplete)
 * @access  Private
 */
router.patch('/:id/toggle', auth, todoController.toggleTodoStatus);

/**
 * @route   DELETE /api/todos/:id
 * @desc    Delete todo (soft delete)
 * @access  Private
 */
router.delete('/:id', auth, todoController.deleteTodo);

module.exports = router;
