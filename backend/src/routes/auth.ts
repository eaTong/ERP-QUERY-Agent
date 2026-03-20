import { Router } from 'express';
import { authController } from '../controllers/auth';

const router = Router();

router.post('/login', (req, res) => authController.login(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));
router.get('/me', (req, res) => authController.me(req, res));
router.get('/menus', (req, res) => authController.getMenus(req, res));

export { router as authRouter };
