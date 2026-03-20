import { Request, Response } from 'express';
import { promptRuleService } from '../services/promptRule';
import { logger } from '../utils/logger';

export class PromptRuleController {
  async getPromptRules(req: Request, res: Response) {
    try {
      const { enabled } = req.query;

      let promptRules;
      if (enabled === '1') {
        promptRules = await promptRuleService.findEnabled();
      } else {
        promptRules = await promptRuleService.findAll();
      }

      res.json(promptRules);
    } catch (error) {
      logger.error('Get prompt rules error:', error);
      res.status(500).json({ error: '获取提示词规则列表失败' });
    }
  }

  async getPromptRule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const promptRule = await promptRuleService.findById(id);

      if (!promptRule) {
        res.status(404).json({ error: '提示词规则不存在' });
        return;
      }

      res.json(promptRule);
    } catch (error) {
      logger.error('Get prompt rule error:', error);
      res.status(500).json({ error: '获取提示词规则详情失败' });
    }
  }

  async createPromptRule(req: Request, res: Response) {
    try {
      const { name, description, content, enabled } = req.body;

      if (!name || !content) {
        res.status(400).json({ error: '规则名称和内容不能为空' });
        return;
      }

      const promptRule = await promptRuleService.create({
        name,
        description,
        content,
        enabled,
      });

      logger.info(`Prompt rule created: ${name}`);
      res.status(201).json(promptRule);
    } catch (error: any) {
      logger.error('Create prompt rule error:', error);
      if (error.code === 'P2002') {
        res.status(400).json({ error: '规则名称已存在' });
        return;
      }
      res.status(500).json({ error: '创建提示词规则失败' });
    }
  }

  async updatePromptRule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, content, enabled } = req.body;

      const promptRule = await promptRuleService.update(id, {
        name,
        description,
        content,
        enabled,
      });

      logger.info(`Prompt rule updated: ${id}`);
      res.json(promptRule);
    } catch (error) {
      logger.error('Update prompt rule error:', error);
      res.status(500).json({ error: '更新提示词规则失败' });
    }
  }

  async deletePromptRule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await promptRuleService.delete(id);
      logger.info(`Prompt rule deleted: ${id}`);
      res.json({ message: '删除成功' });
    } catch (error) {
      logger.error('Delete prompt rule error:', error);
      res.status(500).json({ error: '删除提示词规则失败' });
    }
  }
}

export const promptRuleController = new PromptRuleController();
