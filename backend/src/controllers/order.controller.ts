import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';

const orderService = new OrderService();

export class OrderController {
  async getAll(req: Request, res: Response) {
    try {
      const userId = req.query.user_id ? parseInt(req.query.user_id as string) : undefined;
      const orders = await orderService.getAll(userId);
      res.json({ data: orders });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const order = await orderService.create(req.body);
      res.status(201).json({ data: order });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const { status } = req.body;
        
        if (!['confirmed', 'checked_in', 'checked_out', 'cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        await orderService.updateStatus(id, status);
        res.json({ message: 'Order status updated successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
  }
}
