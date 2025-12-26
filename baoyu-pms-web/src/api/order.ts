import request from '@/utils/request'

export interface Order {
  id: number
  order_no: string
  room_id: number
  guest_info: {
    name: string
    phone: string
  }
  total_amount: number
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'
  check_in_date: string
  check_out_date: string
  created_at: string
  source_channel: string
}

export interface CreateOrderParams {
  user_id: number
  room_id: number
  check_in_date: string
  check_out_date: string
  nights: number
  total_amount: number
  guest_info: {
    name: string
    phone: string
  }
}

export function createOrder(data: CreateOrderParams) {
  return request({
    url: '/orders',
    method: 'post',
    data
  })
}

export function getOrders(params?: any) {
  return request<{ data: Order[] }>({
    url: '/orders',
    method: 'get',
    params
  })
}

export function updateOrderStatus(orderId: number, status: string) {
  return request({
    url: `/orders/${orderId}/status`,
    method: 'put',
    data: { status }
  })
}
