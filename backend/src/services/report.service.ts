import { get, all } from '../utils/dbHelper';
import dayjs from 'dayjs';

export class ReportService {
  async getDashboardStats(propertyId?: number): Promise<any> {
    const today = dayjs().format('YYYY-MM-DD');
    const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
    const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');

    // 1. Today's Overview
    // Check-ins
    let checkInSql = `SELECT COUNT(*) as count FROM orders WHERE check_in_date = ? AND status IN ('confirmed', 'checked_in')`;
    // Check-outs
    let checkOutSql = `SELECT COUNT(*) as count FROM orders WHERE check_out_date = ? AND status IN ('checked_in', 'checked_out')`;
    
    // 2. Month Revenue
    let revenueSql = `SELECT SUM(total_amount) as total FROM orders WHERE created_at BETWEEN ? AND ? AND status != 'cancelled'`;
    
    // 3. Occupancy Rate (Simple calc: booked nights / total room nights in month)
    // Get total rooms
    let roomCountSql = `SELECT COUNT(*) as count FROM rooms WHERE status = 'active'`;
    
    // Get booked nights in this month
    // Note: This is a simplified calculation. Ideally we query room_stocks for exact booked days.
    let bookedStockSql = `SELECT COUNT(*) as count FROM room_stocks WHERE biz_date BETWEEN ? AND ? AND status = 'booked'`;

    const params = propertyId ? [propertyId] : []; // Need to adjust SQL for propertyId filtering if needed

    // Executing queries
    const checkIns = await get<{ count: number }>(checkInSql, [today]);
    const checkOuts = await get<{ count: number }>(checkOutSql, [today]);
    const revenue = await get<{ total: number }>(revenueSql, [startOfMonth + ' 00:00:00', endOfMonth + ' 23:59:59']);
    const roomCount = await get<{ count: number }>(roomCountSql);
    const bookedStocks = await get<{ count: number }>(bookedStockSql, [startOfMonth, endOfMonth]);

    const totalRooms = roomCount?.count || 0;
    const daysInMonth = dayjs().daysInMonth();
    const totalAvailableNights = totalRooms * daysInMonth;
    const bookedNights = bookedStocks?.count || 0;
    
    const occupancyRate = totalAvailableNights > 0 ? (bookedNights / totalAvailableNights * 100).toFixed(2) : 0;

    return {
        today: {
            check_ins: checkIns?.count || 0,
            check_outs: checkOuts?.count || 0,
        },
        month: {
            revenue: revenue?.total || 0,
            occupancy_rate: occupancyRate
        }
    };
  }

  async getRevenueTrend(propertyId?: number): Promise<{ date: string; amount: number }[]> {
      const days = 7;
      const trend = [];
      for (let i = days - 1; i >= 0; i--) {
          const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
          const sql = `
            SELECT SUM(total_amount) as total 
            FROM orders 
            WHERE created_at LIKE ? AND status != 'cancelled'
            ${propertyId ? 'AND room_id IN (SELECT id FROM rooms WHERE property_id = ?)' : ''}
          `;
          const params: any[] = [`${date}%`];
          if (propertyId) params.push(propertyId);
          
          const result = await get<{ total: number }>(sql, params);
          trend.push({ date, amount: result?.total || 0 });
      }
      return trend;
  }

  async getChannelStats(propertyId?: number): Promise<{ name: string; value: number }[]> {
      const sql = `
        SELECT source_channel as name, COUNT(*) as value 
        FROM orders 
        WHERE status != 'cancelled'
        ${propertyId ? 'AND room_id IN (SELECT id FROM rooms WHERE property_id = ?)' : ''}
        GROUP BY source_channel
      `;
      const params = propertyId ? [propertyId] : [];
      return await all<{ name: string; value: number }>(sql, params);
  }
}
