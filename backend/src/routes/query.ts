import { Router } from 'express';
import { QueryController } from '../controllers/query';
import { requireAuth } from '../middleware/auth';

const router = Router();
const controller = new QueryController();

// 查询接口超时设置（5分钟）
const queryTimeout = 5 * 60 * 1000;

router.use(requireAuth);
router.post('/', (req, res, next) => {
  req.setTimeout(queryTimeout, () => {
    console.warn(`Query request timeout after ${queryTimeout}ms`);
  });
  next();
}, controller.query);
router.get('/history', controller.getHistory);
router.post('/analyze', controller.analyze);

export { router as queryRouter };
