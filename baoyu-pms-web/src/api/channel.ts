import request from '@/utils/request'
import type { ApiResponse, ChannelMapping, SyncLog } from '@/api/types'

export function getChannels(propertyId?: number) {
  return request<ApiResponse<any[]>>({
    url: '/channels',
    method: 'get',
    params: { property_id: propertyId }
  })
}

export function getAuthUrl(channelCode: string) {
  return request<{ url: string }>({
    url: `/channels/${channelCode}/auth-url`,
    method: 'get'
  })
}

export function handleAuthCallback(channelCode: string, code: string, propertyId?: number) {
  return request({
    url: `/channels/${channelCode}/auth-callback`,
    method: 'post',
    data: { code, property_id: propertyId }
  })
}

export function disconnectChannel(channelCode: string, propertyId?: number) {
  return request({
    url: '/channels/disconnect',
    method: 'post',
    data: { channel_code: channelCode, property_id: propertyId }
  })
}

export function getChannelRooms(channelCode: string, propertyId?: number) {
  return request<ApiResponse<any[]>>({
    url: `/channels/${channelCode}/rooms`,
    method: 'get',
    params: { property_id: propertyId }
  })
}

export function getChannelMappings(propertyId?: number) {
  return request<ApiResponse<ChannelMapping[]>>({
    url: '/channels/mappings',
    method: 'get',
    params: { property_id: propertyId }
  })
}

export function updateChannelMapping(data: ChannelMapping) {
  return request({
    url: '/channels/mappings',
    method: 'post',
    data
  })
}

export function getSyncLogs() {
  return request<ApiResponse<SyncLog[]>>({
    url: '/channels/logs',
    method: 'get'
  })
}
