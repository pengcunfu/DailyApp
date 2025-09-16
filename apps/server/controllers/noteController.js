const { Note, NoteType } = require('../models/Note');

/**
 * Get all notes for current user
 */
const getNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, typeId, search, isPrivate } = req.query;

    const query = {
      userId,
      isDeleted: false
    };

    // Filter by type
    if (typeId) {
      query.typeId = typeId;
    }

    // Filter by privacy
    if (isPrivate !== undefined) {
      query.isPrivate = isPrivate === 'true';
    }

    // Search notes
    if (search) {
      const notes = await Note.searchNotes(userId, search, query);
      return res.json({
        success: true,
        data: { notes }
      });
    }

    const notes = await Note.find(query)
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Note.countDocuments(query);

    res.json({
      success: true,
      data: {
        notes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get note by ID
 */
const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const note = await Note.findOne({
      _id: id,
      userId,
      isDeleted: false
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    res.json({
      success: true,
      data: { note }
    });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create new note
 */
const createNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { typeId, title, content, tags, attrs, isPrivate } = req.body;

    // Verify type exists if provided
    if (typeId) {
      const type = await NoteType.findById(typeId);
      if (!type) {
        return res.status(400).json({
          success: false,
          message: 'Invalid note type'
        });
      }
    }

    const note = new Note({
      userId,
      typeId,
      title,
      content,
      tags: tags || [],
      attrs: attrs || [],
      isPrivate: isPrivate || false
    });

    await note.save();

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: { note }
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update note
 */
const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { typeId, title, content, tags, attrs, isPrivate } = req.body;

    const note = await Note.findOne({
      _id: id,
      userId,
      isDeleted: false
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Verify type exists if provided
    if (typeId) {
      const type = await NoteType.findById(typeId);
      if (!type) {
        return res.status(400).json({
          success: false,
          message: 'Invalid note type'
        });
      }
      note.typeId = typeId;
    }

    // Update fields
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = tags;
    if (attrs !== undefined) note.attrs = attrs;
    if (isPrivate !== undefined) note.isPrivate = isPrivate;

    await note.save();

    res.json({
      success: true,
      message: 'Note updated successfully',
      data: { note }
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete note (soft delete)
 */
const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const note = await Note.findOne({
      _id: id,
      userId,
      isDeleted: false
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    await note.softDelete();

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get note statistics
 */
const getNoteStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await Note.getNoteStats(userId);

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get note stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all note types
 */
const getNoteTypes = async (req, res) => {
  try {
    const types = await NoteType.find({ isActive: true })
      .sort({ name: 1 });

    res.json({
      success: true,
      data: { types }
    });
  } catch (error) {
    console.error('Get note types error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create note type
 */
const createNoteType = async (req, res) => {
  try {
    const { name, icon, color } = req.body;

    // Check if type with same name exists
    const existingType = await NoteType.findOne({ name });
    if (existingType) {
      return res.status(400).json({
        success: false,
        message: 'Note type with this name already exists'
      });
    }

    const type = new NoteType({
      name,
      icon,
      color
    });

    await type.save();

    res.status(201).json({
      success: true,
      message: 'Note type created successfully',
      data: { type }
    });
  } catch (error) {
    console.error('Create note type error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  getNoteStats,
  getNoteTypes,
  createNoteType
};
