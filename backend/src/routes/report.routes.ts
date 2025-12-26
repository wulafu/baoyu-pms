import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';

const router = Router();
const reportController = new ReportController();

router.get('/dashboard', reportController.getDashboardStats);
router.get('/trend', reportController.getRevenueTrend);
router.get('/channels', reportController.getChannelStats);

export default router;
