import { run, get, all } from '../utils/dbHelper';
import { Room, RoomStock } from '../models/types';
import { ChannelService } from './channel.service';

const channelService = new ChannelService();

export class RoomService {
  async getAll(propertyId?: number): Promise<Room[]> {
    let sql = 'SELECT * FROM rooms';
    const params: any[] = [];
    
    if (propertyId) {
      sql += ' WHERE property_id = ?';
      params.push(propertyId);
    }
    
    const rooms = await all<Room>(sql, params);
    return rooms.map(r => ({
        ...r,
        images: r.images ? JSON.parse(r.images as unknown as string) : []
    }));
  }

  async create(data: any): Promise<Room> {
    const result = await run(
      'INSERT INTO rooms (property_id, name, base_price, status) VALUES (?, ?, ?, ?)',
      [data.property_id, data.name, data.base_price, 'active']
    );
    return await get<Room>('SELECT * FROM rooms WHERE id = ?', [result.id]) as Room;
  }

  async update(id: number, data: any): Promise<void> {
    await run(
      'UPDATE rooms SET name = ?, base_price = ?, status = ? WHERE id = ?',
      [data.name, data.base_price, data.status, id]
    );
  }

  async delete(id: number): Promise<void> {
    await run('DELETE FROM rooms WHERE id = ?', [id]);
  }

  async getCalendar(roomId: number, startDate: string, endDate: string): Promise<RoomStock[]> {
    return await all<RoomStock>(
        'SELECT * FROM room_stocks WHERE room_id = ? AND biz_date BETWEEN ? AND ?',
        [roomId, startDate, endDate]
    );
  }

  async updateCleaningStatus(roomId: number, status: 'clean' | 'dirty' | 'inspecting'): Promise<void> {
    await run('UPDATE rooms SET cleaning_status = ? WHERE id = ?', [status, roomId]);
  }

  async updateStock(roomId: number, date: string, data: { price?: number; status?: 'available' | 'booked' | 'blocked' }): Promise<void> {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.price !== undefined) {
      updates.push('price = ?');
      params.push(data.price);
    }

    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);
    }

    if (updates.length === 0) return;

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(roomId, date);

    await run(
      `UPDATE room_stocks SET ${updates.join(', ')} WHERE room_id = ? AND biz_date = ?`,
      params
    );

    // Trigger Async Channel Sync
    if (data.status) {
        channelService.syncStockToChannel(roomId, date, data.status).catch(console.error);
    }
  }
}
