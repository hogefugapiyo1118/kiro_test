/// <reference types="vite/client" />
import axios from 'axios'
import { supabase } from '../lib/supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  if (!supabase) return config
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

  if (error.response?.status === 401 && !originalRequest._retry && supabase) {
      originalRequest._retry = true

      try {
        // Try to refresh the token
  const { data: { session } } = await supabase.auth.refreshSession()

        if (session?.access_token) {
          // Update the authorization header and retry the request
          originalRequest.headers.Authorization = `Bearer ${session.access_token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
      }

      // If refresh fails, redirect to login
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

// Study API functions
export const studyApi = {
  // Start a study session
  startSession: async (limit: number = 10) => {
    const response = await api.get(`/study/session?limit=${limit}`)
    return response.data
  },

  // Record study result
  recordResult: async (vocabularyId: string, isCorrect: boolean, responseTime?: number) => {
    const response = await api.post('/study/result', {
      vocabulary_id: vocabularyId,
      is_correct: isCorrect,
      response_time: responseTime
    })
    return response.data
  },

  // Get study statistics
  getStats: async (vocabularyId?: string) => {
    const params = vocabularyId ? `?vocabulary_id=${vocabularyId}` : ''
    const response = await api.get(`/study/stats${params}`)
    return response.data
  },

  // Get study history
  getHistory: async (limit: number = 50) => {
    const response = await api.get(`/study/history?limit=${limit}`)
    return response.data
  }
}

export default api