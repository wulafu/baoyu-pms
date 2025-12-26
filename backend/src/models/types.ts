export interface User {
    id?: number;
    openid: string;
    nickname: string;
    phone: string;
    role: 'host' | 'guest' | 'admin';
    created_at?: string;
}

export interface Property {
    id?: number;
    user_id: number;
    name: string;
    address: string;
    latitude?: number;
    longitude?: number;
    description?: string;
    facilities?: string[]; // Stored as JSON string in DB
    created_at?: string;
}

export interface Room {
    id?: number;
    property_id: number;
    name: string;
    max_guests: number;
    base_price: number;
    images?: string[]; // Stored as JSON string in DB
    status: 'active' | 'inactive' | 'maintenance';
    cleaning_status?: 'clean' | 'dirty' | 'inspecting';
    created_at?: string;
}

export interface RoomStock {
    id?: number;
    room_id: number;
    biz_date: string; // YYYY-MM-DD
    status: 'available' | 'booked' | 'blocked';
    price: number;
    order_id?: number;
    updated_at?: string;
}

export interface Order {
    id?: number;
    order_no: string;
    user_id: number;
    room_id: number;
    source_channel: string;
    external_order_id?: string;
    check_in_date: string;
    check_out_date: string;
    nights: number;
    guest_info: {
        name: string;
        phone: string;
        id_card?: string;
    };
    total_amount: number;
    status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
    created_at?: string;
}
