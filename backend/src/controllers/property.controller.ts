import { Request, Response } from 'express';
import { PropertyService } from '../services/property.service';

const propertyService = new PropertyService();

export class PropertyController {
  async getAll(req: Request, res: Response) {
    try {
      const properties = await propertyService.getAll();
      res.json({ data: properties });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const property = await propertyService.getById(id);
        if (!property) return res.status(404).json({ error: 'Property not found' });
        res.json({ data: property });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const property = await propertyService.create(req.body);
      res.status(201).json({ data: property });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await propertyService.update(id, req.body);
      res.json({ message: 'Property updated successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
