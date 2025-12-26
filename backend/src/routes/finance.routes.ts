import { Router } from 'express';
import { FinanceController } from '../controllers/finance.controller';

const router = Router();
const financeController = new FinanceController();

router.get('/', financeController.getAll);
router.post('/', financeController.create);

export default router;
