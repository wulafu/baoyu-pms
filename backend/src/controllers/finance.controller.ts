import { Request, Response } from 'express';
import { FinanceService } from '../services/finance.service';

const financeService = new FinanceService();

export class FinanceController {
  async getAll(req: Request, res: Response) {
    try {
      const propertyId = req.query.property_id ? parseInt(req.query.property_id as string) : undefined;
      const data = await financeService.getAll(propertyId);
      res.json({ data });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = await financeService.create(req.body);
      res.status(201).json({ data });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
