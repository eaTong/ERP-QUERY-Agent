import { Request, Response, NextFunction } from 'express';
import { logError } from '../utils/logger';

/**
 * 全局错误处理中间件
 * 捕获所有未处理的错误，统一处理并记录日志
 */

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// 创建自定义错误类
export class HttpError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 错误处理中间件
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // 记录错误日志
  logError(err, {
    statusCode: err.statusCode,
    isOperational: err.isOperational,
  });

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : '服务器内部错误';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

// 异步处理器包装 - 自动捕获 Promise 错误
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 处理中间件
export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: '请求的资源不存在',
  });
}
