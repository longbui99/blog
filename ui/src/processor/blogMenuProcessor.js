import { BaseProcessor } from './baseProcessor';

class BlogMenuProcessor extends BaseProcessor {
  constructor() {
    super();
    this.baseEndpoint = `${process.env.REACT_APP_BLOG_MENU_PATH}`;
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
    return await this.makeRequest('get', `${this.baseEndpoint}/path/content${pathData}`);
  }

  async checkPathExists(path) {
    return await this.makeRequest('post', `${this.baseEndpoint}/check-path`, { path });
  }

  async publishBlogMenu(path, isPublished) {
    return await this.makeRequest('post', `${this.baseEndpoint}/publish`, { path, isPublished });
  }
}

// Export a singleton instance of the BlogMenuProcessor
export const blogMenuProcessor = new BlogMenuProcessor();
