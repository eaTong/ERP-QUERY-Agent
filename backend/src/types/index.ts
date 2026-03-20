export interface QueryRequest {
  query: string;
  context?: Record<string, unknown>;
  options?: {
    format?: 'table' | 'chart' | 'json';
    limit?: number;
  };
}

export interface QueryResponse {
  id: string;
  query: string;
  result: unknown;
  format: 'table' | 'chart' | 'json';
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}
