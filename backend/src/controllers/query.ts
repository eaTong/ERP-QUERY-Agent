import { Request, Response } from 'express';
import { aiService } from '../services/ai';
import { queryService } from '../services/query';
import { logger } from '../utils/logger';

export class QueryController {
  async query(req: Request, res: Response) {
    try {
      const { query } = req.body;
      const userId = (req.session as any).userId;

      if (!query) {
        res.status(400).json({ error: '查询语句不能为空' });
        return;
      }

      logger.info(`AI Query request: ${query}`);

      const result = await aiService.query(query);

      // 保存查询历史
      await queryService.createHistory({
        userId,
        query,
        sql: result.sql,
        tables: result.tables,
        status: 1,
      });

      logger.info(`AI Query success: ${result.tables.join(', ')}`);

      res.json(result);
    } catch (error: any) {
      logger.error('AI Query error:', error);
      res.status(500).json({ error: error.message || '查询失败' });
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const history = await queryService.getHistory(userId);
      res.json(history);
    } catch (error: any) {
      logger.error('Get query history error:', error);
      res.status(500).json({ error: '获取查询历史失败' });
    }
  }
}

export const queryController = new QueryController();
