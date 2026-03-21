import axios from 'axios';
import prisma from '../models';
import mysql from 'mysql2/promise';
import mssql from 'mssql';
import { decrypt } from '../utils/encryption';
import { createMySqlConnection, createSqlServerConnection, closeMySqlConnection, closeSqlServerConnection } from '../utils/database';

// MiniMax API配置 (使用新版 OpenAI 兼容格式)
const MINI_MAX_API_KEY = process.env.AI_API_KEY || process.env.MINI_MAX_API_KEY || '';
// AI_API_URL 已包含完整路径如 https://api.minimaxi.com/v1/chat/completions
const MINI_MAX_API_URL = process.env.AI_API_URL || 'https://api.minimaxi.com/v1/chat/completions';
const MINI_MAX_MODEL = process.env.AI_MODEL || 'MiniMax-M2.7';

interface TableInfo {
  id: string;
  localAlias: string;
  externalTableName: string;
  databaseType: 'mysql' | 'sqlserver';
  useCase?: string;
  queryRules?: string;
  fields: {
    externalFieldName: string;
    localAlias: string;
    fieldDescription?: string;
    displayRules?: string;
  }[];
}

interface PromptRule {
  name: string;
  description?: string;
  content: string;
}

interface QueryContext {
  tables: TableInfo[];
  userPromptRules: PromptRule[];
}

// 系统内置规则（不存数据库）
const SYSTEM_PROMPT_RULES: Record<string, { name: string; description: string; content: string }[]> = {
  sqlserver: [
    {
      name: 'SQLServer语法注意事项',
      description: 'SQLServer数据库的特定语法要求',
      content: 'SQL Server 语法规则：\n1. 以数字开头的列名必须使用方括号包裹，如 [20htbh]、[2023year]\n2. 别名和列名之间不能有空格，如 tk.[20htbh]，不能写成 tk. [20htbh]\n3. 在AS子句中定义列别名时，格式为：列名 AS 别名\n4. 在ORDER BY子句中不能直接使用SELECT列表中定义的列别名，必须重复CASE表达式或使用数字位置',
    },
  ],
  mysql: [],
};

export class AIService {
  private buildContext(context: QueryContext): string {
    // 收集所有数据库类型
    const dbTypes = [...new Set(context.tables.map(t => t.databaseType))];
    const dbTypeHint = dbTypes.length === 1 ? `（数据库类型: ${dbTypes[0] === 'mysql' ? 'MySQL' : 'SQL Server'}）` : '';

    let prompt = `你是一个专业的SQL查询助手。请根据以下信息生成SQL查询语句。\n\n`;

    // 添加数据库类型信息
    prompt += `## 数据库类型：${dbTypes.map(t => t === 'mysql' ? 'MySQL' : 'SQL Server').join(', ')}\n\n`;

    // 添加表信息
    prompt += '## 可用的表及其字段：\n';
    for (const table of context.tables) {
      prompt += `\n### ${table.localAlias} (对应数据库表: ${table.externalTableName}，数据库类型: ${table.databaseType === 'mysql' ? 'MySQL' : 'SQL Server'})`;
      if (table.useCase) {
        prompt += `\n用途: ${table.useCase}`;
      }
      if (table.queryRules) {
        prompt += `\n默认查询条件: ${table.queryRules}`;
      }
      prompt += '\n字段:';
      for (const field of table.fields) {
        prompt += `\n  - ${field.localAlias}: ${field.externalFieldName}`;
        if (field.fieldDescription) {
          prompt += ` (${field.fieldDescription})`;
        }
      }
    }

    // 添加系统规则
    const allDbTypes = [...new Set(context.tables.map(t => t.databaseType))];
    const systemRules = allDbTypes.flatMap(dbType => SYSTEM_PROMPT_RULES[dbType] || []);
    if (systemRules.length > 0) {
      prompt += '\n\n## 系统规则（必须遵守）：\n';
      for (const rule of systemRules) {
        prompt += `\n### ${rule.name}`;
        if (rule.description) {
          prompt += `: ${rule.description}`;
        }
        prompt += `\n${rule.content}\n`;
      }
    }

    // 添加用户自定义规则
    if (context.userPromptRules.length > 0) {
      prompt += '\n\n## 用户自定义规则：\n';
      for (const rule of context.userPromptRules) {
        prompt += `\n### ${rule.name}`;
        if (rule.description) {
          prompt += `: ${rule.description}`;
        }
        prompt += `\n${rule.content}\n`;
      }
    }

    return prompt;
  }

  private buildSQLQueryPrompt(context: QueryContext, userQuery: string): string {
    const basePrompt = this.buildContext(context);

    return `${basePrompt}

## 用户查询：
"${userQuery}"

## 请生成SQL查询：
请根据以上信息和用户查询，生成一个合适的SQL查询语句。只返回SQL语句，不要包含其他解释文字。如果查询涉及多个表，确保使用正确的JOIN条件。注意应用表映射中的默认查询条件（如isDelete=0等）。
`;
  }

