import AIServiceFactory from '../services/ai/AIServiceFactory.js';
import Template from '../models/Template.js';
import Content from '../models/Content.js';

// 获取AI服务配置
const getAIServiceConfig = (provider) => {
  switch (provider) {
    case 'openai':
      return { apiKey: process.env.OPENAI_API_KEY };
    case 'tencent':
      return {
        secretId: process.env.TENCENT_SECRET_ID,
        secretKey: process.env.TENCENT_SECRET_KEY,
        region: process.env.TENCENT_REGION || 'ap-beijing'
      };
    case 'volcano':
      return {
        accessKey: process.env.VOLCANO_ACCESS_KEY,
        secretKey: process.env.VOLCANO_SECRET_KEY
      };
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
};

// 生成系统提示
const generateSystemPrompt = (subject) => {
  const prompts = {
    math: `你是一个专业的数学教育内容生成器。你需要生成易于理解的数学概念可视化内容，包括：
    1. 清晰的步骤分解
    2. 直观的图形展示
    3. 交互式的参数调整
    4. 适合课堂教学的演示方式`,
    physics: `你是一个专业的物理教育内容生成器。你需要生成生动的物理实验和现象演示，包括：
    1. 物理实验模拟
    2. 力学原理动画
    3. 可调节的实验参数
    4. 实时数据展示`,
    chemistry: `你是一个专业的化学教育内容生成器。你需要生成化学反应和分子结构的可视化内容，包括：
    1. 化学反应动画
    2. 分子3D结构展示
    3. 元素周期表交互
    4. 反应条件模拟`,
    biology: `你是一个专业的生物教育内容生成器。你需要生成生物结构和过程的可视化内容，包括：
    1. 细胞结构展示
    2. 生命过程动画
    3. 生态系统模拟
    4. 解剖结构展示`
  };

  return prompts[subject] || prompts.math;
};

// 生成教学内容
export async function generateContent(req, res) {
  try {
    const {
      subject,
      knowledgePoint,
      templateId,
      additionalInstructions,
      aiProvider = 'openai', // 默认使用OpenAI
      model,
      temperature,
      maxTokens
    } = req.body;

    // 验证必要参数
    if (!subject || !knowledgePoint) {
      return res.status(400).json({
        success: false,
        message: '请提供学科和知识点'
      });
    }

    // 获取AI服务
    const aiConfig = getAIServiceConfig(aiProvider);
    const aiService = AIServiceFactory.createService(aiProvider, aiConfig);

    // 获取模板（如果指定了模板ID）
    let template = null;
    if (templateId) {
      template = await Template.findById(templateId);
      if (!template) {
        return res.status(404).json({
          success: false,
          message: '指定的模板不存在'
        });
      }
    }

    // 构建提示信息
    const systemPrompt = generateSystemPrompt(subject);
    const userPrompt = `
    知识点：${knowledgePoint}
    ${additionalInstructions ? `额外要求：${additionalInstructions}` : ''}
    ${template ? `使用模板：${template.name}` : ''}
    
    请生成包含以下内容的JSON响应：
    1. HTML结构（包含必要的容器和元素）
    2. CSS样式（确保响应式设计）
    3. JavaScript代码（包含交互逻辑和可视化实现）
    4. 可配置的参数列表
    5. 分步教学说明
    `;

    // 调用AI服务
    const generationOptions = {
      model: model || undefined,
      temperature: temperature || undefined,
      maxTokens: maxTokens || undefined,
      systemPrompt
    };

    const aiResponse = await aiService.generateContent(userPrompt, generationOptions);

    if (!aiResponse.success) {
      return res.status(500).json({
        success: false,
        message: 'AI服务调用失败',
        error: aiResponse.error
      });
    }

    // 解析AI响应
    let generatedContent;
    try {
      generatedContent = JSON.parse(aiResponse.content);
    } catch (error) {
      console.error('AI响应解析错误:', error);
      return res.status(500).json({
        success: false,
        message: 'AI响应解析失败',
        error: error.message
      });
    }

    // 如果使用模板，应用模板转换
    if (template) {
      generatedContent = await applyTemplate(generatedContent, template);
    }

    // 创建新的内容记录
    const content = await Content.create({
      title: `${subject} - ${knowledgePoint}`,
      description: `基于AI生成的${subject}学科教学内容：${knowledgePoint}`,
      subject,
      knowledgePoint,
      content: {
        html: generatedContent.html,
        css: generatedContent.css,
        javascript: generatedContent.javascript
      },
      visualizationParams: generatedContent.parameters || {},
      templateId: template?._id,
      creator: req.user.id,
      generationPrompt: userPrompt,
      aiProvider,
      aiModel: model || 'default',
      generationParams: {
        temperature: temperature || 0.7,
        maxTokens: maxTokens || 2000
      }
    });

    res.status(201).json({
      success: true,
      content
    });

  } catch (error) {
    console.error('生成内容错误:', error);
    res.status(500).json({
      success: false,
      message: '内容生成失败',
      error: error.message
    });
  }
}

// 获取可用的AI服务提供商
export async function getAIProviders(req, res) {
  try {
    const providers = AIServiceFactory.getAvailableProviders();
    res.json({
      success: true,
      providers
    });
  } catch (error) {
    console.error('获取AI提供商错误:', error);
    res.status(500).json({
      success: false,
      message: '获取AI提供商失败',
      error: error.message
    });
  }
}

// 辅助函数：应用模板转换
async function applyTemplate(generatedContent, template) {
  try {
    // 替换模板中的占位符
    let html = template.templateContent.htmlTemplate;
    let css = template.templateContent.cssTemplate;
    let js = template.templateContent.jsTemplate;

    // 使用生成的内容填充模板
    html = html.replace('{{content}}', generatedContent.html);
    css = css.replace('{{styles}}', generatedContent.css);
    js = js.replace('{{script}}', generatedContent.javascript);

    return {
      html,
      css,
      javascript: js,
      parameters: {
        ...template.parameterSchema,
        ...generatedContent.parameters
      }
    };
  } catch (error) {
    console.error('模板应用错误:', error);
    throw new Error('模板应用失败: ' + error.message);
  }
}