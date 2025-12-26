import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../../baoyu.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run('PRAGMA foreign_keys = ON');
    db.run('PRAGMA journal_mode = WAL'); // Enable Write-Ahead Logging for better concurrency
    db.run('PRAGMA busy_timeout = 5000'); // Wait up to 5000ms for lock
  }
});

export default db;
