import { Router } from 'express';
import { RuleController } from '../controllers/rule.controller';

const router = Router();
const ruleController = new RuleController();

router.get('/', ruleController.getAll);
router.post('/', ruleController.create);
router.patch('/:id/toggle', ruleController.toggle);

export default router;
