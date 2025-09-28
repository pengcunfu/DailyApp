const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const { auth } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { body } = require('express-validator');

/**
 * @route   GET /api/foods
 * @desc    Get all food records for current user
 * @access  Private
 */
router.get('/', auth, foodController.getFoods);

/**
 * @route   GET /api/foods/daily-nutrition
 * @desc    Get daily nutrition summary
 * @access  Private
 */
router.get('/daily-nutrition', auth, foodController.getDailyNutrition);

/**
 * @route   GET /api/foods/nutrition-by-meal
 * @desc    Get nutrition by meal type
 * @access  Private
 */
router.get('/nutrition-by-meal', auth, foodController.getNutritionByMealType);

/**
 * @route   GET /api/foods/favorites
 * @desc    Get favorite foods
 * @access  Private
 */
router.get('/favorites', auth, foodController.getFavoriteFoods);

/**
 * @route   GET /api/foods/categories
 * @desc    Get all food categories
 * @access  Private
 */
router.get('/categories', auth, foodController.getFoodCategories);

/**
 * @route   POST /api/foods/categories
 * @desc    Create new food category
 * @access  Private
 */
router.post('/categories',
  auth,
  [
    body('name')
      .isLength({ min: 1, max: 50 })
      .withMessage('Category name must be between 1 and 50 characters'),
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
  foodController.createFoodCategory
);

/**
 * @route   GET /api/foods/:id
 * @desc    Get food record by ID
 * @access  Private
 */
router.get('/:id', auth, foodController.getFoodById);

/**
 * @route   POST /api/foods
 * @desc    Create new food record
 * @access  Private
 */
router.post('/',
  auth,
  [
    body('name')
      .isLength({ min: 1, max: 100 })
      .withMessage('Food name must be between 1 and 100 characters'),
    body('categoryId')
      .optional()
      .isMongoId()
      .withMessage('Valid category ID is required'),
    body('mealTime')
      .optional()
      .isISO8601()
      .withMessage('Valid meal time is required'),
    body('mealType')
      .optional()
      .isIn(['breakfast', 'lunch', 'dinner', 'snack'])
      .withMessage('Meal type must be breakfast, lunch, dinner, or snack'),
    body('quantity')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Quantity must be a positive number'),
    body('unit')
      .optional()
      .isLength({ max: 20 })
      .withMessage('Unit must not exceed 20 characters'),
    body('nutrition.calories')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Calories must be a positive number'),
    body('nutrition.protein')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Protein must be a positive number'),
    body('nutrition.carbs')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Carbs must be a positive number'),
    body('nutrition.fat')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Fat must be a positive number'),
    body('location')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Location must not exceed 100 characters'),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('tags.*')
      .optional()
      .isLength({ min: 1, max: 20 })
      .withMessage('Each tag must be between 1 and 20 characters'),
    body('remark')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Remark must not exceed 500 characters'),
    body('mood')
      .optional()
      .isIn(['excellent', 'good', 'neutral', 'bad', 'terrible'])
      .withMessage('Mood must be excellent, good, neutral, bad, or terrible'),
    handleValidationErrors
  ],
  foodController.createFood
);

/**
 * @route   PUT /api/foods/:id
 * @desc    Update food record
 * @access  Private
 */
router.put('/:id',
  auth,
  [
    body('name')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Food name must be between 1 and 100 characters'),
    body('categoryId')
      .optional()
      .isMongoId()
      .withMessage('Valid category ID is required'),
    body('mealTime')
      .optional()
      .isISO8601()
      .withMessage('Valid meal time is required'),
    body('mealType')
      .optional()
      .isIn(['breakfast', 'lunch', 'dinner', 'snack'])
      .withMessage('Meal type must be breakfast, lunch, dinner, or snack'),
    body('quantity')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Quantity must be a positive number'),
    body('rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('mood')
      .optional()
      .isIn(['excellent', 'good', 'neutral', 'bad', 'terrible'])
      .withMessage('Mood must be excellent, good, neutral, bad, or terrible'),
    handleValidationErrors
  ],
  foodController.updateFood
);

/**
 * @route   DELETE /api/foods/:id
 * @desc    Delete food record (soft delete)
 * @access  Private
 */
router.delete('/:id', auth, foodController.deleteFood);

module.exports = router;
