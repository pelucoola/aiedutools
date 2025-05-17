import mongoose from 'mongoose';

const TemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '请提供模板名称'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, '请提供模板描述'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, '请选择学科'],
    enum: ['math', 'physics', 'chemistry', 'biology', 'other'],
    default: 'other'
  },
  category: {
    type: String,
    required: [true, '请提供模板类别'],
    trim: true
  },
  templateContent: {
    htmlTemplate: {
      type: String,
      required: [true, '请提供HTML模板']
    },
    cssTemplate: {
      type: String,
      default: ''
    },
    jsTemplate: {
      type: String,
      default: ''
    }
  },
  parameterSchema: {
    type: Map,
    of: {
      type: {
        type: String,
        enum: ['string', 'number', 'boolean', 'array', 'object'],
        required: true
      },
      description: {
        type: String,
        required: true
      },
      default: {
        type: mongoose.Schema.Types.Mixed,
        required: false
      },
      required: {
        type: Boolean,
        default: false
      },
      enum: {
        type: [mongoose.Schema.Types.Mixed],
        required: false
      },
      min: {
        type: Number,
        required: false
      },
      max: {
        type: Number,
        required: false
      }
    },
    default: new Map()
  },
  thumbnail: {
    type: String,
    default: ''
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  aiPromptTemplate: {
    type: String,
    required: false
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// 创建索引
TemplateSchema.index({ subject: 1, category: 1 });
TemplateSchema.index({ tags: 1 });
TemplateSchema.index({ 
  name: 'text', 
  description: 'text', 
  tags: 'text'
});

// 更新使用次数
TemplateSchema.methods.incrementUsage = async function() {
  this.usageCount += 1;
  await this.save();
};

// 静态方法：获取特定学科的热门模板
TemplateSchema.statics.getPopularTemplates = async function(subject, limit = 5) {
  return this.find({ 
    subject, 
    isPublic: true 
  })
  .sort({ usageCount: -1 })
  .limit(limit);
};

const Template = mongoose.model('Template', TemplateSchema);

export default Template;