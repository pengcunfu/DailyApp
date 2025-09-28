const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const billRoutes = require('./bills');
const todoRoutes = require('./todos');
const noteRoutes = require('./notes');
const foodRoutes = require('./foods');
const friendRoutes = require('./friends');
const appearanceRoutes = require('./appearances');
const diaryRoutes = require('./diaries');

// Mount routes
router.use('/auth', authRoutes);
router.use('/bills', billRoutes);
router.use('/todos', todoRoutes);
router.use('/notes', noteRoutes);
router.use('/foods', foodRoutes);
router.use('/friends', friendRoutes);
router.use('/appearances', appearanceRoutes);
router.use('/diaries', diaryRoutes);

// API health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Daily App API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API info
router.get('/', (req, res) => {
  res.json({
    name: 'Daily App API',
    version: '1.0.0',
    description: 'Express.js API with MongoDB for daily life management',
    endpoints: {
      auth: '/api/auth',
      bills: '/api/bills',
      todos: '/api/todos',
      notes: '/api/notes',
      foods: '/api/foods',
      friends: '/api/friends',
      appearances: '/api/appearances',
      diaries: '/api/diaries'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
