import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // Default no password
  database: process.env.DB_NAME || 'baoyu_pms',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  port: parseInt(process.env.DB_PORT || '3306')
});

export default pool;
