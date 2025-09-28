const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const { auth } = require('../middleware/auth');
const { validateFriend, handleValidationErrors } = require('../middleware/validation');
const { body } = require('express-validator');

/**
 * @route   GET /api/friends
 * @desc    Get all friends for current user
 * @access  Private
 */
router.get('/', auth, friendController.getFriends);

/**
 * @route   GET /api/friends/birthdays
 * @desc    Get upcoming birthdays
 * @access  Private
 */
router.get('/birthdays', auth, friendController.getUpcomingBirthdays);

/**
 * @route   GET /api/friends/stats
 * @desc    Get friend statistics
 * @access  Private
 */
router.get('/stats', auth, friendController.getFriendStats);

/**
 * @route   GET /api/friends/:id
 * @desc    Get friend by ID
 * @access  Private
 */
router.get('/:id', auth, friendController.getFriendById);

/**
 * @route   POST /api/friends
 * @desc    Create new friend
 * @access  Private
 */
router.post('/', auth, validateFriend, friendController.createFriend);

/**
 * @route   PUT /api/friends/:id
 * @desc    Update friend
 * @access  Private
 */
router.put('/:id',
  auth,
  [
    body('name')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Name must be between 1 and 50 characters'),
    body('nickname')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Nickname must not exceed 50 characters'),
    body('sex')
      .optional()
      .isIn([1, 2])
      .withMessage('Sex must be 1 (male) or 2 (female)'),
    body('birthDate')
      .optional()
      .isISO8601()
      .withMessage('Valid birth date is required'),
    body('birthType')
      .optional()
      .isIn([1, 2])
      .withMessage('Birth type must be 1 (lunar) or 2 (solar)'),
    body('contacts')
      .optional()
      .isArray()
      .withMessage('Contacts must be an array'),
    body('contacts.*.type')
      .optional()
      .isIn(['phone', 'qq', 'wechat', 'email'])
      .withMessage('Contact type must be phone, qq, wechat, or email'),
    body('contacts.*.value')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Contact value must be between 1 and 100 characters'),
    body('relationship')
      .optional()
      .isIn(['family', 'friend', 'colleague', 'classmate', 'other'])
      .withMessage('Relationship must be family, friend, colleague, classmate, or other'),
    body('importance')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Importance must be between 1 and 5'),
    body('hobbies')
      .optional()
      .isArray()
      .withMessage('Hobbies must be an array'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('advantages')
      .optional()
      .isArray()
      .withMessage('Advantages must be an array'),
    body('disadvantages')
      .optional()
      .isArray()
      .withMessage('Disadvantages must be an array'),
    handleValidationErrors
  ],
  friendController.updateFriend
);

/**
 * @route   PATCH /api/friends/:id/contact
 * @desc    Update last contact date
 * @access  Private
 */
router.patch('/:id/contact', auth, friendController.updateLastContact);

/**
 * @route   POST /api/friends/:id/contacts
 * @desc    Add contact to friend
 * @access  Private
 */
router.post('/:id/contacts',
  auth,
  [
    body('type')
      .isIn(['phone', 'qq', 'wechat', 'email'])
      .withMessage('Contact type must be phone, qq, wechat, or email'),
    body('value')
      .isLength({ min: 1, max: 100 })
      .withMessage('Contact value must be between 1 and 100 characters'),
    body('label')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Label must not exceed 50 characters'),
    body('isPrimary')
      .optional()
      .isBoolean()
      .withMessage('isPrimary must be a boolean'),
    handleValidationErrors
  ],
  friendController.addContact
);

/**
 * @route   DELETE /api/friends/:id/contacts/:contactId
 * @desc    Remove contact from friend
 * @access  Private
 */
router.delete('/:id/contacts/:contactId', auth, friendController.removeContact);

/**
 * @route   DELETE /api/friends/:id
 * @desc    Delete friend (soft delete)
 * @access  Private
 */
router.delete('/:id', auth, friendController.deleteFriend);

module.exports = router;
