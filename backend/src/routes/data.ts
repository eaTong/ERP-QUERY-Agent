import { Router } from 'express';
import { DataController } from '../controllers/data';

const router = Router();
const controller = new DataController();

router.get('/:entity', controller.getData);

export { router as dataRouter };
