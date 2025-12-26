import { all } from '../utils/dbHelper';

const check = async () => {
    try {
        console.log('Checking MySQL database baoyu_pms...');
        
        try {
            const users = await all<any>('SELECT COUNT(*) as count FROM users');
            console.log('Users count:', users[0].count);
        } catch (e) { console.log('Table users not found or empty'); }

        try {
            const rooms = await all<any>('SELECT COUNT(*) as count FROM rooms');
            console.log('Rooms count:', rooms[0].count);
        } catch (e) { console.log('Table rooms not found or empty'); }

        try {
            const orders = await all<any>('SELECT COUNT(*) as count FROM orders');
            console.log('Orders count:', orders[0].count);
        } catch (e) { console.log('Table orders not found or empty'); }

    } catch (error: any) {
        console.error('Database connection failed:', error.message);
        console.log('Please ensure you have created the database "baoyu_pms" and updated the .env file with correct credentials.');
    }
    process.exit(0);
};

check();
