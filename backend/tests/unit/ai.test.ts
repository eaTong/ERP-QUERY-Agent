import axios from 'axios';
import { AIService } from '../../src/services/ai';

// Create mock functions
const mockTableMappingFindMany = jest.fn();
const mockPromptRuleFindMany = jest.fn();
const mockAxiosPost = jest.fn();

// Mock dependencies
jest.mock('axios', () => ({
  post: (...args: any[]) => mockAxiosPost(...args),
}));

// Mock prisma
jest.mock('../../src/models', () => ({
  __esModule: true,
  default: {
    tableMapping: {
      findMany: (...args: any[]) => mockTableMappingFindMany(...args),
    },
    promptRule: {
      findMany: (...args: any[]) => mockPromptRuleFindMany(...args),
    },
  },
}));

// Mock mysql2/promise
const mockMysqlConnection = {
  query: jest.fn(),
  end: jest.fn().mockResolvedValue(undefined),
};
jest.mock('mysql2/promise', () => ({
  createConnection: jest.fn().mockResolvedValue(mockMysqlConnection),
}));

// Mock mssql
jest.mock('mssql', () => ({
  connect: jest.fn(),
}));

describe('AIService', () => {
  let aiService: AIService;

  beforeEach(() => {
    aiService = new AIService();
    jest.clearAllMocks();
  });

  describe('query', () => {
    const mockTableMapping = {
      id: 'tm-1',
      localAlias: 'orders',
      externalTableName: 'sales_orders',
      useCase: '订单数据',
      queryRules: 'isDelete=0',
      enabled: 1,
      dataSource: {
        id: 'ds-1',
        name: 'MySQL DataSource',
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'encrypted:abc123:def456',
        database: 'erp',
        enabled: 1,
      },
      fields: [
        {
          id: 'f-1',
          externalFieldName: 'order_id',
          localAlias: '订单ID',
          fieldDescription: '订单唯一标识',
          displayRules: '{"1":"已支付","0":"未支付"}',
          enabled: 1,
        },
        {
          id: 'f-2',
          externalFieldName: 'amount',
          localAlias: '金额',
          fieldDescription: '订单金额',
          enabled: 1,
        },
      ],
    };

    const mockPromptRule = {
      id: 'pr-1',
      name: '金额格式化',
      description: '将金额除以100显示',
      content: '金额字段需要除以100进行转换',
      enabled: 1,
    };

    it('should return query result with SQL and data', async () => {
      // Mock Prisma calls
      mockTableMappingFindMany.mockResolvedValue([mockTableMapping]);
      mockPromptRuleFindMany.mockResolvedValue([mockPromptRule]);

      // Mock MiniMax API response
      mockAxiosPost.mockResolvedValue({
        data: {
          choices: [
            {
              message: {
                content: 'SELECT order_id, amount FROM sales_orders WHERE isDelete=0 LIMIT 10',
              },
            },
          ],
        },
      });

      // Mock MySQL query result
      mockMysqlConnection.query.mockResolvedValue([
        [
          { order_id: 1, amount: 1000 },
          { order_id: 2, amount: 2000 },
        ],
        [{ name: 'order_id' }, { name: 'amount' }],
      ]);

      const result = await aiService.query('查询订单');

      expect(result).toHaveProperty('sql');
      expect(result).toHaveProperty('tables');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('columns');
      expect(result.tables).toContain('orders');
    });

    it('should throw error when no table mappings available', async () => {
      mockTableMappingFindMany.mockResolvedValue([]);
      mockPromptRuleFindMany.mockResolvedValue([]);

      await expect(aiService.query('查询订单')).rejects.toThrow(
        '没有可用的表映射，请先配置数据源和表映射'
      );
    });

    it('should throw error when MiniMax API fails', async () => {
      mockTableMappingFindMany.mockResolvedValue([mockTableMapping]);
      mockPromptRuleFindMany.mockResolvedValue([mockPromptRule]);

      mockAxiosPost.mockRejectedValue(new Error('API请求失败'));

      await expect(aiService.query('查询订单')).rejects.toThrow('AI查询失败');
    });

    it('should clean SQL markdown code blocks', async () => {
      mockTableMappingFindMany.mockResolvedValue([mockTableMapping]);
      mockPromptRuleFindMany.mockResolvedValue([mockPromptRule]);

      // SQL wrapped in markdown code blocks
      mockAxiosPost.mockResolvedValue({
        data: {
          choices: [
            {
              message: {
                content: '```sql\nSELECT * FROM orders\n```',
              },
            },
          ],
        },
      });

      mockMysqlConnection.query.mockResolvedValue([[], []]);

      const result = await aiService.query('查询');
      expect(result.sql).toBe('SELECT * FROM orders');
    });

    it('should apply display rules to result data', async () => {
      mockTableMappingFindMany.mockResolvedValue([mockTableMapping]);
      mockPromptRuleFindMany.mockResolvedValue([mockPromptRule]);

      mockAxiosPost.mockResolvedValue({
        data: {
          choices: [
            {
              message: {
                content: 'SELECT order_id, amount FROM sales_orders',
              },
            },
          ],
        },
      });

      mockMysqlConnection.query.mockResolvedValue([
        [
          { order_id: '1', amount: 1000 },
          { order_id: '0', amount: 500 },
        ],
        [{ name: 'order_id' }, { name: 'amount' }],
      ]);

      const result = await aiService.query('查询');

      // order_id '1' should be transformed to '已支付', '0' to '未支付'
      expect(result.data[0].order_id).toBe('已支付');
      expect(result.data[1].order_id).toBe('未支付');
    });

    it('should identify involved tables from generated SQL', async () => {
      mockTableMappingFindMany.mockResolvedValue([mockTableMapping]);
      mockPromptRuleFindMany.mockResolvedValue([mockPromptRule]);

      mockAxiosPost.mockResolvedValue({
        data: {
          choices: [
            {
              message: {
                content: 'SELECT * FROM orders WHERE amount > 100',
              },
            },
          ],
        },
      });

      mockMysqlConnection.query.mockResolvedValue([[], []]);

      const result = await aiService.query('查询');

      expect(result.tables).toContain('orders');
    });

    it('should handle SQL Server data source', async () => {
      const sqlServerMapping = {
        ...mockTableMapping,
        dataSource: {
          ...mockTableMapping.dataSource,
          type: 'sqlserver',
          password: 'encrypted:abc123:def456',
        },
      };

      mockTableMappingFindMany.mockResolvedValue([sqlServerMapping]);
      mockPromptRuleFindMany.mockResolvedValue([mockPromptRule]);

      mockAxiosPost.mockResolvedValue({
        data: {
          choices: [
            {
              message: {
                content: 'SELECT * FROM orders',
              },
            },
          ],
        },
      });

      const mockPool = {
        query: jest.fn().mockResolvedValue({
          recordset: [{ order_id: 1, amount: 1000 }],
        }),
        close: jest.fn().mockResolvedValue(undefined),
      };
      const mockMssql = jest.requireMock('mssql') as any;
      mockMssql.connect.mockResolvedValue(mockPool);

      const result = await aiService.query('查询');

      expect(result).toHaveProperty('data');
      expect(mockMssql.connect).toHaveBeenCalled();
    });
  });

  describe('buildContext', () => {
    it('should build context with table and field information', () => {
      const context = {
        tables: [
          {
            id: 'tm-1',
            localAlias: 'orders',
            externalTableName: 'sales_orders',
            useCase: '订单数据',
            queryRules: 'isDelete=0',
            fields: [
              {
                externalFieldName: 'order_id',
                localAlias: '订单ID',
                fieldDescription: '订单唯一标识',
                displayRules: undefined,
              },
            ],
          },
        ],
        promptRules: [
          {
            name: '金额格式化',
            description: '将金额除以100显示',
            content: '金额字段需要除以100进行转换',
          },
        ],
      };

      const prompt = (aiService as any).buildContext(context);

      expect(prompt).toContain('orders');
      expect(prompt).toContain('sales_orders');
      expect(prompt).toContain('订单数据');
      expect(prompt).toContain('isDelete=0');
      expect(prompt).toContain('订单ID');
      expect(prompt).toContain('订单唯一标识');
      expect(prompt).toContain('金额格式化');
    });
  });

  describe('buildSQLQueryPrompt', () => {
    it('should include user query in prompt', () => {
      const context = {
        tables: [],
        promptRules: [],
      };

      const prompt = (aiService as any).buildSQLQueryPrompt(context, '查询所有订单');

      expect(prompt).toContain('查询所有订单');
      expect(prompt).toContain('用户查询');
      expect(prompt).toContain('请生成SQL查询');
    });
  });

  describe('decryptPassword', () => {
    it('should decrypt encrypted password', () => {
      // This test verifies the method exists and is callable
      const encrypted = 'abc123:def456';
      const result = (aiService as any).decryptPassword(encrypted);
      expect(typeof result).toBe('string');
    });

    it('should return original string if decryption fails', () => {
      const plainPassword = 'plain_password';
      const result = (aiService as any).decryptPassword(plainPassword);
      expect(result).toBe(plainPassword);
    });
  });
});
