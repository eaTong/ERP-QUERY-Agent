import { Request, Response } from 'express';
import { dataSourceService } from '../services/datasource';
import { logger } from '../utils/logger';

export class DataSourceController {
  async getDataSources(_req: Request, res: Response) {
    try {
      const dataSources = await dataSourceService.findAll();
      res.json(dataSources);
    } catch (error) {
      logger.error('Get data sources error:', error);
      res.status(500).json({ error: '获取数据源列表失败' });
    }
  }

  async getDataSource(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const dataSource = await dataSourceService.findById(id);

      if (!dataSource) {
        res.status(404).json({ error: '数据源不存在' });
        return;
      }

      res.json(dataSource);
    } catch (error) {
      logger.error('Get data source error:', error);
      res.status(500).json({ error: '获取数据源详情失败' });
    }
  }

  async createDataSource(req: Request, res: Response) {
    try {
      const { name, type, host, port, database, username, password, description } = req.body;

      if (!name || !type || !host || !port || !database || !username || !password) {
        res.status(400).json({ error: '缺少必填字段' });
        return;
      }

      const dataSource = await dataSourceService.create({
        name,
        type,
        host,
        port: Number(port),
        database,
        username,
        password,
        description,
      });

      logger.info(`Data source created: ${name}`);
      res.status(201).json(dataSource);
    } catch (error) {
      logger.error('Create data source error:', error);
      res.status(500).json({ error: '创建数据源失败' });
    }
  }

  async updateDataSource(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, type, host, port, database, username, password, description, status } = req.body;

      const dataSource = await dataSourceService.update(id, {
        name,
        type,
        host,
        port: port ? Number(port) : undefined,
        database,
        username,
        password,
        description,
        status,
      });

      logger.info(`Data source updated: ${id}`);
      res.json(dataSource);
    } catch (error) {
      logger.error('Update data source error:', error);
      res.status(500).json({ error: '更新数据源失败' });
    }
  }

  async deleteDataSource(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await dataSourceService.delete(id);
      logger.info(`Data source deleted: ${id}`);
      res.json({ message: '删除成功' });
    } catch (error) {
      logger.error('Delete data source error:', error);
      res.status(500).json({ error: '删除数据源失败' });
    }
  }

  async testConnection(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await dataSourceService.testConnection(id);
      res.json(result);
    } catch (error) {
      logger.error('Test connection error:', error);
      res.status(500).json({ error: '测试连接失败' });
    }
  }

  async getTables(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await dataSourceService.getTables(id);
      if (result.error) {
        res.status(400).json({ error: result.error });
        return;
      }
      res.json({ tables: result.tables });
    } catch (error: any) {
      logger.error('Get tables error:', error);
      res.status(500).json({ error: error.message || '获取表列表失败' });
    }
  }

  async getTableFields(req: Request, res: Response) {
    try {
      const { id, tableName } = req.params;
      const result = await dataSourceService.getTableFields(id, decodeURIComponent(tableName));
      if (result.error) {
        res.status(400).json({ error: result.error });
        return;
      }
      res.json({ fields: result.fields });
    } catch (error: any) {
      logger.error('Get table fields error:', error);
      res.status(500).json({ error: error.message || '获取字段列表失败' });
    }
  }
}

export const dataSourceController = new DataSourceController();
