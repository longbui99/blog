import { BaseProcessor } from './baseProcessor';
import { API_ENDPOINTS } from '../const/apiEndpoints';

class LoginProcessor extends BaseProcessor {
  constructor() {
    super();
    this.baseEndpoint = API_ENDPOINTS.AUTH;
  }

  async login(username, password) {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await this.makeRequest('post', this.baseEndpoint, formData, {
        headers: {
          // Remove Content-Type header to let the browser set it automatically with the boundary
        },
      });
      
      if (response.access_token) {
        // Store the token in localStorage
        localStorage.setItem('authToken', response.access_token);
        return { success: true, message: 'Login successful' };
      } else {
        return { success: false, message: 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login' };
    }
  }

  logout() {
    localStorage.removeItem('authToken');
    return { success: true, message: 'Logout successful' };
  }

  isLoggedIn() {
    return !!localStorage.getItem('authToken');
  }
}

// Export a singleton instance of the LoginProcessor
export const loginProcessor = new LoginProcessor();
