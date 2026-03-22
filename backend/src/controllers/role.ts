import { Request, Response } from 'express';
import { roleService } from '../services/role';
import { logger } from '../utils/logger';

export class RoleController {
  async getRoles(req: Request, res: Response) {
    try {
      const { keyword } = req.query;
      const roles = await roleService.findAll(keyword as string | undefined);
      res.json(roles);
    } catch (error) {
      logger.error('Get roles error:', error);
      res.status(500).json({ error: '获取角色列表失败' });
    }
  }

  async getRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const role = await roleService.findById(id);

      if (!role) {
        res.status(404).json({ error: '角色不存在' });
        return;
      }

      res.json(role);
    } catch (error) {
      logger.error('Get role error:', error);
      res.status(500).json({ error: '获取角色详情失败' });
    }
  }

  async createRole(req: Request, res: Response) {
    try {
      const { name, code, description } = req.body;

      if (!name || !code) {
        res.status(400).json({ error: '角色名称和代码不能为空' });
        return;
      }

      const role = await roleService.create({ name, code, description });
      logger.info(`Role created: ${name}`);
      res.status(201).json(role);
    } catch (error: any) {
      logger.error('Create role error:', error);
      if (error.code === 'P2002') {
        res.status(400).json({ error: '角色代码已存在' });
        return;
      }
      res.status(500).json({ error: '创建角色失败' });
    }
  }

  async updateRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, code, description, status } = req.body;

      const role = await roleService.update(id, { name, code, description, status });
      logger.info(`Role updated: ${id}`);
      res.json(role);
    } catch (error) {
      logger.error('Update role error:', error);
      res.status(500).json({ error: '更新角色失败' });
    }
  }

  async deleteRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await roleService.delete(id);
      logger.info(`Role deleted: ${id}`);
      res.json({ message: '删除成功' });
    } catch (error) {
      logger.error('Delete role error:', error);
      res.status(500).json({ error: '删除角色失败' });
    }
  }

  async assignMenus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { menuIds } = req.body;

      if (!Array.isArray(menuIds)) {
        res.status(400).json({ error: '菜单ID列表格式错误' });
        return;
      }

      const role = await roleService.assignMenus(id, menuIds);
      logger.info(`Menus assigned to role ${id}:`, menuIds);
      res.json(role);
    } catch (error) {
      logger.error('Assign menus error:', error);
      res.status(500).json({ error: '分配菜单失败' });
    }
  }
}

export const roleController = new RoleController();
