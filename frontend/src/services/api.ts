import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const queryApi = {
  send: async (query: string) => {
    const response = await apiClient.post('/query', { query });
    return response.data;
  },
  getHistory: async () => {
    const response = await apiClient.get('/query/history');
    return response.data;
  },
};

export const dataApi = {
  getEntity: async (entity: string, params?: Record<string, unknown>) => {
    const response = await apiClient.get(`/data/${entity}`, { params });
    return response.data;
  },
};

export const reportsApi = {
  list: async () => {
    const response = await apiClient.get('/reports');
    return response.data;
  },
  generate: async (reportData: Record<string, unknown>) => {
    const response = await apiClient.post('/reports', reportData);
    return response.data;
  },
};

export const healthApi = {
  check: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

export default apiClient;
