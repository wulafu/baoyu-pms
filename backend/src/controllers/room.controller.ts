import { Request, Response } from 'express';
import { RoomService } from '../services/room.service';

const roomService = new RoomService();

export class RoomController {
  async getAll(req: Request, res: Response) {
    try {
      const propertyId = req.query.property_id ? parseInt(req.query.property_id as string) : undefined;
      const rooms = await roomService.getAll(propertyId);
      res.json({ data: rooms });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const room = await roomService.create(req.body);
      res.status(201).json({ data: room });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await roomService.update(id, req.body);
      res.json({ message: 'Room updated successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await roomService.delete(id);
      res.json({ message: 'Room deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCalendar(req: Request, res: Response) {
    try {
        const roomId = parseInt(req.params.id);
        const { start_date, end_date } = req.query;
        
        if (!start_date || !end_date) {
            return res.status(400).json({ error: 'start_date and end_date are required' });
        }

        const stocks = await roomService.getCalendar(roomId, start_date as string, end_date as string);
        res.json({ data: stocks });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
  }

  async updateStock(req: Request, res: Response) {
    try {
        const roomId = parseInt(req.params.id);
        const { date, price, status } = req.body;

        if (!date) {
            return res.status(400).json({ error: 'date is required' });
        }

        await roomService.updateStock(roomId, date, { price, status });
        res.json({ message: 'Stock updated successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
  }

  async updateCleaningStatus(req: Request, res: Response) {
    try {
        const roomId = parseInt(req.params.id);
        const { status } = req.body;
        
        if (!['clean', 'dirty', 'inspecting'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        await roomService.updateCleaningStatus(roomId, status);
        res.json({ message: 'Cleaning status updated successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
  }
}
