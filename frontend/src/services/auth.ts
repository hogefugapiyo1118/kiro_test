import { api } from './api'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  message: string
  user: {
    id: string
    email: string
    emailConfirmed: boolean
    createdAt?: string
    lastSignIn?: string
  }
  session?: {
    access_token: string
    refresh_token: string
    expires_at: number
  }
}

export interface ResetPasswordRequest {
  email: string
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data)
    return response.data
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  async logout(): Promise<{ message: string }> {
    const response = await api.post('/auth/logout')
    return response.data
  },

  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    const response = await api.post('/auth/reset-password', data)
    return response.data
  },

  async refreshToken(data: RefreshTokenRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/refresh', data)
    return response.data
  },

  async getProfile(): Promise<{ user: AuthResponse['user'] }> {
    const response = await api.get('/auth/profile')
    return response.data
  }
}

export default authService