import { Router } from 'express';
import { promptRuleController } from '../controllers/promptRule';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', (req, res) => promptRuleController.getPromptRules(req, res));
router.get('/:id', (req, res) => promptRuleController.getPromptRule(req, res));
router.post('/', (req, res) => promptRuleController.createPromptRule(req, res));
router.put('/:id', (req, res) => promptRuleController.updatePromptRule(req, res));
router.delete('/:id', (req, res) => promptRuleController.deletePromptRule(req, res));

export { router as promptRuleRouter };
