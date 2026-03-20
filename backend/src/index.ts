import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { queryRouter } from './routes/query';
import { dataRouter } from './routes/data';
import { reportsRouter } from './routes/reports';
import { authRouter } from './routes/auth';
import { userRouter } from './routes/users';
import { roleRouter } from './routes/roles';
import { menuRouter } from './routes/menus';
import { dataSourceRouter } from './routes/dataSources';
import { tableMappingRouter } from './routes/tableMappings';
import { fieldMappingRouter } from './routes/fieldMappings';
import { promptRuleRouter } from './routes/promptRules';
import { historyRouter } from './routes/history';
import { logger } from './utils/logger';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { sessionMiddleware } from './middleware/session';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);

// 请求日志中间件
app.use(requestLogger);

// Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/query', queryRouter);
app.use('/api/data', dataRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/roles', roleRouter);
app.use('/api/menus', menuRouter);
app.use('/api/data-sources', dataSourceRouter);
app.use('/api/table-mappings', tableMappingRouter);
app.use('/api/field-mappings', fieldMappingRouter);
app.use('/api/prompt-rules', promptRuleRouter);
app.use('/api/query/history', historyRouter);

// 错误处理中间件
app.use(errorHandler);

// 404 handler
app.use(notFoundHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;
