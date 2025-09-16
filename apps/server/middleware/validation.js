const { body, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * User registration validation rules
 */
const validateUserRegistration = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number'),
  
  handleValidationErrors
];

/**
 * User login validation rules
 */
const validateUserLogin = [
  body('username')
    .notEmpty()
    .withMessage('Username is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

/**
 * Bill validation rules
 */
const validateBill = [
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  
  body('categoryId')
    .isMongoId()
    .withMessage('Valid category ID is required'),
  
  body('orderName')
    .isLength({ min: 1, max: 200 })
    .withMessage('Order name must be between 1 and 200 characters'),
  
  body('spendingTime')
    .isISO8601()
    .withMessage('Valid spending time is required'),
  
  handleValidationErrors
];

/**
 * Todo validation rules
 */
const validateTodo = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
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
  
  handleValidationErrors
];

/**
 * Note validation rules
 */
const validateNote = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('content')
    .optional()
    .isLength({ max: 10000 })
    .withMessage('Content must not exceed 10000 characters'),
  
  handleValidationErrors
];

/**
 * Friend validation rules
 */
const validateFriend = [
  body('name')
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters'),
  
  body('sex')
    .optional()
    .isIn([1, 2])
    .withMessage('Sex must be 1 (male) or 2 (female)'),
  
  body('birthType')
    .optional()
    .isIn([1, 2])
    .withMessage('Birth type must be 1 (lunar) or 2 (solar)'),
  
  body('phone')
    .optional()
    .isMobilePhone('zh-CN')
    .withMessage('Please provide a valid phone number'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateBill,
  validateTodo,
  validateNote,
  validateFriend,
  handleValidationErrors
};
