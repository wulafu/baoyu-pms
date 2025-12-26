import { run, get, all } from '../utils/dbHelper';
import { Order } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

export class OrderService {
  async getAll(userId?: number): Promise<Order[]> {
    let sql = 'SELECT * FROM orders';
    const params: any[] = [];
    if (userId) {
        sql += ' WHERE user_id = ?';
        params.push(userId);
    }
    const orders = await all<Order>(sql, params);
    return orders.map(o => ({
        ...o,
        guest_info: typeof o.guest_info === 'string' ? JSON.parse(o.guest_info) : o.guest_info
    }));
  }

  async create(order: Order): Promise<Order> {
    const orderNo = 'BY' + Date.now(); // Simple order no generation
    
    // Transaction logic should be here (SQLite supports it via serialization or BEGIN/COMMIT)
    // For now, simple steps
    
    // 1. Check stock
    // 2. Create Order
    // 3. Update Stock
    
    const result = await run(
      `INSERT INTO orders (
        order_no, user_id, room_id, source_channel, 
        check_in_date, check_out_date, nights, 
        guest_info, total_amount, status
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNo,
        order.user_id,
        order.room_id,
        order.source_channel || 'direct',
        order.check_in_date,
        order.check_out_date,
        order.nights,
        JSON.stringify(order.guest_info),
        order.total_amount,
        'confirmed' // Auto confirm for now
      ]
    );

    // Update stocks
    await run(
        `UPDATE room_stocks SET status = 'booked', order_id = ? 
         WHERE room_id = ? AND biz_date >= ? AND biz_date < ?`,
        [result.id, order.room_id, order.check_in_date, order.check_out_date]
    );

    const newOrder = await get<Order>('SELECT * FROM orders WHERE id = ?', [result.id]);
    if (!newOrder) throw new Error('Failed to create order');
    
    return {
        ...newOrder,
        guest_info: typeof newOrder.guest_info === 'string' ? JSON.parse(newOrder.guest_info) : newOrder.guest_info
    };
  }

  async getById(id: number): Promise<Order | undefined> {
    const order = await get<Order>('SELECT * FROM orders WHERE id = ?', [id]);
    if (order) {
        order.guest_info = typeof order.guest_info === 'string' ? JSON.parse(order.guest_info) : order.guest_info;
    }
    return order;
  }

  async updateStatus(id: number, status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'): Promise<void> {
    const order = await this.getById(id);
    if (!order) throw new Error('Order not found');

    // If cancelling, release stock
    if (status === 'cancelled' && order.status !== 'cancelled') {
        await run(
            `UPDATE room_stocks SET status = 'available', order_id = NULL 
             WHERE order_id = ?`,
            [id]
        );
    }

    await run('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
  }
}
