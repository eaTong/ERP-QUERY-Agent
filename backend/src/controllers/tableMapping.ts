import { Request, Response } from 'express';
import { tableMappingService } from '../services/tableMapping';
import { logger } from '../utils/logger';

export class TableMappingController {
  async getTableMappings(req: Request, res: Response) {
    try {
      const { dataSourceId } = req.query;

      let tableMappings;
      if (dataSourceId) {
        tableMappings = await tableMappingService.findByDataSourceId(dataSourceId as string);
      } else {
        tableMappings = await tableMappingService.findAll();
      }

      res.json(tableMappings);
    } catch (error) {
      logger.error('Get table mappings error:', error);
      res.status(500).json({ error: '获取表映射列表失败' });
    }
  }

  async getTableMapping(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tableMapping = await tableMappingService.findById(id);

      if (!tableMapping) {
        res.status(404).json({ error: '表映射不存在' });
        return;
      }

      res.json(tableMapping);
    } catch (error) {
      logger.error('Get table mapping error:', error);
      res.status(500).json({ error: '获取表映射详情失败' });
    }
  }

  async createTableMapping(req: Request, res: Response) {
    try {
      const { dataSourceId, externalTableName, localAlias, useCase, queryRules, enabled } = req.body;

      if (!dataSourceId || !externalTableName || !localAlias) {
        res.status(400).json({ error: '缺少必填字段' });
        return;
      }

      const tableMapping = await tableMappingService.create({
        dataSourceId,
        externalTableName,
        localAlias,
        useCase,
        queryRules,
        enabled,
      });

      logger.info(`Table mapping created: ${localAlias}`);
      res.status(201).json(tableMapping);
    } catch (error: any) {
      logger.error('Create table mapping error:', error);
      if (error.code === 'P2002') {
        res.status(400).json({ error: '该数据源下已存在相同别名的映射' });
        return;
      }
      res.status(500).json({ error: '创建表映射失败' });
    }
  }

  async updateTableMapping(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { externalTableName, localAlias, useCase, queryRules, enabled } = req.body;

      const tableMapping = await tableMappingService.update(id, {
        externalTableName,
        localAlias,
        useCase,
        queryRules,
        enabled,
      });

      logger.info(`Table mapping updated: ${id}`);
      res.json(tableMapping);
    } catch (error) {
      logger.error('Update table mapping error:', error);
      res.status(500).json({ error: '更新表映射失败' });
    }
  }

  async deleteTableMapping(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await tableMappingService.delete(id);
      logger.info(`Table mapping deleted: ${id}`);
      res.json({ message: '删除成功' });
    } catch (error) {
      logger.error('Delete table mapping error:', error);
      res.status(500).json({ error: '删除表映射失败' });
    }
  }
}

export const tableMappingController = new TableMappingController();
