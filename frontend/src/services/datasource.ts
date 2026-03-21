import apiClient from './api';

export interface DataSource {
  id: string;
  name: string;
  type: 'mysql' | 'sqlserver';
  host: string;
  port: number;
  database: string;
  username: string;
  description?: string;
  status: number;
  createdAt: string;
}

export interface TableMapping {
  id: string;
  dataSourceId: string;
  externalTableName: string;
  localAlias: string;
  useCase?: string;
  queryRules?: string;
  enabled: number;
  dataSource?: DataSource;
  fields?: FieldMapping[];
}

export interface FieldMapping {
  id: string;
  tableMappingId: string;
  externalFieldName: string;
  localAlias: string;
  fieldDescription?: string;
  displayRules?: string;
  enabled: number;
}

export interface PromptRule {
  id: string;
  name: string;
  description?: string;
  content: string;
  enabled: number;
}

export const dataSourceApi = {
  list: async (): Promise<DataSource[]> => {
    const response = await apiClient.get<DataSource[]>('/data-sources');
    return response.data;
  },

  getById: async (id: string): Promise<DataSource> => {
    const response = await apiClient.get<DataSource>(`/data-sources/${id}`);
    return response.data;
  },

  create: async (data: Omit<DataSource, 'id' | 'createdAt'>): Promise<DataSource> => {
    const response = await apiClient.post<DataSource>('/data-sources', data);
    return response.data;
  },

  update: async (id: string, data: Partial<DataSource>): Promise<DataSource> => {
    const response = await apiClient.put<DataSource>(`/data-sources/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/data-sources/${id}`);
  },

  testConnection: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(`/data-sources/${id}/test`);
    return response.data;
  },

  getTables: async (id: string): Promise<string[]> => {
    const response = await apiClient.get<string[]>(`/data-sources/${id}/tables`);
    return response.data;
  },

  getTableFields: async (id: string, tableName: string): Promise<any[]> => {
    const response = await apiClient.get<any[]>(`/data-sources/${id}/fields/${encodeURIComponent(tableName)}`);
    return response.data;
  },
};

export const tableMappingApi = {
  list: async (dataSourceId?: string): Promise<TableMapping[]> => {
    const params = dataSourceId ? { dataSourceId } : {};
    const response = await apiClient.get<TableMapping[]>('/table-mappings', { params });
    return response.data;
  },

  getById: async (id: string): Promise<TableMapping> => {
    const response = await apiClient.get<TableMapping>(`/table-mappings/${id}`);
    return response.data;
  },

  create: async (data: Omit<TableMapping, 'id' | 'dataSource' | 'fields'>): Promise<TableMapping> => {
    const response = await apiClient.post<TableMapping>('/table-mappings', data);
    return response.data;
  },

  update: async (id: string, data: Partial<TableMapping>): Promise<TableMapping> => {
    const response = await apiClient.put<TableMapping>(`/table-mappings/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/table-mappings/${id}`);
  },
};

export const fieldMappingApi = {
  listByTable: async (tableMappingId: string): Promise<FieldMapping[]> => {
    const response = await apiClient.get<FieldMapping[]>(`/field-mappings/table/${tableMappingId}`);
    return response.data;
  },

  create: async (tableMappingId: string, data: Omit<FieldMapping, 'id' | 'tableMappingId'>): Promise<FieldMapping> => {
    const response = await apiClient.post<FieldMapping>(`/field-mappings/table/${tableMappingId}`, data);
    return response.data;
  },

  update: async (id: string, data: Partial<FieldMapping>): Promise<FieldMapping> => {
    const response = await apiClient.put<FieldMapping>(`/field-mappings/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/field-mappings/${id}`);
  },

  syncFields: async (tableMappingId: string): Promise<{ success: boolean; total: number; created: number; errors: string[] }> => {
    const response = await apiClient.post<{ success: boolean; total: number; created: number; errors: string[] }>(`/field-mappings/table/${tableMappingId}/sync`);
    return response.data;
  },
};

export const promptRuleApi = {
  list: async (enabledOnly?: boolean): Promise<PromptRule[]> => {
    const params = enabledOnly ? { enabled: '1' } : {};
    const response = await apiClient.get<PromptRule[]>('/prompt-rules', { params });
    return response.data;
  },

  getById: async (id: string): Promise<PromptRule> => {
    const response = await apiClient.get<PromptRule>(`/prompt-rules/${id}`);
    return response.data;
  },

  create: async (data: Omit<PromptRule, 'id'>): Promise<PromptRule> => {
    const response = await apiClient.post<PromptRule>('/prompt-rules', data);
    return response.data;
  },

  update: async (id: string, data: Partial<PromptRule>): Promise<PromptRule> => {
    const response = await apiClient.put<PromptRule>(`/prompt-rules/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/prompt-rules/${id}`);
  },
};
