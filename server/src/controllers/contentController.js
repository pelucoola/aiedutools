import Content from '../models/Content.js';
import Template from '../models/Template.js';
import mongoose from 'mongoose';

// @desc    创建新内容
// @route   POST /api/content
// @access  Private
export const createContent = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      knowledgePoint,
      content,
      visualizationParams,
      templateId,
      isPublic,
      tags,
      generationPrompt,
      aiModel,
      generationParams
    } = req.body;

    // 创建内容
    const newContent = await Content.create({
      title,
      description,
      subject,
      knowledgePoint,
      content,
      visualizationParams: visualizationParams || {},
      templateId: templateId || null,
      creator: req.user.id,
      isPublic: isPublic || false,
      tags: tags || [],
      generationPrompt,
      aiModel,
      generationParams: generationParams || {}
    });

    // 如果使用了模板，更新模板使用次数
    if (templateId) {
      const template = await Template.findById(templateId);
      if (template) {
        await template.incrementUsage();
      }
    }

    res.status(201).json({
      success: true,
      content: newContent
    });
  } catch (error) {
    console.error('创建内容错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

// @desc    获取所有内容（用户自己的）
// @route   GET /api/content
// @access  Private
export const getContents = async (req, res) => {
  try {
    const { subject, status, sort, page = 1, limit = 10 } = req.query;
    
    // 构建查询条件
    const query = { creator: req.user.id };
    
    if (subject) query.subject = subject;
    if (status) query.status = status;
    
    // 构建排序条件
    let sortOption = { createdAt: -1 }; // 默认按创建时间降序
    
    if (sort === 'views') {
      sortOption = { 'stats.views': -1 };
    } else if (sort === 'title') {
      sortOption = { title: 1 };
    } else if (sort === 'updated') {
      sortOption = { updatedAt: -1 };
    }
    
    // 分页
    const skip = (page - 1) * limit;
    
    // 执行查询
    const contents = await Content.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-content.html -content.css -content.javascript'); // 不返回内容详情，减少数据量
    
    // 获取总数
    const total = await Content.countDocuments(query);
    
    res.json({
      success: true,
      count: contents.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      contents
    });
  } catch (error) {
    console.error('获取内容列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

// @desc    获取单个内容详情
// @route   GET /api/content/:id
// @access  Private
export const getContentById = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: '内容不存在'
      });
    }
    
    // 检查权限：只有创建者或公开内容可以访问
    if (content.creator.toString() !== req.user.id && !content.isPublic) {
      return res.status(403).json({
        success: false,
        message: '没有权限访问此内容'
      });
    }
    
    // 更新查看次数
    await content.incrementViews();
    
    res.json({
      success: true,
      content
    });
  } catch (error) {
    console.error('获取内容详情错误:', error);
    
    // 检查是否是无效的ID格式
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        success: false,
        message: '无效的内容ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

// @desc    更新内容
// @route   PUT /api/content/:id
// @access  Private
export const updateContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: '内容不存在'
      });
    }
    
    // 检查权限：只有创建者可以更新
    if (content.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '没有权限更新此内容'
      });
    }
    
    const {
      title,
      description,
      subject,
      knowledgePoint,
      content: contentData,
      visualizationParams,
      isPublic,
      tags,
      status
    } = req.body;
    
    // 更新字段
    if (title) content.title = title;
    if (description) content.description = description;
    if (subject) content.subject = subject;
    if (knowledgePoint) content.knowledgePoint = knowledgePoint;
    if (contentData) content.content = contentData;
    if (visualizationParams) content.visualizationParams = visualizationParams;
    if (isPublic !== undefined) content.isPublic = isPublic;
    if (tags) content.tags = tags;
    if (status) content.status = status;
    
    // 更新版本号
    content.version += 1;
    
    const updatedContent = await content.save();
    
    res.json({
      success: true,
      content: updatedContent
    });
  } catch (error) {
    console.error('更新内容错误:', error);
    
    // 检查是否是无效的ID格式
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        success: false,
        message: '无效的内容ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

// @desc    删除内容
// @route   DELETE /api/content/:id
// @access  Private
export const deleteContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: '内容不存在'
      });
    }
    
    // 检查权限：只有创建者可以删除
    if (content.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '没有权限删除此内容'
      });
    }
    
    await content.remove();
    
    res.json({
      success: true,
      message: '内容已删除',
      contentId: req.params.id
    });
  } catch (error) {
    console.error('删除内容错误:', error);
    
    // 检查是否是无效的ID格式
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        success: false,
        message: '无效的内容ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

// @desc    搜索内容
// @route   GET /api/content/search
// @access  Private
export const searchContents = async (req, res) => {
  try {
    const { query, subject, page = 1, limit = 10 } = req.query;
    
    // 构建查询条件
    const searchQuery = {
      $and: [
        { creator: req.user.id }, // 只搜索用户自己的内容
        {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { knowledgePoint: { $regex: query, $options: 'i' } },
            { tags: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    };
    
    if (subject) {
      searchQuery.$and.push({ subject });
    }
    
    // 分页
    const skip = (page - 1) * limit;
    
    // 执行查询
    const contents = await Content.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-content.html -content.css -content.javascript');
    
    // 获取总数
    const total = await Content.countDocuments(searchQuery);
    
    res.json({
      success: true,
      count: contents.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      contents
    });
  } catch (error) {
    console.error('搜索内容错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

// @desc    获取内容统计
// @route   GET /api/content/stats
// @access  Private
export const getContentStats = async (req, res) => {
  try {
    // 获取用户内容总数
    const totalContents = await Content.countDocuments({ creator: req.user.id });
    
    // 获取各学科内容数量
    const subjectStats = await Content.aggregate([
      { $match: { creator: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: '$subject', count: { $sum: 1 } } }
    ]);
    
    // 获取总浏览量
    const viewsStats = await Content.aggregate([
      { $match: { creator: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: null, totalViews: { $sum: '$stats.views' } } }
    ]);
    
    // 获取最近创建的内容
    const recentContents = await Content.find({ creator: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title subject createdAt stats.views');
    
    // 获取最受欢迎的内容
    const popularContents = await Content.find({ creator: req.user.id })
      .sort({ 'stats.views': -1 })
      .limit(5)
      .select('title subject createdAt stats.views');
    
    res.json({
      success: true,
      stats: {
        totalContents,
        subjectStats,
        totalViews: viewsStats.length > 0 ? viewsStats[0].totalViews : 0,
        recentContents,
        popularContents
      }
    });
  } catch (error) {
    console.error('获取内容统计错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};