import { BaseProcessor } from './baseProcessor';

class ChatGPTProcessor extends BaseProcessor {
  constructor() {
    super();
    this.baseEndpoint = `${process.env.REACT_APP_CHATGPT_PATH}`;
  }

  async getChatGPTResponse(message) {
    return await this.makeRequest('post', `${this.baseEndpoint}/chat`, { message });
  }
}

// Export a singleton instance of the ChatGPTProcessor
export const chatGPTProcessor = new ChatGPTProcessor();
