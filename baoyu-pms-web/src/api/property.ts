import request from '@/utils/request'

export interface Property {
  id: number
  user_id: number
  name: string
  address: string
  description?: string
  phone?: string
}

export function getProperties() {
  return request<{ data: Property[] }>({
    url: '/properties',
    method: 'get'
  })
}

export function updateProperty(id: number, data: Partial<Property>) {
  return request({
    url: `/properties/${id}`,
    method: 'put',
    data
  })
}
