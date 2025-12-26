import { run, all } from '../utils/dbHelper';

export interface Finance {
  id?: number;
  property_id?: number;
  category: string;
  amount: number;
  date: string;
  remark?: string;
  type?: 'income' | 'expense';
  created_at?: string;
}

export class FinanceService {
  async getAll(propertyId?: number) {
    let sql = 'SELECT * FROM finances';
    const params: any[] = [];
    
    if (propertyId) {
      sql += ' WHERE property_id = ?';
      params.push(propertyId);
    }
    
    sql += ' ORDER BY date DESC';
    return await all(sql, params);
  }

  async create(data: Finance) {
    const sql = `
      INSERT INTO finances (property_id, category, amount, date, remark, type)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
      data.property_id || null,
      data.category,
      data.amount,
      data.date,
      data.remark || '',
      data.type || 'expense'
    ];
    
    const result: any = await run(sql, params);
    return { id: result.id, ...data };
  }
}
