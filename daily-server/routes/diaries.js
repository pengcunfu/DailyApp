const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const diaryController = require('../controllers/diaryController');
const { auth } = require('../middleware/auth');

// 验证规则
const diaryValidation = [
  body('title').notEmpty().withMessage('标题不能为空').isLength({ max: 200 }).withMessage('标题不能超过200个字符'),
  body('content').notEmpty().withMessage('内容不能为空').isLength({ max: 10000 }).withMessage('内容不能超过10000个字符'),
  body('date').optional().isISO8601().withMessage('日期格式不正确'),
  body('mood').optional().isIn(['very_happy', 'happy', 'normal', 'sad', 'very_sad']).withMessage('心情值无效'),
  body('weather').optional().isLength({ max: 50 }).withMessage('天气描述不能超过50个字符'),
  body('location').optional().isLength({ max: 200 }).withMessage('地点不能超过200个字符'),
  body('images').optional().isArray().withMessage('图片必须是数组'),
  body('tags').optional().isArray().withMessage('标签必须是数组'),
  body('is_private').optional().isBoolean().withMessage('隐私设置必须是布尔值')
];

// 获取日记列表
router.get('/', auth, diaryController.getDiaryList);

// 获取日记统计数据
router.get('/stats', auth, diaryController.getDiaryStats);

// 获取单个日记详情
router.get('/:id', auth, diaryController.getDiaryById);

// 创建日记
router.post('/', auth, diaryValidation, diaryController.createDiary);

// 更新日记
router.put('/:id', auth, diaryValidation, diaryController.updateDiary);

// 删除日记
router.delete('/:id', auth, diaryController.deleteDiary);

module.exports = router;
