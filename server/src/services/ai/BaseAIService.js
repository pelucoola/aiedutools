export default class BaseAIService {
  constructor(config) {
    this.config = config;
  }

  async generateContent(prompt, options = {}) {
    throw new Error('Not implemented');
  }

  async optimizeContent(originalContent, feedback, options = {}) {
    throw new Error('Not implemented');
  }

  async getSuggestions(topic, options = {}) {
    throw new Error('Not implemented');
  }

  validateConfig(config) {
    if (!this.requiredConfig) return true;
    const missingFields = this.requiredConfig.filter(
      field => !config[field]
    );
    if (missingFields.length > 0) {
      throw new Error(`Missing required config fields: ${missingFields.join(', ')}`);
    }
    return true;
  }
}