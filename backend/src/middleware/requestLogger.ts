import { Request, Response, NextFunction } from 'express';
import { logRequest } from '../utils/logger';

/**
 * 请求日志中间件
 * 记录所有接口请求、参数、状态码、耗时
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  // 过滤敏感字段
  const sanitizeBody = (body: Record<string, unknown>) => {
    if (!body) return undefined;
    const sensitiveFields = ['password', 'token', 'secret', 'authorization'];
    const sanitized = { ...body };
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***';
      }
    }
    return sanitized;
  };

  // 响应完成后记录日志
  res.on('finish', () => {
    const duration = Date.now() - start;

    logRequest(
      {
        method: req.method,
        path: req.path,
        params: req.params,
        query: req.query,
        body: sanitizeBody(req.body as Record<string, unknown>),
      },
      res,
      duration
    );
  });

  next();
}
