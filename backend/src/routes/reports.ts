import { Router } from 'express';
import { ReportsController } from '../controllers/reports';

const router = Router();
const controller = new ReportsController();

router.get('/', controller.listReports);
router.post('/', controller.generateReport);

export { router as reportsRouter };
