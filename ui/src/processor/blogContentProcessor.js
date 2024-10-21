import { BaseProcessor } from './baseProcessor';
import { API_ENDPOINTS } from '../const/apiEndpoints';

class BlogContentProcessor extends BaseProcessor {
  constructor() {
    super();
    this.baseEndpoint = API_ENDPOINTS.BLOG_CONTENT;
  }

  async getBlogContents() {
    return await this.makeRequest('get', `${this.baseEndpoint}/`);
  }

  async createBlogContent(contentData) {
    return await this.makeRequest('post', this.baseEndpoint, contentData);
  }

  async updateBlogContent(contentId, contentData) {
    return await this.makeRequest('put', `${this.baseEndpoint}/${contentId}`, contentData);
  }

  async deleteBlogContentByPath(path) {
    return await this.makeRequest('delete', `${this.baseEndpoint}/delete_by_path${path}`);
  }

  async saveOrUpdateContent(blogContentUpdate) {

    return await this.makeRequest('put', `${this.baseEndpoint}/update_or_create`, blogContentUpdate);
  }
}

// Export a singleton instance of the BlogContentProcessor
export const blogContentProcessor = new BlogContentProcessor();
