const mongoose = require('mongoose');

const friendContactSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['phone', 'qq', 'wechat', 'email'],
    required: true
  },
  value: {
    type: String,
    required: true,
    trim: true
  },
  label: {
    type: String,
    trim: true,
    default: ''
  },
  isPrimary: {
    type: Boolean,
    default: false
  }
});

const friendSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  nickname: {
    type: String,
    trim: true,
    maxlength: 50,
    default: ''
  },
  sex: {
    type: Number,
    enum: [1, 2], // 1: 男, 2: 女
    default: 1
  },
  birthDate: {
    type: Date
  },
  birthType: {
    type: Number,
    enum: [1, 2], // 1: 农历, 2: 公历
    default: 2
  },
  avatar: {
    type: String,
    default: ''
  },
  contacts: [friendContactSchema],
  liveAddress: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ''
  },
  homeAddress: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ''
  },
  school: {
    type: String,
    trim: true,
    maxlength: 100,
    default: ''
  },
  profession: {
    type: String,
    trim: true,
    maxlength: 100,
    default: ''
  },
  disposition: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ''
  },
  hobbies: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  remark: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: ''
  },
  advantages: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  disadvantages: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  relationship: {
    type: String,
    enum: ['family', 'friend', 'colleague', 'classmate', 'other'],
    default: 'friend'
  },
  importance: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  lastContactDate: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
friendSchema.index({ userId: 1, isDeleted: 1 });
friendSchema.index({ userId: 1, relationship: 1 });
friendSchema.index({ name: 'text', nickname: 'text' });
friendSchema.index({ 'contacts.value': 1 });

// Calculate age method
friendSchema.methods.getAge = function() {
  if (!this.birthDate) return null;
  
  const today = new Date();
  const birthDate = new Date(this.birthDate);
  let age = today.getFullYear() - birthDate.getFullYear();
  
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Get primary contact method
friendSchema.methods.getPrimaryContact = function(type) {
  const contact = this.contacts.find(c => c.type === type && c.isPrimary);
  return contact ? contact.value : null;
};

// Add contact method
friendSchema.methods.addContact = function(type, value, label = '', isPrimary = false) {
  // If setting as primary, unset other primary contacts of the same type
  if (isPrimary) {
    this.contacts.forEach(contact => {
      if (contact.type === type) {
        contact.isPrimary = false;
      }
    });
  }
  
  this.contacts.push({ type, value, label, isPrimary });
  return this.save();
};

// Remove contact method
friendSchema.methods.removeContact = function(contactId) {
  this.contacts = this.contacts.filter(contact => !contact._id.equals(contactId));
  return this.save();
};

// Update last contact date
friendSchema.methods.updateLastContact = function() {
  this.lastContactDate = new Date();
  return this.save();
};

// Soft delete method
friendSchema.methods.softDelete = function() {
  this.isDeleted = true;
  return this.save();
};

// Add tag method
friendSchema.methods.addTag = function(tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
  }
  return this.save();
};

// Remove tag method
friendSchema.methods.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
  return this.save();
};

// Static method to search friends
friendSchema.statics.searchFriends = async function(userId, query, filters = {}) {
  const searchConditions = {
    userId: new mongoose.Types.ObjectId(userId),
    isDeleted: false,
    ...filters
  };

  if (query) {
    searchConditions.$or = [
      { name: { $regex: query, $options: 'i' } },
      { nickname: { $regex: query, $options: 'i' } },
      { 'contacts.value': { $regex: query, $options: 'i' } }
    ];
  }

  const friends = await this.find(searchConditions)
    .sort({ importance: -1, name: 1 })
    .limit(50);

  return friends;
};

// Static method to get upcoming birthdays
friendSchema.statics.getUpcomingBirthdays = async function(userId, days = 30) {
  const today = new Date();
  const endDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
  
  const friends = await this.find({
    userId: new mongoose.Types.ObjectId(userId),
    isDeleted: false,
    birthDate: { $exists: true }
  });

  const upcomingBirthdays = friends.filter(friend => {
    const birthDate = new Date(friend.birthDate);
    const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    
    if (thisYearBirthday < today) {
      thisYearBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    return thisYearBirthday >= today && thisYearBirthday <= endDate;
  });

  return upcomingBirthdays.sort((a, b) => {
    const aBirthDate = new Date(today.getFullYear(), new Date(a.birthDate).getMonth(), new Date(a.birthDate).getDate());
    const bBirthDate = new Date(today.getFullYear(), new Date(b.birthDate).getMonth(), new Date(b.birthDate).getDate());
    return aBirthDate - bBirthDate;
  });
};

// Static method to get friend statistics
friendSchema.statics.getFriendStats = async function(userId) {
  const stats = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        isDeleted: false
      }
    },
    {
      $group: {
        _id: '$relationship',
        count: { $sum: 1 },
        avgImportance: { $avg: '$importance' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  const totalFriends = await this.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    isDeleted: false
  });

  return {
    total: totalFriends,
    byRelationship: stats
  };
};

module.exports = mongoose.model('Friend', friendSchema);
