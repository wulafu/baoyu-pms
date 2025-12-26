import { run } from '../utils/dbHelper';

const updateSchema = async () => {
    try {
        console.log('Adding cleaning_status to rooms table...');
        await run(`ALTER TABLE rooms ADD COLUMN cleaning_status VARCHAR(20) DEFAULT 'clean'`);
        console.log('Schema updated successfully.');
    } catch (error: any) {
        // Ignore if column already exists (SQLite throws error)
        if (!error.message.includes('duplicate column name')) {
            console.error('Error updating schema:', error.message);
        } else {
            console.log('Column already exists.');
        }
    }
};

updateSchema();
