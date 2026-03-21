import mysql from 'mysql2/promise';
import mssql from 'mssql';

export interface DataSourceConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  type: 'mysql' | 'sqlserver';
}

export type MySqlConnection = mysql.Connection;
export type SqlServerConnection = mssql.ConnectionPool;

export async function createMySqlConnection(config: Omit<DataSourceConfig, 'type'> & { type: 'mysql' }): Promise<MySqlConnection> {
  return mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
  });
}

export async function createSqlServerConnection(config: Omit<DataSourceConfig, 'type'> & { type: 'sqlserver' }): Promise<SqlServerConnection> {
  const sqlServerConfig = {
    server: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };
  return mssql.connect(sqlServerConfig);
}

export async function createConnection(config: DataSourceConfig) {
  if (config.type === 'mysql') {
    return createMySqlConnection(config as Omit<DataSourceConfig, 'type'> & { type: 'mysql' });
  } else {
    return createSqlServerConnection(config as Omit<DataSourceConfig, 'type'> & { type: 'sqlserver' });
  }
}

export async function closeMySqlConnection(conn: MySqlConnection): Promise<void> {
  await conn.end();
}

export async function closeSqlServerConnection(conn: SqlServerConnection): Promise<void> {
  await conn.close();
}
