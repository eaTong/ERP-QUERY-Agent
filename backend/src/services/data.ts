import { logger } from '../utils/logger';

interface Pagination {
  page: number;
  pageSize: number;
}

interface DataResult {
  data: Record<string, unknown>[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

// Mock data for different entities
const mockDataStore: Record<string, Record<string, unknown>[]> = {
  orders: [
    { id: 'ORD-001', name: 'Product A', category: 'Electronics', status: 'Completed', amount: 1500, date: '2024-01-15' },
    { id: 'ORD-002', name: 'Product B', category: 'Clothing', status: 'Pending', amount: 850, date: '2024-01-16' },
    { id: 'ORD-003', name: 'Product C', category: 'Electronics', status: 'Completed', amount: 2300, date: '2024-01-17' },
    { id: 'ORD-004', name: 'Product D', category: 'Food', status: 'Cancelled', amount: 320, date: '2024-01-18' },
    { id: 'ORD-005', name: 'Product E', category: 'Electronics', status: 'Completed', amount: 4100, date: '2024-01-19' },
  ],
  customers: [
    { id: 'CUS-001', name: 'Alice Johnson', email: 'alice@example.com', country: 'USA' },
    { id: 'CUS-002', name: 'Bob Smith', email: 'bob@example.com', country: 'UK' },
    { id: 'CUS-003', name: 'Charlie Brown', email: 'charlie@example.com', country: 'Canada' },
  ],
  products: [
    { id: 'PROD-001', name: 'Laptop', price: 999, stock: 50 },
    { id: 'PROD-002', name: 'Phone', price: 699, stock: 100 },
    { id: 'PROD-003', name: 'Tablet', price: 499, stock: 75 },
  ],
};

export class DataService {
  async getData(entity: string, pagination: Pagination, filters: Record<string, string>): Promise<DataResult> {
    logger.info(`Fetching data for entity: ${entity}`);

    const entityData = mockDataStore[entity] || [];

    // Apply filters
    let filteredData = entityData;
    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        filteredData = filteredData.filter((item) => {
          const itemValue = item[key];
          return itemValue && String(itemValue).toLowerCase().includes(value.toLowerCase());
        });
      }
    }

    // Apply pagination
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        total: filteredData.length,
      },
    };
  }
}
