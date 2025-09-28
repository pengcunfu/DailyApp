const Appearance = require('../models/Appearance');
const { validationResult } = require('express-validator');

// 获取形象记录列表
exports.getAppearanceList = async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword } = req.query;
    const userId = req.user.id;
    
    // 构建查询条件
    const query = { user_id: userId };
    if (keyword) {
      query.$or = [
        { description: { $regex: keyword, $options: 'i' } },
        { notes: { $regex: keyword, $options: 'i' } }
      ];
    }
    
    // 分页查询
    const skip = (page - 1) * limit;
    const appearances = await Appearance.find(query)
      .sort({ record_date: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await Appearance.countDocuments(query);
    
    res.json({
      success: true,
      data: appearances,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取形象记录列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取形象记录列表失败'
    });
  }
};

// 获取形象统计数据
exports.getAppearanceStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 获取总记录数
    const totalRecords = await Appearance.countDocuments({ user_id: userId });
    
    // 获取最近的记录
    const latestRecord = await Appearance.findOne({ user_id: userId })
      .sort({ record_date: -1 });
    
    // 获取体重变化趋势（最近10条记录）
    const weightTrend = await Appearance.find({ 
      user_id: userId, 
      weight: { $exists: true, $ne: null } 
    })
      .sort({ record_date: -1 })
      .limit(10)
      .select('weight record_date');
    
    res.json({
      success: true,
      data: {
        totalRecords,
        latestRecord,
        weightTrend: weightTrend.reverse() // 按时间正序排列
      }
    });
  } catch (error) {
    console.error('获取形象统计数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取形象统计数据失败'
    });
  }
};

// 获取单个形象记录详情
exports.getAppearanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const appearance = await Appearance.findOne({ 
      _id: id, 
      user_id: userId 
    });
    
    if (!appearance) {
      return res.status(404).json({
        success: false,
        message: '形象记录不存在'
      });
    }
    
    res.json({
      success: true,
      data: appearance
    });
  } catch (error) {
    console.error('获取形象记录详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取形象记录详情失败'
    });
  }
};

// 创建形象记录
exports.createAppearance = async (req, res) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        errors: errors.array()
      });
    }
    
    const userId = req.user.id;
    const {
      photo,
      record_date,
      description,
      weight,
      height,
      body_fat_rate,
      notes
    } = req.body;
    
    const appearance = new Appearance({
      user_id: userId,
      photo,
      record_date: record_date || new Date(),
      description,
      weight,
      height,
      body_fat_rate,
      notes
    });
    
    await appearance.save();
    
    res.status(201).json({
      success: true,
      data: appearance,
      message: '形象记录创建成功'
    });
  } catch (error) {
    console.error('创建形象记录失败:', error);
    res.status(500).json({
      success: false,
      message: '创建形象记录失败'
    });
  }
};

// 更新形象记录
exports.updateAppearance = async (req, res) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;
    
    const appearance = await Appearance.findOneAndUpdate(
      { _id: id, user_id: userId },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!appearance) {
      return res.status(404).json({
        success: false,
        message: '形象记录不存在'
      });
    }
    
    res.json({
      success: true,
      data: appearance,
      message: '形象记录更新成功'
    });
  } catch (error) {
    console.error('更新形象记录失败:', error);
    res.status(500).json({
      success: false,
      message: '更新形象记录失败'
    });
  }
};

// 删除形象记录
exports.deleteAppearance = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const appearance = await Appearance.findOneAndDelete({ 
      _id: id, 
      user_id: userId 
    });
    
    if (!appearance) {
      return res.status(404).json({
        success: false,
        message: '形象记录不存在'
      });
    }
    
    res.json({
      success: true,
      message: '形象记录删除成功'
    });
  } catch (error) {
    console.error('删除形象记录失败:', error);
    res.status(500).json({
      success: false,
      message: '删除形象记录失败'
    });
  }
};