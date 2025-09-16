const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const { auth } = require('../middleware/auth');
const { validateBill, handleValidationErrors } = require('../middleware/validation');
const { body } = require('express-validator');

/**
 * @route   GET /api/bills
 * @desc    Get all bills for current user
 * @access  Private
 */
router.get('/', auth, billController.getBills);

/**
 * @route   GET /api/bills/stats
 * @desc    Get spending statistics
 * @access  Private
 */
router.get('/stats', auth, billController.getSpendingStats);

/**
 * @route   GET /api/bills/categories
 * @desc    Get all bill categories
 * @access  Private
 */
router.get('/categories', auth, billController.getCategories);

/**
 * @route   POST /api/bills/categories
 * @desc    Create new bill category
 * @access  Private
 */
router.post('/categories',
  auth,
  [
    body('name')
      .isLength({ min: 1, max: 50 })
      .withMessage('Category name must be between 1 and 50 characters'),
    body('parentId')
      .optional()
      .isMongoId()
      .withMessage('Valid parent category ID is required'),
    body('icon')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Icon must not exceed 50 characters'),
    body('color')
      .optional()
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
      .withMessage('Color must be a valid hex color'),
    handleValidationErrors
  ],
  billController.createCategory
);

/**
 * @route   GET /api/bills/:id
 * @desc    Get bill by ID
 * @access  Private
 */
router.get('/:id', auth, billController.getBillById);

/**
 * @route   POST /api/bills
 * @desc    Create new bill
 * @access  Private
 */
router.post('/', auth, validateBill, billController.createBill);

/**
 * @route   PUT /api/bills/:id
 * @desc    Update bill
 * @access  Private
 */
router.put('/:id',
  auth,
  [
    body('amount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Amount must be a positive number'),
    body('categoryId')
      .optional()
      .isMongoId()
      .withMessage('Valid category ID is required'),
    body('orderName')
      .optional()
      .isLength({ min: 1, max: 200 })
      .withMessage('Order name must be between 1 and 200 characters'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description must not exceed 500 characters'),
    body('spendingTime')
      .optional()
      .isISO8601()
      .withMessage('Valid spending time is required'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('tags.*')
      .optional()
      .isLength({ min: 1, max: 20 })
      .withMessage('Each tag must be between 1 and 20 characters'),
    handleValidationErrors
  ],
  billController.updateBill
);

/**
 * @route   DELETE /api/bills/:id
 * @desc    Delete bill (soft delete)
 * @access  Private
 */
router.delete('/:id', auth, billController.deleteBill);

module.exports = router;
