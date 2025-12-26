import { run, all } from '../utils/dbHelper';
import dayjs from 'dayjs';

const seedReports = async () => {
    try {
        console.log('Seeding demo data for reports...');

        // 1. Create a dummy room if not exists
        let rooms = await all<{id: number}>('SELECT id FROM rooms LIMIT 1');
        let roomId = rooms[0]?.id;
        
        if (!roomId) {
             const res = await run(
                'INSERT INTO rooms (property_id, name, base_price, status) VALUES (?, ?, ?, ?)',
                [1, 'Demo Room', 300, 'active']
             );
             roomId = res.id;
        }

        // 2. Create some past orders in this month
        const startOfMonth = dayjs().startOf('month');
        
        // Order 1: Completed stay
        await run(
            `INSERT INTO orders (
                order_no, user_id, room_id, source_channel, 
                check_in_date, check_out_date, nights, 
                guest_info, total_amount, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                'SEED_001', 1, roomId, 'direct',
                startOfMonth.add(1, 'day').format('YYYY-MM-DD'),
                startOfMonth.add(3, 'day').format('YYYY-MM-DD'),
                2, JSON.stringify({ name: 'Guest A' }), 600, 'checked_out',
                startOfMonth.add(1, 'day').format('YYYY-MM-DD HH:mm:ss')
            ]
        );

        // Order 2: Current stay (Today)
        const today = dayjs();
        await run(
            `INSERT INTO orders (
                order_no, user_id, room_id, source_channel, 
                check_in_date, check_out_date, nights, 
                guest_info, total_amount, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                'SEED_002', 1, roomId, 'airbnb',
                today.format('YYYY-MM-DD'),
                today.add(2, 'day').format('YYYY-MM-DD'),
                2, JSON.stringify({ name: 'Guest B' }), 700, 'checked_in',
                today.format('YYYY-MM-DD HH:mm:ss')
            ]
        );

        // 3. Update Stocks for these orders
        // (Simplified: just marking them as booked in stock table)
        // ... (Skipping detailed stock logic for seed, focusing on order stats)

        console.log('Demo data seeded successfully.');
    } catch (error: any) {
        console.error('Error seeding data:', error.message);
    }
};

seedReports();