  async query(userQuery: string): Promise<{
    sql: string;
    tables: string[];
    promptRules: string[];
    data: any[];
    columns: string[];
  }> {
    // 1. 获取所有启用的表映射
    const tableMappings = await prisma.tableMapping.findMany({
      where: { enabled: 1 },
      include: {
        dataSource: true,
        fields: {
          where: { enabled: 1 },
        },
      },
    });

    if (tableMappings.length === 0) {
      throw new Error('没有可用的表映射，请先配置数据源和表映射');
    }

    // 2. 获取所有启用的提示词规则
    const promptRules = await prisma.promptRule.findMany({
      where: { enabled: 1 },
    });

    // 3. 构建上下文
    const tables: TableInfo[] = tableMappings.map((tm) => ({
      id: tm.id,
      localAlias: tm.localAlias,
      externalTableName: tm.externalTableName,
      databaseType: tm.dataSource.type as 'mysql' | 'sqlserver',
      useCase: tm.useCase || undefined,
      queryRules: tm.queryRules || undefined,
      fields: tm.fields.map((f) => ({
        externalFieldName: f.externalFieldName,
        localAlias: f.localAlias,
        fieldDescription: f.fieldDescription || undefined,
        displayRules: f.displayRules || undefined,
      })),
    }));

    const context: QueryContext = {
      tables,
      userPromptRules: promptRules.map((pr) => ({
        name: pr.name,
        description: pr.description || undefined,
        content: pr.content,
      })),
    };

    // 4. 调用 MiniMax API 生成 SQL
    const sqlPrompt = this.buildSQLQueryPrompt(context, userQuery);

    let generatedSQL = '';
    try {
      const response = await axios.post(
        MINI_MAX_API_URL,
        {
          model: MINI_MAX_MODEL,
          messages: [
            {
              role: 'user',
              content: sqlPrompt,
            },
          ],
          max_tokens: 2048,
          temperature: 0.1,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${MINI_MAX_API_KEY}`,
          },
          timeout: 60000,
        }
      );

      generatedSQL = response.data.choices?.[0]?.message?.content?.trim() || '';

      // MiniMax 返回格式中可能包含 <think>...</think> 标签，需要提取标签后的实际内容
      const thinkCloseTag = '</think>';
      const thinkIndex = generatedSQL.indexOf(thinkCloseTag);
      if (thinkIndex !== -1) {
        generatedSQL = generatedSQL.substring(thinkIndex + thinkCloseTag.length).trim();
      }
    } catch (error: any) {
      console.error('MiniMax API error:', error.message);
      throw new Error(`AI查询失败: ${error.message}`);
    }

    // 清理SQL（移除可能的markdown代码块和其他非SQL内容）
    generatedSQL = generatedSQL.replace(/```sql\n?|```\n?/g, '').trim();

    // 提取纯SQL语句（AI可能返回额外文本）
    const sqlMatch = generatedSQL.match(/(SELECT|INSERT|UPDATE|DELETE|WITH).*?;/is);
    if (sqlMatch) {
      generatedSQL = sqlMatch[0].trim();
    }

    // 5. 解析生成的SQL，确定涉及的表
    const involvedTables: string[] = [];
    const involvedTableIds: string[] = [];

    for (const table of tables) {
      // 检查SQL中是否包含表名或别名
      if (
        generatedSQL.toLowerCase().includes(table.localAlias.toLowerCase()) ||
        generatedSQL.toLowerCase().includes(table.externalTableName.toLowerCase())
      ) {
        involvedTables.push(table.localAlias);
        involvedTableIds.push(table.id);
      }
    }

    // 6. 选择要执行的数据源（如果有多个表，选择第一个表的）
    let targetDataSource = tableMappings[0].dataSource;
    if (involvedTableIds.length > 0) {
      const involvedMapping = tableMappings.find((tm) => tm.id === involvedTableIds[0]);
      if (involvedMapping) {
        targetDataSource = involvedMapping.dataSource;
      }
    }

    // 7. 解密密码并执行查询
    const password = decrypt(targetDataSource.password);

    let result: Record<string, unknown>[] = [];
    let columns: string[] = [];

    try {
      if (targetDataSource.type === 'mysql') {
        const conn = await createMySqlConnection({
          host: targetDataSource.host,
          port: targetDataSource.port,
          user: targetDataSource.username,
          password: password,
          database: targetDataSource.database,
          type: 'mysql',
        });
        const [rows, fieldRows] = await conn.query(generatedSQL) as [Record<string, unknown>[], { name: string }[]];
        await closeMySqlConnection(conn);
        result = rows;
        columns = fieldRows ? fieldRows.map((f) => f.name) : (rows.length > 0 ? Object.keys(rows[0]) : []);
      } else {
        const conn = await createSqlServerConnection({
          host: targetDataSource.host,
          port: targetDataSource.port,
          user: targetDataSource.username,
          password: password,
          database: targetDataSource.database,
          type: 'sqlserver',
        });
        const queryResult = await conn.query(generatedSQL);
        await closeSqlServerConnection(conn);
        result = queryResult.recordset || [];
        columns = queryResult.recordset?.length > 0 ? Object.keys(queryResult.recordset[0]) : [];
      }
    } catch (error: any) {
      console.error('SQL execution error:', error.message);
      throw new Error(`SQL执行失败: ${error.message}\n生成的SQL: ${generatedSQL}`);
    }

    // 8. 应用字段显示规则
    const displayRulesMap = new Map<string, Map<string, string>>();
    for (const tm of tableMappings) {
      for (const field of tm.fields) {
        if (field.displayRules) {
          try {
            const rules = JSON.parse(field.displayRules) as Record<string, string>;
            displayRulesMap.set(field.externalFieldName, new Map(Object.entries(rules)));
          } catch {
            // ignore parse errors
          }
        }
      }
    }

    // 应用显示规则到结果
    const processedResult = result.map((row) => {
      const processedRow: any = {};
      for (const col of columns) {
        const value = row[col];
        const ruleMap = displayRulesMap.get(col);
        if (ruleMap && value !== null && value !== undefined) {
          const key = String(value);
          processedRow[col] = ruleMap.has(key) ? ruleMap.get(key) : value;
        } else {
          processedRow[col] = value;
        }
      }
      return processedRow;
    });

    return {
      sql: generatedSQL,
      tables: involvedTables,
      promptRules: promptRules.map((pr) => pr.name),
      data: processedResult,
      columns,
    };
  }

}

export const aiService = new AIService();
