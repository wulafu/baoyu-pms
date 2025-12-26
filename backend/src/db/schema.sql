-- User Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    openid VARCHAR(100) UNIQUE NOT NULL,
    nickname VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'host' CHECK (role IN ('host', 'guest', 'admin')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Property Table
CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name VARCHAR(200) NOT NULL,
    address VARCHAR(500),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    description TEXT,
    facilities TEXT, -- JSON stored as TEXT
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Room Table
CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    max_guests INTEGER DEFAULT 2,
    base_price DECIMAL(10, 2) NOT NULL,
    images TEXT, -- JSON stored as TEXT
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id)
);

-- Room Stock Table
CREATE TABLE IF NOT EXISTS room_stocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,
    biz_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'booked', 'blocked')),
    price DECIMAL(10, 2),
    order_id INTEGER,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(room_id, biz_date),
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Order Table
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_no VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,
    source_channel VARCHAR(50) NOT NULL,
    external_order_id VARCHAR(100),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    nights INTEGER NOT NULL,
    guest_info TEXT NOT NULL, -- JSON stored as TEXT
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- Finance Table
CREATE TABLE IF NOT EXISTS finances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    remark TEXT,
    type VARCHAR(20) DEFAULT 'expense' CHECK (type IN ('income', 'expense')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id)
);

-- Property Channel Connection Table
CREATE TABLE IF NOT EXISTS property_channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    channel_code VARCHAR(50) NOT NULL, -- airbnb, booking, ctrip, meituan
    status VARCHAR(20) DEFAULT 'disconnected', -- connected, disconnected, error
    config TEXT, -- JSON for auth info
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(property_id, channel_code),
    FOREIGN KEY (property_id) REFERENCES properties(id)
);

-- Pricing & Automation Rules Table
CREATE TABLE IF NOT EXISTS rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'smart_close', 'price_weekend', 'price_long_stay'
    config TEXT NOT NULL, -- JSON: { "threshold": 0 } or { "days": [5,6], "increase_percent": 20 }
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id)
);

-- Channel Mapping Table
CREATE TABLE IF NOT EXISTS channel_mappings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    channel_code VARCHAR(50) NOT NULL,
    channel_name VARCHAR(100),
    local_room_id VARCHAR(100) NOT NULL,
    channel_room_id VARCHAR(100) NOT NULL,
    sync_enabled BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(property_id, channel_code, local_room_id),
    FOREIGN KEY (property_id) REFERENCES properties(id)
);
