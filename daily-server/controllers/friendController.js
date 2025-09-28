const Friend = require('../models/Friend');

/**
 * Get all friends for current user
 */
const getFriends = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, relationship, search, importance } = req.query;

    const query = {
      userId,
      isDeleted: false
    };

    // Filter by relationship
    if (relationship) {
      query.relationship = relationship;
    }

    // Filter by importance
    if (importance) {
      query.importance = parseInt(importance);
    }

    // Search friends
    if (search) {
      const friends = await Friend.searchFriends(userId, search, query);
      return res.json({
        success: true,
        data: { friends }
      });
    }

    const friends = await Friend.find(query)
      .sort({ importance: -1, name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Friend.countDocuments(query);

    res.json({
      success: true,
      data: {
        friends,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get friend by ID
 */
const getFriendById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const friend = await Friend.findOne({
      _id: id,
      userId,
      isDeleted: false
    });

    if (!friend) {
      return res.status(404).json({
        success: false,
        message: 'Friend not found'
      });
    }

    res.json({
      success: true,
      data: { friend }
    });
  } catch (error) {
    console.error('Get friend error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create new friend
 */
const createFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      nickname,
      sex,
      birthDate,
      birthType,
      avatar,
      contacts,
      liveAddress,
      homeAddress,
      school,
      profession,
      disposition,
      hobbies,
      tags,
      remark,
      advantages,
      disadvantages,
      relationship,
      importance
    } = req.body;

    const friend = new Friend({
      userId,
      name,
      nickname,
      sex,
      birthDate,
      birthType,
      avatar,
      contacts: contacts || [],
      liveAddress,
      homeAddress,
      school,
      profession,
      disposition,
      hobbies: hobbies || [],
      tags: tags || [],
      remark,
      advantages: advantages || [],
      disadvantages: disadvantages || [],
      relationship: relationship || 'friend',
      importance: importance || 3
    });

    await friend.save();

    res.status(201).json({
      success: true,
      message: 'Friend created successfully',
      data: { friend }
    });
  } catch (error) {
    console.error('Create friend error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update friend
 */
const updateFriend = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const friend = await Friend.findOne({
      _id: id,
      userId,
      isDeleted: false
    });

    if (!friend) {
      return res.status(404).json({
        success: false,
        message: 'Friend not found'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        friend[key] = updateData[key];
      }
    });

    await friend.save();

    res.json({
      success: true,
      message: 'Friend updated successfully',
      data: { friend }
    });
  } catch (error) {
    console.error('Update friend error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete friend (soft delete)
 */
const deleteFriend = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const friend = await Friend.findOne({
      _id: id,
      userId,
      isDeleted: false
    });

    if (!friend) {
      return res.status(404).json({
        success: false,
        message: 'Friend not found'
      });
    }

    await friend.softDelete();

    res.json({
      success: true,
      message: 'Friend deleted successfully'
    });
  } catch (error) {
    console.error('Delete friend error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get upcoming birthdays
 */
const getUpcomingBirthdays = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    const upcomingBirthdays = await Friend.getUpcomingBirthdays(userId, parseInt(days));

    res.json({
      success: true,
      data: { upcomingBirthdays }
    });
  } catch (error) {
    console.error('Get upcoming birthdays error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get friend statistics
 */
const getFriendStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await Friend.getFriendStats(userId);

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get friend stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update last contact date
 */
const updateLastContact = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const friend = await Friend.findOne({
      _id: id,
      userId,
      isDeleted: false
    });

    if (!friend) {
      return res.status(404).json({
        success: false,
        message: 'Friend not found'
      });
    }

    await friend.updateLastContact();

    res.json({
      success: true,
      message: 'Last contact date updated successfully',
      data: { friend }
    });
  } catch (error) {
    console.error('Update last contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Add contact to friend
 */
const addContact = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { type, value, label, isPrimary } = req.body;

    const friend = await Friend.findOne({
      _id: id,
      userId,
      isDeleted: false
    });

    if (!friend) {
      return res.status(404).json({
        success: false,
        message: 'Friend not found'
      });
    }

    await friend.addContact(type, value, label, isPrimary);

    res.json({
      success: true,
      message: 'Contact added successfully',
      data: { friend }
    });
  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Remove contact from friend
 */
const removeContact = async (req, res) => {
  try {
    const { id, contactId } = req.params;
    const userId = req.user.id;

    const friend = await Friend.findOne({
      _id: id,
      userId,
      isDeleted: false
    });

    if (!friend) {
      return res.status(404).json({
        success: false,
        message: 'Friend not found'
      });
    }

    await friend.removeContact(contactId);

    res.json({
      success: true,
      message: 'Contact removed successfully',
      data: { friend }
    });
  } catch (error) {
    console.error('Remove contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getFriends,
  getFriendById,
  createFriend,
  updateFriend,
  deleteFriend,
  getUpcomingBirthdays,
  getFriendStats,
  updateLastContact,
  addContact,
  removeContact
};
