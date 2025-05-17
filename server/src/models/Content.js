import mongoose from 'mongoose';

const ContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '请提供内容标题'],
    trim: true,
    maxlength: [100, '标题不能超过100个字符']
  },
  description: {
    type: String,
    required: [true, '请提供内容描述'],
    trim: true,
    maxlength: [500, '描述不能超过500个字符']
  },
  subject: {
    type: String,
    required: [true, '请选择学科'],
    enum: ['math', 'physics', 'chemistry', 'biology', 'other'],
    default: 'other'
  },
  knowledgePoint: {
    type: String,
    required: [true, '请提供知识点'],
    trim: true
  },
  content: {
    html: {
      type: String,
      required: [true, '请提供HTML内容']
    },
    css: {
      type: String,
      default: ''
    },
    javascript: {
      type: String,
      default: ''
    }
  },
  visualizationParams: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: false
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '请提供创建者信息']
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  stats: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    lastViewed: {
      type: Date,
      default: Date.now
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  version: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  generationPrompt: {
    type: String,
    required: [true, '请提供生成提示'],
    trim: true
  },
  aiModel: {
    type: String,
    required: [true, '请提供使用的AI模型'],
    default: 'gpt-3.5-turbo'
  },
  generationParams: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 虚拟字段：创建时间的格式化
ContentSchema.virtual('createdAtFormatted').get(function() {
  return new Date(this.createdAt).toLocaleString();
});

// 更新查看次数
ContentSchema.methods.incrementViews = async function() {
  this.stats.views += 1;
  this.stats.lastViewed = Date.now();
  await this.save();
};

// 创建索引
ContentSchema.index({ creator: 1, createdAt: -1 });
ContentSchema.index({ subject: 1 });
ContentSchema.index({ tags: 1 });
ContentSchema.index({ 
  title: 'text', 
  description: 'text', 
  knowledgePoint: 'text',
  tags: 'text'
});

// 中间件：保存前的处理
ContentSchema.pre('save', function(next) {
  // 如果是新内容，确保版本号为1
  if (this.isNew) {
    this.version = 1;
  }
  next();
});

// 静态方法：获取用户的内容统计
ContentSchema.statics.getContentStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { creator: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalContents: { $sum: 1 },
        totalViews: { $sum: '$stats.views' },
        totalLikes: { $sum: '$stats.likes' },
        totalShares: { $sum: '$stats.shares' },
        subjects: { $addToSet: '$subject' }
      }
    }
  ]);

  return stats[0] || {
    totalContents: 0,
    totalViews: 0,
    totalLikes: 0,
    totalShares: 0,
    subjects: []
  };
};

const Content = mongoose.model('Content', ContentSchema);

export default Content;