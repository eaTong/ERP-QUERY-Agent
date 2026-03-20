import { Router } from 'express';
import { userController } from '../controllers/user';
import { requireAuth } from '../middleware/auth';

const router = Router();

// 所有路由需要登录
router.use(requireAuth);

router.get('/', (req, res) => userController.getUsers(req, res));
router.get('/:id', (req, res) => userController.getUser(req, res));
router.post('/', (req, res) => userController.createUser(req, res));
router.put('/:id', (req, res) => userController.updateUser(req, res));
router.delete('/:id', (req, res) => userController.deleteUser(req, res));
router.put('/:id/password', (req, res) => userController.updatePassword(req, res));
router.put('/:id/roles', (req, res) => userController.assignRoles(req, res));

export { router as userRouter };
