import { Request, Response } from 'express';
import { historyService } from '../services/history';
import { logger } from '../utils/logger';

export class HistoryController {
  async getHistory(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;

      if (!userId) {
        res.status(401).json({ error: '请先登录' });
        return;
      }

      const history = await historyService.findByUserId(userId);

      // 转换数据格式
      const data = history.map((h) => ({
        id: h.id,
        query: h.query,
        sql: h.sql,
        tables: h.tables ? h.tables.split(',') : [],
        status: h.status,
        createdAt: h.createdAt.toISOString(),
      }));

      res.json({ data });
    } catch (error) {
      logger.error('Get history error:', error);
      res.status(500).json({ error: '获取历史记录失败' });
    }
  }

  async deleteHistory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req.session as any).userId;

      if (!userId) {
        res.status(401).json({ error: '请先登录' });
        return;
      }

      await historyService.delete(id, userId);
      res.json({ message: '删除成功' });
    } catch (error) {
      logger.error('Delete history error:', error);
      res.status(500).json({ error: '删除历史记录失败' });
    }
  }
}

export const historyController = new HistoryController();
