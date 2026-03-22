import prisma from '../models';
import { encrypt, decrypt } from '../utils/encryption';
import { createMySqlConnection, createSqlServerConnection, closeMySqlConnection, closeSqlServerConnection, DataSourceConfig } from '../utils/database';
import mysql from 'mysql2/promise';
import mssql from 'mssql';

export class DataSourceService {
  async findAll(keyword?: string) {
    const where = keyword
      ? {
          OR: [
            { name: { contains: keyword } },
            { host: { contains: keyword } },
            { database: { contains: keyword } },
          ],
        }
      : {};

    return prisma.dataSource.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.dataSource.findUnique({
      where: { id },
      include: {
        tableMappings: true,
      },
    });
  }

  async create(data: {
    name: string;
    type: string;
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    description?: string;
  }) {
    const encryptedPassword = encrypt(data.password);

    return prisma.dataSource.create({
      data: {
        name: data.name,
        type: data.type,
        host: data.host,
        port: data.port,
        database: data.database,
        username: data.username,
        password: encryptedPassword,
        description: data.description,
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      type?: string;
      host?: string;
      port?: number;
      database?: string;
      username?: string;
      password?: string;
      description?: string;
      status?: number;
    }
  ) {
    const updateData: Record<string, unknown> = { ...data };
    if (data.password) {
      updateData.password = encrypt(data.password);
    }

    return prisma.dataSource.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return prisma.dataSource.delete({
      where: { id },
    });
  }

  async testConnection(id: string): Promise<{ success: boolean; message: string }> {
    const dataSource = await prisma.dataSource.findUnique({
      where: { id },
    });

    if (!dataSource) {
      return { success: false, message: '数据源不存在' };
    }

    const password = decrypt(dataSource.password);

    try {
      if (dataSource.type === 'mysql') {
        const conn = await createMySqlConnection({
          host: dataSource.host,
          port: dataSource.port,
          user: dataSource.username,
          password: password,
          database: dataSource.database,
          type: 'mysql',
        });
        await closeMySqlConnection(conn);
        return { success: true, message: '连接成功' };
      } else {
        const conn = await createSqlServerConnection({
          host: dataSource.host,
          port: dataSource.port,
          user: dataSource.username,
          password: password,
          database: dataSource.database,
          type: 'sqlserver',
        });
        await closeSqlServerConnection(conn);
        return { success: true, message: '连接成功' };
      }
    } catch (error: any) {
      return { success: false, message: `连接失败: ${error.message}` };
    }
  }

  async getTables(id: string): Promise<{ tables: string[]; error?: string }> {
    const dataSource = await prisma.dataSource.findUnique({
      where: { id },
    });

    if (!dataSource) {
      return { tables: [], error: '数据源不存在' };
    }

    const password = decrypt(dataSource.password);

    try {
      if (dataSource.type === 'mysql') {
        const conn = await createMySqlConnection({
          host: dataSource.host,
          port: dataSource.port,
          user: dataSource.username,
          password: password,
          database: dataSource.database,
          type: 'mysql',
        });
        const [rows] = await conn.query('SHOW TABLES');
        await closeMySqlConnection(conn);
        return { tables: (rows as Record<string, unknown>[]).map((row) => Object.values(row)[0] as string) };
      } else {
        const conn = await createSqlServerConnection({
          host: dataSource.host,
          port: dataSource.port,
          user: dataSource.username,
          password: password,
          database: dataSource.database,
          type: 'sqlserver',
        });
        const result = await conn.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'");
        await closeSqlServerConnection(conn);
        return { tables: result.recordset.map((row: Record<string, unknown>) => row.TABLE_NAME as string) };
      }
    } catch (error: any) {
      return { tables: [], error: `获取表列表失败: ${error.message}` };
    }
  }

  async getTableFields(id: string, tableName: string): Promise<{ fields: Record<string, unknown>[]; error?: string }> {
    const dataSource = await prisma.dataSource.findUnique({
      where: { id },
    });

    if (!dataSource) {
      return { fields: [], error: '数据源不存在' };
    }

    const password = decrypt(dataSource.password);

    try {
      if (dataSource.type === 'mysql') {
        const conn = await createMySqlConnection({
          host: dataSource.host,
          port: dataSource.port,
          user: dataSource.username,
          password: password,
          database: dataSource.database,
          type: 'mysql',
        });
        const [rows] = await conn.query('DESCRIBE ??', [tableName]);
        await closeMySqlConnection(conn);
        return { fields: rows as Record<string, unknown>[] };
      } else {
        const conn = await createSqlServerConnection({
          host: dataSource.host,
          port: dataSource.port,
          user: dataSource.username,
          password: password,
          database: dataSource.database,
          type: 'sqlserver',
        });
        const result = await conn.query(
          `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableName}'`
        );
        await closeSqlServerConnection(conn);
        return { fields: result.recordset as Record<string, unknown>[] };
      }
    } catch (error: any) {
      return { fields: [], error: `获取字段信息失败: ${error.message}` };
    }
  }
}

export const dataSourceService = new DataSourceService();
