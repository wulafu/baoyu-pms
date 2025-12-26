import { run, all } from '../utils/dbHelper';
import dayjs from 'dayjs';

const seedFull = async () => {
    try {
        console.log('Starting full data seeding...');

        // 1. Ensure User
        let user = await all<{id: number}>('SELECT id FROM users LIMIT 1');
        let userId = user[0]?.id;
        if (!userId) {
             const res = await run(
                'INSERT INTO users (openid, nickname, role) VALUES (?, ?, ?)',
                ['seed_openid', 'Demo Host', 'host']
             );
             userId = res.id;
        }

        // 2. Ensure Property
        let prop = await all<{id: number}>('SELECT id FROM properties LIMIT 1');
        let propId = prop[0]?.id;
        if (!propId) {
             const res = await run(
                'INSERT INTO properties (user_id, name, address) VALUES (?, ?, ?)',
                [userId, 'Baoyu Demo Villa', '123 Tech Park']
             );
             propId = res.id;
        }

        // 3. Create Rooms (if not enough)
        const roomNames = ['Ocean Suite', 'Garden Room', 'Family Loft'];
        const rooms: number[] = [];
        
        for (const name of roomNames) {
            let room = await all<{id: number}>('SELECT id FROM rooms WHERE name = ?', [name]);
            if (room.length === 0) {
                 const res = await run(
                    'INSERT INTO rooms (property_id, name, base_price, status) VALUES (?, ?, ?, ?)',
                    [propId, name, Math.floor(Math.random() * 300) + 300, 'active']
                 );
                 rooms.push(res.id);
            } else {
                 rooms.push(room[0].id);
            }
        }

        // 4. Create Orders (Past 7 days + Future)
        const channels = ['airbnb', 'ctrip', 'direct', 'meituan'];
        
        // Generate 20 random orders
        for (let i = 0; i < 20; i++) {
            const roomId = rooms[Math.floor(Math.random() * rooms.length)];
            const daysOffset = Math.floor(Math.random() * 14) - 7; // -7 to +7 days
            const checkIn = dayjs().add(daysOffset, 'day');
            const nights = Math.floor(Math.random() * 3) + 1;
            const checkOut = checkIn.add(nights, 'day');
            
            const channel = channels[Math.floor(Math.random() * channels.length)];
            const status = daysOffset < 0 ? 'checked_out' : (daysOffset === 0 ? 'checked_in' : 'confirmed');
            
            await run(
                `INSERT INTO orders (
                    order_no, user_id, room_id, source_channel, 
                    check_in_date, check_out_date, nights, 
                    guest_info, total_amount, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    `AUTO_${Date.now()}_${i}`, userId, roomId, channel,
                    checkIn.format('YYYY-MM-DD'),
                    checkOut.format('YYYY-MM-DD'),
                    nights, 
                    JSON.stringify({ name: `Guest ${i}`, phone: '13800000000' }), 
                    nights * 400, 
                    status,
                    checkIn.subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss')
                ]
            );
        }

        console.log('Full data seeding completed.');
        process.exit(0);
    } catch (error: any) {
        console.error('Error seeding data:', error.message);
        process.exit(1);
    }
};

seedFull();
