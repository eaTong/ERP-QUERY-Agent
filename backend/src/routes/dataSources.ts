import { Router } from 'express';
import { dataSourceController } from '../controllers/datasource';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', (req, res) => dataSourceController.getDataSources(req, res));
router.get('/:id', (req, res) => dataSourceController.getDataSource(req, res));
router.post('/', (req, res) => dataSourceController.createDataSource(req, res));
router.put('/:id', (req, res) => dataSourceController.updateDataSource(req, res));
router.delete('/:id', (req, res) => dataSourceController.deleteDataSource(req, res));
router.post('/:id/test', (req, res) => dataSourceController.testConnection(req, res));
router.get('/:id/tables', (req, res) => dataSourceController.getTables(req, res));
router.get('/:id/fields/:tableName', (req, res) => dataSourceController.getTableFields(req, res));

export { router as dataSourceRouter };
