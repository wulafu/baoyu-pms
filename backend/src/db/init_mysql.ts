import { run } from '../utils/dbHelper';

const initMySQL = async () => {
    try {
        console.log('Initializing MySQL schema...');

        await run(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                openid VARCHAR(255) NOT NULL,
                nickname VARCHAR(255),
                phone VARCHAR(50),
                role VARCHAR(50) DEFAULT 'guest',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await run(`
            CREATE TABLE IF NOT EXISTS properties (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                address TEXT,
                description TEXT,
                phone VARCHAR(50),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        await run(`
            CREATE TABLE IF NOT EXISTS rooms (
                id INT AUTO_INCREMENT PRIMARY KEY,
                property_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                max_guests INT DEFAULT 2,
                base_price INT NOT NULL,
                status VARCHAR(50) DEFAULT 'active',
                cleaning_status VARCHAR(50) DEFAULT 'clean',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (property_id) REFERENCES properties(id)
            )
        `);

        await run(`
            CREATE TABLE IF NOT EXISTS room_stocks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                room_id INT NOT NULL,
                biz_date DATE NOT NULL,
                status VARCHAR(50) DEFAULT 'available',
                price INT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_stock (room_id, biz_date),
                FOREIGN KEY (room_id) REFERENCES rooms(id)
            )
        `);

        await run(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_no VARCHAR(100) NOT NULL UNIQUE,
                user_id INT NOT NULL,
                room_id INT NOT NULL,
                source_channel VARCHAR(50) DEFAULT 'direct',
                check_in_date DATE NOT NULL,
                check_out_date DATE NOT NULL,
                nights INT DEFAULT 1,
                guest_info JSON,
                total_amount INT NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (room_id) REFERENCES rooms(id)
            )
        `);

        await run(`
            CREATE TABLE IF NOT EXISTS channel_mappings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                property_id INT NOT NULL,
                channel_code VARCHAR(50) NOT NULL,
                channel_name VARCHAR(100),
                local_room_id INT NOT NULL,
                channel_room_id VARCHAR(100),
                sync_enabled BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await run(`
            CREATE TABLE IF NOT EXISTS channel_sync_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                channel_code VARCHAR(50) NOT NULL,
                room_id VARCHAR(50) NOT NULL,
                operation VARCHAR(50) NOT NULL,
                status VARCHAR(20) NOT NULL,
                details TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('MySQL schema initialized successfully.');
        process.exit(0);
    } catch (error: any) {
        console.error('MySQL initialization failed:', error.message);
        process.exit(1);
    }
};

initMySQL();
