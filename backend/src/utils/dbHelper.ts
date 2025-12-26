import pool from '../config/mysql';

export const run = async (sql: string, params: any[] = []): Promise<{ id: number }> => {
  const [result] = await pool.execute(sql, params);
  return { id: (result as any).insertId };
};

export const get = async <T>(sql: string, params: any[] = []): Promise<T | undefined> => {
  const [rows] = await pool.execute(sql, params);
  return (rows as any[])[0] as T;
};

export const all = async <T>(sql: string, params: any[] = []): Promise<T[]> => {
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
};
