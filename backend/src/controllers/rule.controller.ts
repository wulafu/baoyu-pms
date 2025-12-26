import { Request, Response } from 'express';
import { RuleService } from '../services/rule.service';

const ruleService = new RuleService();

export class RuleController {
  async getAll(req: Request, res: Response) {
    try {
      const propertyId = req.query.property_id ? parseInt(req.query.property_id as string) : 1;
      const rules = await ruleService.getAll(propertyId);
      res.json({ data: rules });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const rule = await ruleService.create(req.body);
      res.status(201).json({ data: rule });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async toggle(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { is_active } = req.body;
      await ruleService.toggle(id, is_active);
      res.json({ message: 'Rule status updated' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
