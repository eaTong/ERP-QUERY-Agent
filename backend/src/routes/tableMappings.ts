import { Router } from 'express';
import { tableMappingController } from '../controllers/tableMapping';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', (req, res) => tableMappingController.getTableMappings(req, res));
router.get('/:id', (req, res) => tableMappingController.getTableMapping(req, res));
router.post('/', (req, res) => tableMappingController.createTableMapping(req, res));
router.put('/:id', (req, res) => tableMappingController.updateTableMapping(req, res));
router.delete('/:id', (req, res) => tableMappingController.deleteTableMapping(req, res));

export { router as tableMappingRouter };
