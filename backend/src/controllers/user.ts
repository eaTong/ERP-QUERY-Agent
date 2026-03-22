import { Request, Response } from 'express';
import { userService } from '../services/user';
import { logger } from '../utils/logger';

export class UserController {
  async getUsers(req: Request, res: Response) {
    try {
      const { keyword } = req.query;
      const users = await userService.findAll(keyword as string | undefined);
      res.json(users);
    } catch (error) {
      logger.error('Get users error:', error);
      res.status(500).json({ error: '获取用户列表失败' });
    }
  }

  async getUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await userService.findById(id);

      if (!user) {
        res.status(404).json({ error: '用户不存在' });
        return;
      }

      res.json(user);
    } catch (error) {
      logger.error('Get user error:', error);
      res.status(500).json({ error: '获取用户详情失败' });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const { username, password, email } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: '用户名和密码不能为空' });
        return;
      }

      const user = await userService.create({ username, password, email });
      logger.info(`User created: ${username}`);
      res.status(201).json(user);
    } catch (error: any) {
      logger.error('Create user error:', error);
      if (error.code === 'P2002') {
        res.status(400).json({ error: '用户名已存在' });
        return;
      }
      res.status(500).json({ error: '创建用户失败' });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { email, avatar, status } = req.body;

      const user = await userService.update(id, { email, avatar, status });
      logger.info(`User updated: ${id}`);
      res.json(user);
    } catch (error) {
      logger.error('Update user error:', error);
      res.status(500).json({ error: '更新用户失败' });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await userService.delete(id);
      logger.info(`User deleted: ${id}`);
      res.json({ message: '删除成功' });
    } catch (error) {
      logger.error('Delete user error:', error);
      res.status(500).json({ error: '删除用户失败' });
    }
  }

  async updatePassword(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        res.status(400).json({ error: '旧密码和新密码不能为空' });
        return;
      }

      const success = await userService.updatePassword(id, oldPassword, newPassword);

      if (!success) {
        res.status(400).json({ error: '旧密码错误' });
        return;
      }

      logger.info(`Password updated for user: ${id}`);
      res.json({ message: '密码修改成功' });
    } catch (error) {
      logger.error('Update password error:', error);
      res.status(500).json({ error: '修改密码失败' });
    }
  }

  async assignRoles(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { roleIds } = req.body;

      if (!Array.isArray(roleIds)) {
        res.status(400).json({ error: '角色ID列表格式错误' });
        return;
      }

      const user = await userService.assignRoles(id, roleIds);
      logger.info(`Roles assigned to user ${id}:`, roleIds);
      res.json(user);
    } catch (error) {
      logger.error('Assign roles error:', error);
      res.status(500).json({ error: '分配角色失败' });
    }
  }
}

export const userController = new UserController();
