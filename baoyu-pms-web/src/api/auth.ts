import request from '@/utils/request'

export interface LoginData {
  code: string
}

export interface RegisterData {
  nickname: string
  phone: string
}

export interface AuthResponse {
  token: string
  user: {
    id: number
    nickname: string
    role: string
  }
}

export function login(data: LoginData) {
  return request<AuthResponse>({
    url: '/auth/login',
    method: 'post',
    data
  })
}

export function register(data: RegisterData) {
  return request<AuthResponse>({
    url: '/auth/register',
    method: 'post',
    data
  })
}
