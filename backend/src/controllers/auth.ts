import { Request, Response } from 'express';
import { authService } from '../services/auth';
import { logger } from '../utils/logger';

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: '用户名和密码不能为空' });
        return;
      }

      const user = await authService.validateUser(username, password);

      if (!user) {
        res.status(401).json({ error: '用户名或密码错误' });
        return;
      }

      // 设置 session
      (req.session as any).userId = user.id;
      (req.session as any).username = user.username;

      logger.info(`User logged in: ${username}`);

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({ error: '登录失败' });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const username = (req.session as any).username;
      req.session.destroy((err) => {
        if (err) {
          logger.error('Logout error:', err);
          res.status(500).json({ error: '登出失败' });
          return;
        }
        logger.info(`User logged out: ${username}`);
        res.json({ message: '登出成功' });
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({ error: '登出失败' });
    }
  }

  async me(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;

      if (!userId) {
        res.status(401).json({ error: '未登录' });
        return;
      }

      const user = await authService.getUserById(userId);

      if (!user) {
        res.status(401).json({ error: '用户不存在' });
        return;
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      });
    } catch (error) {
      logger.error('Get current user error:', error);
      res.status(500).json({ error: '获取用户信息失败' });
    }
  }

  async getMenus(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;

      if (!userId) {
        res.status(401).json({ error: '未登录' });
        return;
      }

      const menus = await authService.getUserMenus(userId);
      res.json(menus);
    } catch (error) {
      logger.error('Get user menus error:', error);
      res.status(500).json({ error: '获取用户菜单失败' });
    }
  }
}

export const authController = new AuthController();
