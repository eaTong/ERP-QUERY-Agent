import { Router } from 'express';
import { historyController } from '../controllers/history';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', (req, res) => historyController.getHistory(req, res));
router.delete('/:id', (req, res) => historyController.deleteHistory(req, res));

export { router as historyRouter };
