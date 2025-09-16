require('dotenv').config();
const mongoose = require('mongoose');
const { BillCategory } = require('../models/Bill');
const { NoteType } = require('../models/Note');
const { FoodCategory } = require('../models/Food');
const User = require('../models/User');

const connectDB = require('../config/database');

const billCategories = [
  { name: '餐饮', icon: '🍽️', color: '#FF6B6B' },
  { name: '交通', icon: '🚗', color: '#4ECDC4' },
  { name: '购物', icon: '🛍️', color: '#45B7D1' },
  { name: '娱乐', icon: '🎮', color: '#96CEB4' },
  { name: '医疗', icon: '🏥', color: '#FFEAA7' },
  { name: '教育', icon: '📚', color: '#DDA0DD' },
  { name: '住房', icon: '🏠', color: '#98D8C8' },
  { name: '通讯', icon: '📱', color: '#F7DC6F' },
  { name: '其他', icon: '💼', color: '#85C1E9' }
];

const noteTypes = [
  { name: '工作笔记', icon: '💼', color: '#3498DB' },
  { name: '学习笔记', icon: '📖', color: '#9B59B6' },
  { name: '生活记录', icon: '🏠', color: '#2ECC71' },
  { name: '旅行日记', icon: '✈️', color: '#E74C3C' },
  { name: '想法灵感', icon: '💡', color: '#F39C12' },
  { name: '健康记录', icon: '🏃', color: '#1ABC9C' },
  { name: '财务记录', icon: '💰', color: '#34495E' },
  { name: '其他', icon: '📝', color: '#95A5A6' }
];

const foodCategories = [
  { name: '主食', icon: '🍚', color: '#E67E22' },
  { name: '荤菜', icon: '🥩', color: '#C0392B' },
  { name: '素菜', icon: '🥬', color: '#27AE60' },
  { name: '汤品', icon: '🍲', color: '#3498DB' },
  { name: '小食', icon: '🍪', color: '#F39C12' },
  { name: '饮品', icon: '🥤', color: '#9B59B6' },
  { name: '水果', icon: '🍎', color: '#E74C3C' },
  { name: '甜品', icon: '🍰', color: '#E91E63' },
  { name: '快餐', icon: '🍔', color: '#FF5722' },
  { name: '其他', icon: '🍽️', color: '#607D8B' }
];

// Default admin user
const defaultUser = {
  username: 'admin',
  email: 'admin@daily-app.com',
  password: '123456',
  role: 'admin',
  profile: {
    avatar: '',
    phone: '',
    address: '',
    bio: '系统管理员'
  }
};

const seedData = async () => {
  try {
    console.log('🌱 Starting data seeding...');

    // Connect to database
    await connectDB();

    // Clear existing data (except users for safety)
    await BillCategory.deleteMany({});
    await NoteType.deleteMany({});
    await FoodCategory.deleteMany({});

    // Create default admin user if not exists
    console.log('👤 Creating default admin user...');
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (!existingAdmin) {
      const adminUser = new User(defaultUser);
      await adminUser.save();
      console.log('✅ Created default admin user');
      console.log('📝 Login credentials:');
      console.log('   Username: admin');
      console.log('   Password: 123456');
    } else {
      console.log('ℹ️  Default admin user already exists');
      console.log('📝 Login credentials:');
      console.log('   Username: admin');
      console.log('   Password: 123456');
    }

    // Seed bill categories
    console.log('📊 Seeding bill categories...');
    await BillCategory.insertMany(billCategories);
    console.log(`✅ Created ${billCategories.length} bill categories`);

    // Seed note types
    console.log('📝 Seeding note types...');
    await NoteType.insertMany(noteTypes);
    console.log(`✅ Created ${noteTypes.length} note types`);

    // Seed food categories
    console.log('🍽️ Seeding food categories...');
    await FoodCategory.insertMany(foodCategories);
    console.log(`✅ Created ${foodCategories.length} food categories`);

    console.log('🎉 Data seeding completed successfully!');
    
    // Show summary
    const userCount = await User.countDocuments();
    const billCategoryCount = await BillCategory.countDocuments();
    const noteTypeCount = await NoteType.countDocuments();
    const foodCategoryCount = await FoodCategory.countDocuments();

    console.log('\n📈 Summary:');
    console.log(`Users: ${userCount}`);
    console.log(`Bill Categories: ${billCategoryCount}`);
    console.log(`Note Types: ${noteTypeCount}`);
    console.log(`Food Categories: ${foodCategoryCount}`);
    
    console.log('\n🔑 Default Login Credentials:');
    console.log('Username: admin');
    console.log('Password: 123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;
