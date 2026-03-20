import { Request, Response } from 'express';
import { fieldMappingService } from '../services/fieldMapping';
import { logger } from '../utils/logger';

export class FieldMappingController {
  async getFieldMappings(req: Request, res: Response) {
    try {
      const { tableMappingId } = req.params;
      const fieldMappings = await fieldMappingService.findByTableMappingId(tableMappingId);
      res.json(fieldMappings);
    } catch (error) {
      logger.error('Get field mappings error:', error);
      res.status(500).json({ error: '获取字段映射列表失败' });
    }
  }

  async createFieldMapping(req: Request, res: Response) {
    try {
      const { tableMappingId } = req.params;
      const { externalFieldName, localAlias, fieldDescription, displayRules, enabled } = req.body;

      if (!externalFieldName || !localAlias) {
        res.status(400).json({ error: '缺少必填字段' });
        return;
      }

      const fieldMapping = await fieldMappingService.create({
        tableMappingId,
        externalFieldName,
        localAlias,
        fieldDescription,
        displayRules,
        enabled,
      });

      logger.info(`Field mapping created: ${localAlias}`);
      res.status(201).json(fieldMapping);
    } catch (error: any) {
      logger.error('Create field mapping error:', error);
      if (error.code === 'P2002') {
        res.status(400).json({ error: '该表映射下已存在相同别名的字段映射' });
        return;
      }
      res.status(500).json({ error: '创建字段映射失败' });
    }
  }

  async updateFieldMapping(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { externalFieldName, localAlias, fieldDescription, displayRules, enabled } = req.body;

      const fieldMapping = await fieldMappingService.update(id, {
        externalFieldName,
        localAlias,
        fieldDescription,
        displayRules,
        enabled,
      });

      logger.info(`Field mapping updated: ${id}`);
      res.json(fieldMapping);
    } catch (error) {
      logger.error('Update field mapping error:', error);
      res.status(500).json({ error: '更新字段映射失败' });
    }
  }

  async deleteFieldMapping(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await fieldMappingService.delete(id);
      logger.info(`Field mapping deleted: ${id}`);
      res.json({ message: '删除成功' });
    } catch (error) {
      logger.error('Delete field mapping error:', error);
      res.status(500).json({ error: '删除字段映射失败' });
    }
  }

  async syncFields(req: Request, res: Response) {
    try {
      const { tableMappingId } = req.params;
      logger.info(`Syncing fields for table mapping: ${tableMappingId}`);

      const result = await fieldMappingService.syncFieldsFromExternal(tableMappingId);

      if (result.success) {
        logger.info(`Fields synced successfully: ${result.created}/${result.total}`);
        res.json({
          message: `同步成功，共 ${result.total} 个字段，创建了 ${result.created} 个新字段映射`,
          ...result,
        });
      } else {
        logger.error(`Fields sync failed: ${result.errors.join(', ')}`);
        res.status(400).json({
          error: result.errors.join(', ') || '同步失败',
          ...result,
        });
      }
    } catch (error: any) {
      logger.error('Sync fields error:', error);
      res.status(500).json({ error: '同步字段映射失败' });
    }
  }
}

export const fieldMappingController = new FieldMappingController();
