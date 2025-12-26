import request from '@/utils/request'

export interface Room {
  id: number
  property_id: number
  name: string
  max_guests: number
  base_price: number
  status: 'active' | 'inactive' | 'maintenance'
  cleaning_status?: 'clean' | 'dirty' | 'inspecting'
}

export interface RoomStock {
  id: number
  room_id: number
  biz_date: string
  status: 'available' | 'booked' | 'blocked'
  price: number
}

export interface UpdateStockParams {
  date: string
  status?: 'available' | 'blocked'
  price?: number
}

export function getRooms(propertyId?: number) {
  return request<{ data: Room[] }>({
    url: '/rooms',
    method: 'get',
    params: { property_id: propertyId }
  })
}

export function createRoom(data: Partial<Room>) {
  return request<{ data: Room }>({
    url: '/rooms',
    method: 'post',
    data
  })
}

export function getRoomCalendar(roomId: number, startDate: string, endDate: string) {
  return request<{ data: RoomStock[] }>({
    url: `/rooms/${roomId}/calendar`,
    method: 'get',
    params: { start_date: startDate, end_date: endDate }
  })
}

export function updateRoom(id: number, data: Partial<Room>) {
  return request({
    url: `/rooms/${id}`,
    method: 'put',
    data
  })
}

export function deleteRoom(id: number) {
  return request({
    url: `/rooms/${id}`,
    method: 'delete'
  })
}

export function updateRoomStock(roomId: number, data: UpdateStockParams) {
  return request({
    url: `/rooms/${roomId}/stock`,
    method: 'put',
    data
  })
}
