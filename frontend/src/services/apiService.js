import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url, error.message);
    return Promise.reject(error);
  }
);

// API Service Class
class ApiService {
  // Health check
  async healthCheck() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw new Error('Backend server is not responding');
    }
  }

  // Chat with AI
  async sendChatMessage(message) {
    try {
      const response = await api.post('/api/v1/chat', {
        message: message,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to send message');
    }
  }

  // Get query suggestions
  async getQuerySuggestions() {
    try {
      const response = await api.get('/api/v1/suggestions');
      return response.data;
    } catch (error) {
      throw new Error('Failed to get query suggestions');
    }
  }

  // Get database info
  async getDatabaseInfo() {
    try {
      const response = await api.get('/api/v1/database/info');
      return response.data;
    } catch (error) {
      throw new Error('Failed to get database information');
    }
  }

  // Get table info
  async getTableInfo(tableName) {
    try {
      const response = await api.get(`/api/v1/database/table/${tableName}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get table information for ${tableName}`);
    }
  }

  // Execute custom query
  async executeCustomQuery(query) {
    try {
      const response = await api.post('/api/v1/database/query', {
        query: query
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to execute query');
    }
  }

  // Export data
  async exportData(format, tableName = null, query = null) {
    try {
      const params = new URLSearchParams();
      if (tableName) params.append('table_name', tableName);
      if (query) params.append('query', query);

      const response = await api.get(`/api/v1/export/${format}?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to export data as ${format}`);
    }
  }
}

// Create and export instance
const apiService = new ApiService();
export default apiService;