import { Request, Response } from 'express';
import { menuService } from '../services/menu';
import { logger } from '../utils/logger';

export class MenuController {
  async getMenus(req: Request, res: Response) {
    try {
      const { keyword } = req.query;
      const menus = await menuService.findAll(keyword as string | undefined);
      res.json(menus);
    } catch (error) {
      logger.error('Get menus error:', error);
      res.status(500).json({ error: '获取菜单列表失败' });
    }
  }

  async getMenuTree(req: Request, res: Response) {
    try {
      const { keyword } = req.query;
      const menus = await menuService.findTree(keyword as string | undefined);
      res.json(menus);
    } catch (error) {
      logger.error('Get menu tree error:', error);
      res.status(500).json({ error: '获取菜单树失败' });
    }
  }

  async getMenu(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const menu = await menuService.findById(id);

      if (!menu) {
        res.status(404).json({ error: '菜单不存在' });
        return;
      }

      res.json(menu);
    } catch (error) {
      logger.error('Get menu error:', error);
      res.status(500).json({ error: '获取菜单详情失败' });
    }
  }

  async createMenu(req: Request, res: Response) {
    try {
      const { name, path, icon, parentId, sort } = req.body;

      if (!name || !path) {
        res.status(400).json({ error: '菜单名称和路径不能为空' });
        return;
      }

      const menu = await menuService.create({ name, path, icon, parentId, sort });
      logger.info(`Menu created: ${name}`);
      res.status(201).json(menu);
    } catch (error) {
      logger.error('Create menu error:', error);
      res.status(500).json({ error: '创建菜单失败' });
    }
  }

  async updateMenu(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, path, icon, parentId, sort, status } = req.body;

      const menu = await menuService.update(id, { name, path, icon, parentId, sort, status });
      logger.info(`Menu updated: ${id}`);
      res.json(menu);
    } catch (error) {
      logger.error('Update menu error:', error);
      res.status(500).json({ error: '更新菜单失败' });
    }
  }

  async deleteMenu(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await menuService.delete(id);
      logger.info(`Menu deleted: ${id}`);
      res.json({ message: '删除成功' });
    } catch (error) {
      logger.error('Delete menu error:', error);
      res.status(500).json({ error: '删除菜单失败' });
    }
  }
}

export const menuController = new MenuController();
