import request from '@/utils/request'

export interface Room {
  id: number
  name: string
  type: string
  base_price: number
}

export interface RoomStock {
  id: number
  room_id: number
  biz_date: string // YYYY-MM-DD
  status: 'available' | 'booked' | 'blocked'
  price: number
}

export const getRooms = () => {
  return request<{ data: Room[] }>({
    url: '/rooms',
    method: 'get'
  })
}

export const getRoomCalendar = (roomId: number, start: string, end: string) => {
  return request<{ data: RoomStock[] }>({
    url: `/rooms/${roomId}/calendar`,
    method: 'get',
    params: { start, end }
  })
}

export const updateRoomStock = (roomId: number, data: { date: string, status: string, price: number }) => {
  return request({
    url: `/rooms/${roomId}/stock`,
    method: 'post',
    data
  })
}
