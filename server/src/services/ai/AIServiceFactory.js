import OpenAIService from './OpenAIService.js';
import TencentAIService from './TencentAIService.js';
import VolcanoAIService from './VolcanoAIService.js';

export default class AIServiceFactory {
  static createService(provider, config) {
    switch (provider.toLowerCase()) {
      case 'openai':
        return new OpenAIService(config);
      case 'tencent':
        return new TencentAIService(config);
      case 'volcano':
        return new VolcanoAIService(config);
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }

  static getAvailableProviders() {
    return [
      { id: 'openai', name: 'OpenAI' },
      { id: 'tencent', name: '腾讯云元宝' },
      { id: 'volcano', name: '火山引擎豆包' }
    ];
  }
}