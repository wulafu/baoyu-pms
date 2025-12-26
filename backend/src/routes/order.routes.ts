import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';

const router = Router();
const orderController = new OrderController();

router.get('/', orderController.getAll);
router.post('/', orderController.create);
router.put('/:id/status', orderController.updateStatus);

export default router;
