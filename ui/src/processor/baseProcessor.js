import axios from 'axios';

export class BaseProcessor {
  constructor() {
    this.config = new this.Config();
  }

  Config = class {
    constructor() {
      this.backendDomain = 'http://localhost:8000'; // Default backend domain
    }

    setBackendDomain(domain) {
      this.backendDomain = domain;
    }
  }

  initialize(backendDomain = null) {
    if (backendDomain) {
      this.config.setBackendDomain(backendDomain);
    }
    // You can add more initialization logic here if needed
  }

  async makeRequest(method, endpoint, data = null, options = {}) {
    const url = `${this.config.backendDomain}${endpoint}`;
    
    // Check if authToken exists in localStorage
    const authToken = localStorage.getItem('authToken');
    
    // Prepare headers
    const headers = {
      ...options.headers,
    };

    // If authToken exists, add it to the headers
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
      const response = await axios({
        method,
        url,
        data,
        headers,
        ...options
      });
      return response.data;
    } catch (error) {
      console.error(`Request failed: ${method} ${endpoint}`, error);
      throw error;
    }
  }
}
