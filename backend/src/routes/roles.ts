import { Router } from 'express';
import { roleController } from '../controllers/role';
import { requireAuth } from '../middleware/auth';

const router = Router();

// 所有路由需要登录
router.use(requireAuth);

router.get('/', (req, res) => roleController.getRoles(req, res));
router.get('/:id', (req, res) => roleController.getRole(req, res));
router.post('/', (req, res) => roleController.createRole(req, res));
router.put('/:id', (req, res) => roleController.updateRole(req, res));
router.delete('/:id', (req, res) => roleController.deleteRole(req, res));
router.put('/:id/menus', (req, res) => roleController.assignMenus(req, res));

export { router as roleRouter };
