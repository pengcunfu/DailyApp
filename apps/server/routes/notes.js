const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { auth } = require('../middleware/auth');
const { validateNote, handleValidationErrors } = require('../middleware/validation');
const { body } = require('express-validator');

/**
 * @route   GET /api/notes
 * @desc    Get all notes for current user
 * @access  Private
 */
router.get('/', auth, noteController.getNotes);

/**
 * @route   GET /api/notes/stats
 * @desc    Get note statistics
 * @access  Private
 */
router.get('/stats', auth, noteController.getNoteStats);

/**
 * @route   GET /api/notes/types
 * @desc    Get all note types
 * @access  Private
 */
router.get('/types', auth, noteController.getNoteTypes);

/**
 * @route   POST /api/notes/types
 * @desc    Create new note type
 * @access  Private
 */
router.post('/types',
  auth,
  [
    body('name')
      .isLength({ min: 1, max: 50 })
      .withMessage('Type name must be between 1 and 50 characters'),
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
  noteController.createNoteType
);

/**
 * @route   GET /api/notes/:id
 * @desc    Get note by ID
 * @access  Private
 */
router.get('/:id', auth, noteController.getNoteById);

/**
 * @route   POST /api/notes
 * @desc    Create new note
 * @access  Private
 */
router.post('/', auth, validateNote, noteController.createNote);

/**
 * @route   PUT /api/notes/:id
 * @desc    Update note
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
      .isLength({ max: 10000 })
      .withMessage('Content must not exceed 10000 characters'),
    body('typeId')
      .optional()
      .isMongoId()
      .withMessage('Valid type ID is required'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('tags.*')
      .optional()
      .isLength({ min: 1, max: 20 })
      .withMessage('Each tag must be between 1 and 20 characters'),
    body('attrs')
      .optional()
      .isArray()
      .withMessage('Attributes must be an array'),
    body('attrs.*.key')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Attribute key must be between 1 and 50 characters'),
    body('attrs.*.value')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Attribute value must not exceed 1000 characters'),
    body('isPrivate')
      .optional()
      .isBoolean()
      .withMessage('isPrivate must be a boolean'),
    handleValidationErrors
  ],
  noteController.updateNote
);

/**
 * @route   DELETE /api/notes/:id
 * @desc    Delete note (soft delete)
 * @access  Private
 */
router.delete('/:id', auth, noteController.deleteNote);

module.exports = router;
