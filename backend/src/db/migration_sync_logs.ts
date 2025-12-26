import { run } from '../utils/dbHelper';

const migrateLogs = async () => {
    try {
        console.log('Creating channel_sync_logs table...');
        await run(`
            CREATE TABLE IF NOT EXISTS channel_sync_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                channel_code VARCHAR(50) NOT NULL,
                room_id VARCHAR(50) NOT NULL,
                operation VARCHAR(50) NOT NULL,
                status VARCHAR(20) NOT NULL,
                details TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Migration completed.');
    } catch (error: any) {
        console.error('Migration failed:', error.message);
    }
};

migrateLogs();
