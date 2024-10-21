import { BaseProcessor } from './baseProcessor';
import { API_ENDPOINTS } from '../const/apiEndpoints';

class BlogMenuProcessor extends BaseProcessor {
  constructor() {
    super();
    this.baseEndpoint = API_ENDPOINTS.BLOG_MENU;
  }

  async getBlogMenus() {
    return await this.makeRequest('get', `${this.baseEndpoint}/`);
  }

  async createBlogMenu(menuData) {
    return await this.makeRequest('post', this.baseEndpoint, menuData);
  }

  async updateBlogMenu(menuId, menuData) {
    return await this.makeRequest('put', `${this.baseEndpoint}/${menuId}`, menuData);
  }

  async deleteBlogMenu(menuId) {
    return await this.makeRequest('delete', `${this.baseEndpoint}/${menuId}`);
  }

  async createBlogMenuContentByPath(pathData) {
    return await this.makeRequest('get', `${this.baseEndpoint}/path${pathData}/content`);
  }
}

// Export a singleton instance of the BlogMenuProcessor
export const blogMenuProcessor = new BlogMenuProcessor();
