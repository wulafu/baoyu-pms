import { Request, Response } from 'express';
import { ReportService } from '../services/report.service';

const reportService = new ReportService();

export class ReportController {
  async getDashboardStats(req: Request, res: Response) {
    try {
        const propertyId = req.query.property_id ? parseInt(req.query.property_id as string) : undefined;
        const stats = await reportService.getDashboardStats(propertyId);
        res.json({ data: stats });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
  }

  async getRevenueTrend(req: Request, res: Response) {
    try {
        const propertyId = req.query.property_id ? parseInt(req.query.property_id as string) : undefined;
        const trend = await reportService.getRevenueTrend(propertyId);
        res.json({ data: trend });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
  }

  async getChannelStats(req: Request, res: Response) {
    try {
        const propertyId = req.query.property_id ? parseInt(req.query.property_id as string) : undefined;
        const stats = await reportService.getChannelStats(propertyId);
        res.json({ data: stats });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
  }
}
