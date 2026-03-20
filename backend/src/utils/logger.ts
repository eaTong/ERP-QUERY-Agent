import winston from 'winston';
import path from 'path';
import fs from 'fs';

// 确保日志目录存在
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 自定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...metadata }) => {
    let log = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    if (Object.keys(metadata).length > 0) {
      log += ` ${JSON.stringify(metadata)}`;
    }
    if (stack) {
      log += `\n${stack}`;
    }
    return log;
  })
);

// 创建 logger 实例
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // 文件输出 - 错误日志
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 30,
    }),
    // 文件输出 - 全部日志
    new winston.transports.File({
      filename: path.join(logDir, 'app.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 30,
    }),
  ],
});

// 便捷方法
export const logRequest = (req: {
  method: string;
  path: string;
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
}, res: { statusCode: number }, duration: number) => {
  const meta = {
    method: req.method,
    path: req.path,
    status: res.statusCode,
    duration: `${duration}ms`,
    params: req.params,
    query: req.query,
    body: req.body,
  };

  if (res.statusCode >= 500) {
    logger.error(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`, meta);
  } else if (res.statusCode >= 400) {
    logger.warn(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`, meta);
  } else {
    logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`, meta);
  }
};

export const logError = (error: Error, context?: Record<string, unknown>) => {
  logger.error(error.message, { stack: error.stack, ...context });
};
