import apiClient from './api';

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  status: number;
  createdAt: string;
  roles?: { role: Role }[];
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: number;
  menus?: { menu: Menu }[];
  users?: { user: User }[];
}

export interface Menu {
  id: string;
  name: string;
  path: string;
  icon?: string;
  parentId?: string;
  sort: number;
  status: number;
  children?: Menu[];
}

export const userApi = {
  list: async (keyword?: string): Promise<User[]> => {
    const params = keyword ? { keyword } : {};
    const response = await apiClient.get<User[]>('/users', { params });
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  create: async (data: { username: string; password: string; email?: string }): Promise<User> => {
    const response = await apiClient.post<User>('/users', data);
    return response.data;
  },

  update: async (id: string, data: { email?: string; avatar?: string; status?: number }): Promise<User> => {
    const response = await apiClient.put<User>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  updatePassword: async (id: string, oldPassword: string, newPassword: string): Promise<void> => {
    await apiClient.put(`/users/${id}/password`, { oldPassword, newPassword });
  },

  assignRoles: async (id: string, roleIds: string[]): Promise<User> => {
    const response = await apiClient.put<User>(`/users/${id}/roles`, { roleIds });
    return response.data;
  },
};

export const roleApi = {
  list: async (keyword?: string): Promise<Role[]> => {
    const params = keyword ? { keyword } : {};
    const response = await apiClient.get<Role[]>('/roles', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Role> => {
    const response = await apiClient.get<Role>(`/roles/${id}`);
    return response.data;
  },

  create: async (data: { name: string; code: string; description?: string }): Promise<Role> => {
    const response = await apiClient.post<Role>('/roles', data);
    return response.data;
  },

  update: async (id: string, data: { name?: string; code?: string; description?: string; status?: number }): Promise<Role> => {
    const response = await apiClient.put<Role>(`/roles/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/roles/${id}`);
  },

  assignMenus: async (id: string, menuIds: string[]): Promise<Role> => {
    const response = await apiClient.put<Role>(`/roles/${id}/menus`, { menuIds });
    return response.data;
  },
};

export const menuApi = {
  list: async (keyword?: string): Promise<Menu[]> => {
    const params = keyword ? { keyword } : {};
    const response = await apiClient.get<Menu[]>('/menus', { params });
    return response.data;
  },

  getTree: async (keyword?: string): Promise<Menu[]> => {
    const params = keyword ? { keyword } : {};
    const response = await apiClient.get<Menu[]>('/menus/tree', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Menu> => {
    const response = await apiClient.get<Menu>(`/menus/${id}`);
    return response.data;
  },

  create: async (data: { name: string; path: string; icon?: string; parentId?: string; sort?: number }): Promise<Menu> => {
    const response = await apiClient.post<Menu>('/menus', data);
    return response.data;
  },

  update: async (id: string, data: { name?: string; path?: string; icon?: string; parentId?: string; sort?: number; status?: number }): Promise<Menu> => {
    const response = await apiClient.put<Menu>(`/menus/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/menus/${id}`);
  },
};
