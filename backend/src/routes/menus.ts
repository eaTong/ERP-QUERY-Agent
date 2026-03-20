import { Router } from 'express';
import { menuController } from '../controllers/menu';
import { requireAuth } from '../middleware/auth';

const router = Router();

// 所有路由需要登录
router.use(requireAuth);

router.get('/', (req, res) => menuController.getMenus(req, res));
router.get('/tree', (req, res) => menuController.getMenuTree(req, res));
router.get('/:id', (req, res) => menuController.getMenu(req, res));
router.post('/', (req, res) => menuController.createMenu(req, res));
router.put('/:id', (req, res) => menuController.updateMenu(req, res));
router.delete('/:id', (req, res) => menuController.deleteMenu(req, res));

export { router as menuRouter };
