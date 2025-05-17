import { Configuration, OpenAIApi } from 'openai';
import BaseAIService from './BaseAIService.js';

export default class OpenAIService extends BaseAIService {
  requiredConfig = ['apiKey'];
  
  constructor(config) {
    super(config);
    this.validateConfig(config);
    
    const configuration = new Configuration({
      apiKey: this.config.apiKey,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async generateContent(prompt, options = {}) {
    try {
      const completion = await this.openai.createChatCompletion({
        model: options.model || "gpt-3.5-turbo",
        messages: [
          { role: "system", content: options.systemPrompt || "你是一个专业的内容生成助手" },
          { role: "user", content: prompt }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000
      });

      return {
        success: true,
        content: completion.data.choices[0].message.content,
        usage: completion.data.usage
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async optimizeContent(originalContent, feedback, options = {}) {
    const prompt = `原始内容: ${JSON.stringify(originalContent)}\n用户反馈: ${feedback}\n请优化内容:`;
    return this.generateContent(prompt, options);
  }

  async getSuggestions(topic, options = {}) {
    const prompt = `关于主题: ${topic}\n请提供教学建议:`;
    return this.generateContent(prompt, options);
  }
}