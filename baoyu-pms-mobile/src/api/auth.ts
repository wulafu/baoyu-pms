import request from '@/utils/request'

export interface LoginParams {
  code?: string
  phone?: string
  password?: string
}

export interface RegisterParams {
  nickname: string
  phone: string
  password?: string
}

export interface AuthResponse {
  token: string
  user: {
    id: number
    name: string
    role: string
  }
}

export const login = (data: LoginParams) => {
  return request<AuthResponse>({
    url: '/auth/login',
    method: 'post',
    data
  })
}

export const register = (data: RegisterParams) => {
  return request<AuthResponse>({
    url: '/auth/register',
    method: 'post',
    data
  })
}
