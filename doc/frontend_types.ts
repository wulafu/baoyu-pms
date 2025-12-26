// 后端接口类型定义 (可直接复制到前端项目中使用)

// 1. 通用响应结构
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

// 2. 核心实体模型
export interface User {
  id: number;
  nickname: string;
  phone: string;
  role: 'host' | 'guest' | 'admin';
  token?: string;
}

export interface Room {
  id: number;
  property_id: number;
  name: string;
  max_guests: number;
  base_price: number;
  status: 'active' | 'inactive' | 'maintenance';
  cleaning_status?: 'clean' | 'dirty' | 'inspecting';
}

export interface RoomStock {
  id: number;
  room_id: number;
  biz_date: string; // YYYY-MM-DD
  status: 'available' | 'booked' | 'blocked';
  price: number;
}

export interface Order {
  id: number;
  order_no: string;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  total_amount: number;
  check_in_date: string;
  check_out_date: string;
  guest_info: {
    name: string;
    phone: string;
  };
}

export interface ChannelMapping {
  id?: number;
  channel_code: string; // 'airbnb' | 'ctrip'
  channel_name: string;
  local_room_id: string;
  channel_room_id: string;
  sync_enabled: boolean;
}

export interface DashboardStats {
  today: {
    check_ins: number;
    check_outs: number;
  };
  month: {
    revenue: number;
    occupancy_rate: string;
  };
}

// 3. API 请求参数类型
export interface CreateOrderParams {
  user_id: number;
  room_id: number;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  total_amount: number;
  guest_info: {
    name: string;
    phone: string;
  };
}

export interface UpdateStockParams {
  date: string;
  status?: 'available' | 'blocked';
  price?: number;
}
