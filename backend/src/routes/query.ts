import { Router } from 'express';
import { QueryController } from '../controllers/query';
import { requireAuth } from '../middleware/auth';

const router = Router();
const controller = new QueryController();

router.use(requireAuth);
router.post('/', controller.query);
router.get('/history', controller.getHistory);

export { router as queryRouter };
