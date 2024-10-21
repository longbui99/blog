import { BaseProcessor } from './baseProcessor';
import { API_ENDPOINTS } from '../const/apiEndpoints';

class ChatGPTProcessor extends BaseProcessor {
  constructor() {
    super();
    this.baseEndpoint = API_ENDPOINTS.CHATGPT;
  }

  async getChatGPTResponse(message) {
    return await this.makeRequest('post', `${this.baseEndpoint}/chat`, { message });
  }
}

// Export a singleton instance of the ChatGPTProcessor
export const chatGPTProcessor = new ChatGPTProcessor();
