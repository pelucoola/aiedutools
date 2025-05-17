import Template from '../models/Template.js';
import mongoose from 'mongoose';

// @desc    获取所有模板
// @route   GET /api/templates
// @access  Private
export const getTemplates = async (req, res) => {
  try {
    const { subject, category, page = 1, limit = 10 } = req.query;
    
    // 构建查询条件
    const query = {
      $or: [
        { isSystem: true },
        { isPublic: true },
        { creator: req.user.id }
      ]
    };
    
    if (subject) query.subject = subject;
    if (category) query.category = category;
    
    // 分页
    const skip = (page - 1) * limit;
    
    // 执行查询
    const templates = await Template.find(query)
      .sort({ usageCount: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-templateContent.htmlTemplate -templateContent.cssTemplate -templateContent.jsTemplate'); // 不返回模板详情，减少数据量
    
    // 获取总数
    const total = await Template.countDocuments(query);
    
    res.json({
      success: true,
      count: templates.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      templates
    });
  } catch (error) {
    console.error('获取模板列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

// @desc    获取单个模板详情
// @route   GET /api/templates/:id
// @access  Private
export const getTemplateById = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: '模板不存在'
      });
    }
    
    // 检查权限：系统模板、公开模板或用户自己的模板可以访问
    if (!template.isSystem && !template.isPublic && template.creator?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '没有权限访问此模板'
      });
    }
    
    res.json({
      success: true,
      template
    });
  } catch (error) {
    console.error('获取模板详情错误:', error);
    
    // 检查是否是无效的ID格式
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        success: false,
        message: '无效的模板ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

// @desc    创建新模板
// @route   POST /api/templates
// @access  Private
export const createTemplate = async (req, res) => {
  try {
    const {
      name,
      description,
      subject,
      category,
      templateContent,
      parameterSchema,
      thumbnail,
      isPublic,
      tags,
      aiPromptTemplate
    } = req.body;

    // 检查模板名称是否已存在
    const existingTemplate = await Template.findOne({ name });
    if (existingTemplate) {
      return res.status(400).json({
        success: false,
        message: '模板名称已存在'
      });
    }

    // 创建模板
    const newTemplate = await Template.create({
      name,
      description,
      subject,
      category,
      templateContent,
      parameterSchema: parameterSchema || {},
      thumbnail,
      creator: req.user.id,
      isSystem: false, // 用户创建的模板不是系统模板
      isPublic: isPublic || false,
      tags: tags || [],
      aiPromptTemplate
    });

    res.status(201).json({
      success: true,
      template: newTemplate
    });
  } catch (error) {
    console.error('创建模板错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

// @desc    更新模板
// @route   PUT /api/templates/:id
// @access  Private
export const updateTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: '模板不存在'
      });
    }
    
    // 检查权限：只有创建者可以更新，系统模板不能更新
    if (template.isSystem || template.creator?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '没有权限更新此模板'
      });
    }
    
    const {
      name,
      description,
      subject,
      category,
      templateContent,
      parameterSchema,
      thumbnail,
      isPublic,
      tags,
      aiPromptTemplate
    } = req.body;
    
    // 如果更改了名称，检查是否与其他模板冲突
    if (name && name !== template.name) {
      const existingTemplate = await Template.findOne({ name });
      if (existingTemplate) {
        return res.status(400).json({
          success: false,
          message: '模板名称已存在'
        });
      }
    }
    
    // 更新字段
    if (name) template.name = name;
    if (description) template.description = description;
    if (subject) template.subject = subject;
    if (category) template.category = category;
    if (templateContent) template.templateContent = templateContent;
    if (parameterSchema) template.parameterSchema = parameterSchema;
    if (thumbnail) template.thumbnail = thumbnail;
    if (isPublic !== undefined) template.isPublic = isPublic;
    if (tags) template.tags = tags;
    if (aiPromptTemplate) template.aiPromptTemplate = aiPromptTemplate;
    
    // 更新版本号
    template.version += 1;
    
    const updatedTemplate = await template.save();
    
    res.json({
      success: true,
      template: updatedTemplate
    });
  } catch (error) {
    console.error('更新模板错误:', error);
    
    // 检查是否是无效的ID格式
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        success: false,
        message: '无效的模板ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

// @desc    删除模板
// @route   DELETE /api/templates/:id
// @access  Private
export const deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: '模板不存在'
      });
    }
    
    // 检查权限：只有创建者可以删除，系统模板不能删除
    if (template.isSystem || template.creator?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '没有权限删除此模板'
      });
    }
    
    await template.remove();
    
    res.json({
      success: true,
      message: '模板已删除',
      templateId: req.params.id
    });
  } catch (error) {
    console.error('删除模板错误:', error);
    
    // 检查是否是无效的ID格式
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        success: false,
        message: '无效的模板ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

// @desc    获取热门模板
// @route   GET /api/templates/popular
// @access  Private
export const getPopularTemplates = async (req, res) => {
  try {
    const { subject, limit = 5 } = req.query;
    
    const query = {
      $or: [
        { isSystem: true },
        { isPublic: true }
      ]
    };
    
    if (subject) query.subject = subject;
    
    const templates = await Template.find(query)
      .sort({ usageCount: -1 })
      .limit(parseInt(limit))
      .select('name description subject category thumbnail usageCount');
    
    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('获取热门模板错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

// @desc    搜索模板
// @route   GET /api/templates/search
// @access  Private
export const searchTemplates = async (req, res) => {
  try {
    const { query, subject, category, page = 1, limit = 10 } = req.query;
    
    // 构建查询条件
    const searchQuery = {
      $and: [
        {
          $or: [
            { isSystem: true },
            { isPublic: true },
            { creator: req.user.id }
          ]
        },
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { tags: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    };
    
    if (subject) {
      searchQuery.$and.push({ subject });
    }
    
    if (category) {
      searchQuery.$and.push({ category });
    }
    
    // 分页
    const skip = (page - 1) * limit;
    
    // 执行查询
    const templates = await Template.find(searchQuery)
      .sort({ usageCount: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-templateContent.htmlTemplate -templateContent.cssTemplate -templateContent.jsTemplate');
    
    // 获取总数
    const total = await Template.countDocuments(searchQuery);
    
    res.json({
      success: true,
      count: templates.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      templates
    });
  } catch (error) {
    console.error('搜索模板错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};