import request from '@/utils/request'
import type { ApiResponse } from './types'

export interface DashboardStats {
  today: {
    check_ins: number
    check_outs: number
  }
  month: {
    revenue: number
    occupancy_rate: string
  }
}

export interface TrendData {
  date: string
  amount: number
}

export interface ChannelData {
  name: string
  value: number
}

export function getDashboardStats(propertyId?: number) {
  return request<ApiResponse<DashboardStats>>({
    url: '/reports/dashboard',
    method: 'get',
    params: { property_id: propertyId }
  })
}

export function getRevenueTrend(propertyId?: number) {
  return request<ApiResponse<TrendData[]>>({
    url: '/reports/trend',
    method: 'get',
    params: { property_id: propertyId }
  })
}

export function getChannelStats(propertyId?: number) {
  return request<ApiResponse<ChannelData[]>>({
    url: '/reports/channels',
    method: 'get',
    params: { property_id: propertyId }
  })
}
