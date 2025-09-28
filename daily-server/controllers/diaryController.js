const Diary = require('../models/Diary');
const { validationResult } = require('express-validator');

// 获取日记列表
exports.getDiaryList = async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword, mood, startDate, endDate } = req.query;
    const userId = req.user.id;
    
    // 构建查询条件
    const query = { user_id: userId };
    
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { content: { $regex: keyword, $options: 'i' } },
        { tags: { $in: [new RegExp(keyword, 'i')] } }
      ];
    }
    
    if (mood) {
      query.mood = mood;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    // 分页查询
    const skip = (page - 1) * limit;
    const diaries = await Diary.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-content'); // 列表不返回完整内容
      
    const total = await Diary.countDocuments(query);
    
    res.json({
      success: true,
      data: diaries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取日记列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取日记列表失败'
    });
  }
};

// 获取单个日记详情
exports.getDiaryById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const diary = await Diary.findOne({ 
      _id: id, 
      user_id: userId 
    });
    
    if (!diary) {
      return res.status(404).json({
        success: false,
        message: '日记不存在'
      });
    }
    
    res.json({
      success: true,
      data: diary
    });
  } catch (error) {
    console.error('获取日记详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取日记详情失败'
    });
  }
};

// 创建日记
exports.createDiary = async (req, res) => {
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
      title,
      content,
      date,
      mood,
      weather,
      location,
      images,
      tags,
      is_private
    } = req.body;
    
    const diary = new Diary({
      user_id: userId,
      title,
      content,
      date: date || new Date(),
      mood,
      weather,
      location,
      images: images || [],
      tags: tags || [],
      is_private: is_private !== undefined ? is_private : true
    });
    
    await diary.save();
    
    res.status(201).json({
      success: true,
      data: diary,
      message: '日记创建成功'
    });
  } catch (error) {
    console.error('创建日记失败:', error);
    res.status(500).json({
      success: false,
      message: '创建日记失败'
    });
  }
};

// 更新日记
exports.updateDiary = async (req, res) => {
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
    
    const diary = await Diary.findOneAndUpdate(
      { _id: id, user_id: userId },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!diary) {
      return res.status(404).json({
        success: false,
        message: '日记不存在'
      });
    }
    
    res.json({
      success: true,
      data: diary,
      message: '日记更新成功'
    });
  } catch (error) {
    console.error('更新日记失败:', error);
    res.status(500).json({
      success: false,
      message: '更新日记失败'
    });
  }
};

// 删除日记
exports.deleteDiary = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const diary = await Diary.findOneAndDelete({ 
      _id: id, 
      user_id: userId 
    });
    
    if (!diary) {
      return res.status(404).json({
        success: false,
        message: '日记不存在'
      });
    }
    
    res.json({
      success: true,
      message: '日记删除成功'
    });
  } catch (error) {
    console.error('删除日记失败:', error);
    res.status(500).json({
      success: false,
      message: '删除日记失败'
    });
  }
};

// 获取日记统计数据
exports.getDiaryStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 获取总日记数
    const totalDiaries = await Diary.countDocuments({ user_id: userId });
    
    // 获取本月日记数
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const monthlyDiaries = await Diary.countDocuments({
      user_id: userId,
      date: {
        $gte: currentMonth,
        $lt: nextMonth
      }
    });
    
    // 获取心情统计
    const moodStats = await Diary.aggregate([
      { $match: { user_id: userId } },
      { $group: { _id: '$mood', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // 获取标签统计
    const tagStats = await Diary.aggregate([
      { $match: { user_id: userId } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // 获取最近的日记
    const recentDiary = await Diary.findOne({ user_id: userId })
      .sort({ date: -1 })
      .select('title date mood');
    
    res.json({
      success: true,
      data: {
        totalDiaries,
        monthlyDiaries,
        moodStats,
        tagStats,
        recentDiary
      }
    });
  } catch (error) {
    console.error('获取日记统计数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取日记统计数据失败'
    });
  }
};
