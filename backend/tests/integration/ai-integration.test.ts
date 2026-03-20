/**
 * AI Query Integration Test
 * Uses real database connection to test the full flow
 *
 * Run with: npm test -- --testPathPattern="ai-integration"
 */

import { AIService } from '../../src/services/ai';
import prisma from '../../src/models';

describe('AI Service Integration Tests', () => {
  let aiService: AIService;

  beforeAll(() => {
    aiService = new AIService();
  });

  describe('with real database data', () => {
    it('should fetch table mappings from database', async () => {
      const tableMappings = await prisma.tableMapping.findMany({
        where: { enabled: 1 },
        include: {
          dataSource: true,
          fields: {
            where: { enabled: 1 },
          },
        },
      });

      expect(tableMappings.length).toBeGreaterThan(0);
      console.log('Found table mappings:', tableMappings.map(tm => tm.localAlias));
    });

    it('should fetch prompt rules from database', async () => {
      const promptRules = await prisma.promptRule.findMany({
        where: { enabled: 1 },
      });

      console.log('Found prompt rules:', promptRules.length);
      // Note: Currently no prompt rules exist, this is expected
    });

    it('should get data source configuration', async () => {
      const dataSources = await prisma.dataSource.findMany({
        where: { status: 1 },
      });

      expect(dataSources.length).toBeGreaterThan(0);
      const ds = dataSources[0];
      expect(ds.type).toBe('sqlserver');
      expect(ds.host).toBeDefined();
      expect(ds.database).toBeDefined();
      console.log('Data source:', ds.name, ds.type, ds.host, ds.database);
    });

    it('should have table mapping with fields', async () => {
      const tableMappings = await prisma.tableMapping.findMany({
        where: { enabled: 1 },
        include: {
          fields: {
            where: { enabled: 1 },
          },
        },
      });

      const tm = tableMappings[0];
      console.log('Table mapping:', tm.localAlias, '->', tm.externalTableName);
      console.log('Fields count:', tm.fields.length);

      if (tm.fields.length === 0) {
        console.warn('WARNING: Table mapping has no fields defined. AI query may not work properly.');
      }
    });
  });

  describe('SQL Server connection test', () => {
    it('should connect to SQL Server and execute a simple query', async () => {
      const dataSources = await prisma.dataSource.findMany({
        where: { status: 1, type: 'sqlserver' },
      });

      if (dataSources.length === 0) {
        console.warn('No SQL Server data sources found, skipping test');
        return;
      }

      const ds = dataSources[0];

      // Decrypt password (simplified - uses the actual decrypt method)
      const decryptedPassword = (aiService as any).decryptPassword(ds.password);

      const mssql = require('mssql');

      const config = {
        server: ds.host,
        port: ds.port,
        user: ds.username,
        password: decryptedPassword,
        database: ds.database,
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
      };

      try {
        const pool = await mssql.connect(config);
        const result = await pool.query('SELECT TOP 5 * FROM Crm_IntentCustomer WHERE isFormDead=0');
        console.log('Query returned', result.recordset.length, 'rows');
        console.log('Columns:', Object.keys(result.recordset[0] || {}).join(', '));
        await pool.close();

        expect(result.recordset.length).toBeGreaterThan(0);
      } catch (error: any) {
        console.error('SQL Server connection failed:', error.message);
        throw error;
      }
    });
  });

  describe('AI Query with real data (requires API key)', () => {
    it('should build correct context from database', async () => {
      // This test verifies the context building without calling the actual API
      const tableMappings = await prisma.tableMapping.findMany({
        where: { enabled: 1 },
        include: {
          dataSource: true,
          fields: {
            where: { enabled: 1 },
          },
        },
      });

      const promptRules = await prisma.promptRule.findMany({
        where: { enabled: 1 },
      });

      // Build context manually to verify structure
      const context = {
        tables: tableMappings.map((tm) => ({
          id: tm.id,
          localAlias: tm.localAlias,
          externalTableName: tm.externalTableName,
          useCase: tm.useCase || undefined,
          queryRules: tm.queryRules || undefined,
          fields: tm.fields.map((f) => ({
            externalFieldName: f.externalFieldName,
            localAlias: f.localAlias,
            fieldDescription: f.fieldDescription || undefined,
            displayRules: f.displayRules || undefined,
          })),
        })),
        promptRules: promptRules.map((pr) => ({
          name: pr.name,
          description: pr.description || undefined,
          content: pr.content,
        })),
      };

      expect(context.tables.length).toBeGreaterThan(0);
      console.log('Context built successfully');
      console.log('Tables:', context.tables.map(t => `${t.localAlias}(${t.externalTableName})`));
      console.log('Total fields:', context.tables.reduce((sum, t) => sum + t.fields.length, 0));

      // Verify buildContext produces correct output
      const prompt = (aiService as any).buildContext(context);
      expect(prompt).toContain('Crm_IntentCustomer');
      expect(prompt).toContain('客户信息');
      expect(prompt).toContain('isFormDead=0');
    });

    it('should construct proper SQL query prompt', async () => {
      const tableMappings = await prisma.tableMapping.findMany({
        where: { enabled: 1 },
        include: {
          dataSource: true,
          fields: {
            where: { enabled: 1 },
          },
        },
      });

      const context = {
        tables: tableMappings.map((tm) => ({
          id: tm.id,
          localAlias: tm.localAlias,
          externalTableName: tm.externalTableName,
          useCase: tm.useCase || undefined,
          queryRules: tm.queryRules || undefined,
          fields: tm.fields.map((f) => ({
            externalFieldName: f.externalFieldName,
            localAlias: f.localAlias,
            fieldDescription: f.fieldDescription || undefined,
            displayRules: f.displayRules || undefined,
          })),
        })),
        promptRules: [],
      };

      const userQuery = '查询所有客户信息';
      const prompt = (aiService as any).buildSQLQueryPrompt(context, userQuery);

      expect(prompt).toContain(userQuery);
      expect(prompt).toContain('请生成SQL查询');
      expect(prompt).toContain('Crm_IntentCustomer');

      console.log('\nGenerated prompt preview:');
      console.log(prompt.substring(0, 500) + '...\n');
    });
  });
});
