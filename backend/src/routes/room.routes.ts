import { Router } from 'express';
import { RoomController } from '../controllers/room.controller';

const router = Router();
const roomController = new RoomController();

router.get('/', roomController.getAll);
router.post('/', roomController.create);
router.put('/:id', roomController.update);
router.delete('/:id', roomController.delete);
router.get('/:id/calendar', roomController.getCalendar); // Get room stock/calendar
router.put('/:id/stock', roomController.updateStock); // Update daily stock (price/status)
router.put('/:id/cleaning', roomController.updateCleaningStatus); // Update cleaning status

export default router;
