import { BaseProcessor } from './baseProcessor';

class AIBotProcessor extends BaseProcessor {
  constructor() {
    super();
    this.baseEndpoint = `${process.env.REACT_APP_AI_PATH}`;
  }

  async sendInquiry(message, topK = 5) {
    return await this.makeRequest('post', `${this.baseEndpoint}/inquiry`, {
      query: message,
      top_k: topK
    });
  }
}

// Export a singleton instance
export const aiBotProcessor = new AIBotProcessor(); 