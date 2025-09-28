const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const appearanceController = require('../controllers/appearanceController');
const { auth } = require('../middleware/auth');

// 验证规则
const appearanceValidation = [
  body('photo').notEmpty().withMessage('照片不能为空'),
  body('record_date').optional().isISO8601().withMessage('记录日期格式不正确'),
  body('description').optional().isLength({ max: 500 }).withMessage('描述不能超过500个字符'),
  body('weight').optional().isFloat({ min: 0 }).withMessage('体重必须为正数'),
  body('height').optional().isFloat({ min: 0 }).withMessage('身高必须为正数'),
  body('body_fat_rate').optional().isFloat({ min: 0, max: 100 }).withMessage('体脂率必须在0-100之间'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('备注不能超过1000个字符')
];

// 获取形象记录列表
router.get('/', auth, appearanceController.getAppearanceList);

// 获取形象统计数据
router.get('/stats', auth, appearanceController.getAppearanceStats);

// 获取单个形象记录详情
router.get('/:id', auth, appearanceController.getAppearanceById);

// 创建形象记录
router.post('/', auth, appearanceValidation, appearanceController.createAppearance);

// 更新形象记录
router.put('/:id', auth, appearanceValidation, appearanceController.updateAppearance);

// 删除形象记录
router.delete('/:id', auth, appearanceController.deleteAppearance);

module.exports = router;
