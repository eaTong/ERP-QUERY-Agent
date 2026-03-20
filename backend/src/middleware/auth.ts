import { Request, Response, NextFunction } from 'express';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.session as any).userId;

  if (!userId) {
    res.status(401).json({ error: '请先登录' });
    return;
  }

  next();
};
