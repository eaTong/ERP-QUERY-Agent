import apiClient from './api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  path: string;
  icon?: string;
  children?: MenuItem[];
}

export interface LoginResponse extends User {}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  getMenus: async (): Promise<MenuItem[]> => {
    const response = await apiClient.get<MenuItem[]>('/auth/menus');
    return response.data;
  },
};
