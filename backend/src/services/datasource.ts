import prisma from '../models';
import mysql from 'mysql2/promise';
import mssql from 'mssql';
import crypto from 'crypto';

// 加密密码
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'erp_query_agent_encrypt';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text: string): string {
  const [ivHex, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export class DataSourceService {
  async findAll() {
    return prisma.dataSource.findMany({
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
    const updateData: any = { ...data };
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
        const connection = await mysql.createConnection({
          host: dataSource.host,
          port: dataSource.port,
          user: dataSource.username,
          password: password,
          database: dataSource.database,
        });
        await connection.end();
        return { success: true, message: '连接成功' };
      } else if (dataSource.type === 'sqlserver') {
        const config = {
          server: dataSource.host,
          port: dataSource.port,
          user: dataSource.username,
          password: password,
          database: dataSource.database,
          options: {
            encrypt: false,
            trustServerCertificate: true,
          },
        };
        const pool = await mssql.connect(config);
        await pool.close();
        return { success: true, message: '连接成功' };
      }

      return { success: false, message: '不支持的数据库类型' };
    } catch (error: any) {
      return { success: false, message: `连接失败: ${error.message}` };
    }
  }

  async getTables(id: string): Promise<string[]> {
    const dataSource = await prisma.dataSource.findUnique({
      where: { id },
    });

    if (!dataSource) {
      throw new Error('数据源不存在');
    }

    const password = decrypt(dataSource.password);

    try {
      if (dataSource.type === 'mysql') {
        const connection = await mysql.createConnection({
          host: dataSource.host,
          port: dataSource.port,
          user: dataSource.username,
          password: password,
          database: dataSource.database,
        });
        const [rows] = await connection.query('SHOW TABLES');
        await connection.end();
        return (rows as any[]).map((row: any) => Object.values(row)[0] as string);
      } else if (dataSource.type === 'sqlserver') {
        const config = {
          server: dataSource.host,
          port: dataSource.port,
          user: dataSource.username,
          password: password,
          database: dataSource.database,
          options: {
            encrypt: false,
            trustServerCertificate: true,
          },
        };
        const pool = await mssql.connect(config);
        const result = await pool.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'");
        await pool.close();
        return result.recordset.map((row: any) => row.TABLE_NAME);
      }

      return [];
    } catch (error) {
      console.error('Error getting tables:', error);
      return [];
    }
  }

  async getTableFields(id: string, tableName: string): Promise<any[]> {
    const dataSource = await prisma.dataSource.findUnique({
      where: { id },
    });

    if (!dataSource) {
      throw new Error('数据源不存在');
    }

    const password = decrypt(dataSource.password);

    try {
      if (dataSource.type === 'mysql') {
        const connection = await mysql.createConnection({
          host: dataSource.host,
          port: dataSource.port,
          user: dataSource.username,
          password: password,
          database: dataSource.database,
        });
        const [rows] = await connection.query(`DESCRIBE \`${tableName}\``);
        await connection.end();
        return rows as any[];
      } else if (dataSource.type === 'sqlserver') {
        const config = {
          server: dataSource.host,
          port: dataSource.port,
          user: dataSource.username,
          password: password,
          database: dataSource.database,
          options: {
            encrypt: false,
            trustServerCertificate: true,
          },
        };
        const pool = await mssql.connect(config);
        const result = await pool.query(
          `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableName}'`
        );
        await pool.close();
        return result.recordset;
      }

      return [];
    } catch (error) {
      console.error('Error getting table fields:', error);
      return [];
    }
  }
}

export const dataSourceService = new DataSourceService();
