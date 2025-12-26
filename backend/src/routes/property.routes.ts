import { Router } from 'express';
import { PropertyController } from '../controllers/property.controller';

const router = Router();
const propertyController = new PropertyController();

router.get('/', propertyController.getAll);
router.get('/:id', propertyController.getById);
router.post('/', propertyController.create);
router.put('/:id', propertyController.update);

export default router;
