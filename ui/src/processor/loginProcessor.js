import { BaseProcessor } from './baseProcessor';

class LoginProcessor extends BaseProcessor {
  constructor() {
    super();
    this.baseEndpoint = `${process.env.REACT_APP_AUTH_PATH}`;
  }

  async login(username, password) {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      console.log(this.baseEndpoint);
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

  async validateToken() {
    try {
      if (!this.isLoggedIn()) return false;
      
      const response = await this.testAuthentication();
      return response.authenticated === true;
    } catch (error) {
      console.error('Token validation error:', error);
      // If validation fails, clear the token
      this.logout();
      return false;
    }
  }

  async testAuthentication() {
    try {
      const response = await this.makeRequest('post', `${this.baseEndpoint}/test`, null, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response;
    } catch (error) {
      console.error('Authentication test failed:', error);
      return { authenticated: false };
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
