import type React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { api } from '../services/api'
import type { AuthContextType, User } from '../types'

interface AuthApiUser {
  id: string
  email: string
  emailConfirmed?: boolean
  createdAt?: string
}

interface AuthApiSession {
  access_token: string
  refresh_token: string
  expires_at?: number
}

interface AuthApiResponse {
  message?: string
  user?: AuthApiUser
  session?: AuthApiSession
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) {
      // Supabase未設定の場合は即座にローディング解除し、非ログイン扱い
      setLoading(false)
      return
    }
    // 初期セッション取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? {
        id: session.user.id,
        email: session.user.email!,
        created_at: session.user.created_at
      } : null)
      setLoading(false)
    })

    // 認証状態変更監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        void _event
        setUser(session?.user ? {
          id: session.user.id,
          email: session.user.email!,
          created_at: session.user.created_at
        } : null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const clearError = () => setError(null)

  const signIn = async (email: string, password: string): Promise<AuthApiResponse> => {
    try {
      setError(null)
      setLoading(true)
      if (!supabase) throw new Error('Supabase is not configured')
      const response = await api.post('/auth/login', {
        email,
        password,
      })

      if (response.data.session) {
        // Set the session in Supabase client for consistency
        await supabase.auth.setSession({
          access_token: response.data.session.access_token,
          refresh_token: response.data.session.refresh_token,
        })
      }
      // 即時に user state を更新して ProtectedRoute の再リダイレクトを防ぐ
      if (response.data.user) {
        setUser({
          id: response.data.user.id,
          email: response.data.user.email,
          created_at: response.data.user.createdAt || new Date().toISOString()
        })
      }
      return response.data as AuthApiResponse
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Login failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, confirmPassword: string): Promise<AuthApiResponse> => {
    try {
      setError(null)
      setLoading(true)
      if (!supabase) throw new Error('Supabase is not configured')
      const response = await api.post('/auth/register', {
        email,
        password,
        confirmPassword,
      })

      if (response.data.session) {
        // Set the session in Supabase client for consistency
        await supabase.auth.setSession({
          access_token: response.data.session.access_token,
          refresh_token: response.data.session.refresh_token,
        })
      }

      // メール確認不要で session がすぐ得られた場合は user を即設定
      if (response.data.user && (response.data.session || response.data.user.emailConfirmed)) {
        setUser({
          id: response.data.user.id,
          email: response.data.user.email,
          created_at: response.data.user.createdAt || new Date().toISOString()
        })
      }

      return response.data as AuthApiResponse
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Registration failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      setLoading(true)
      if (!supabase) throw new Error('Supabase is not configured')
      // Call our backend logout endpoint
      await api.post('/auth/logout')

      // Also sign out from Supabase client
      await supabase.auth.signOut()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Logout failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setError(null)

      const response = await api.post('/auth/reset-password', {
        email,
      })

      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Password reset failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const refreshToken = async () => {
    try {
      if (!supabase) return
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.refresh_token) {
        const response = await api.post('/auth/refresh', {
          refresh_token: session.refresh_token,
        })

        if (response.data.session) {
          await supabase.auth.setSession({
            access_token: response.data.session.access_token,
            refresh_token: response.data.session.refresh_token,
          })
        }
      }
    } catch (err: any) {
      console.error('Token refresh failed:', err)
      // If refresh fails, sign out the user
      await signOut().catch((signOutErr) => {
        console.error('Sign out failed after token refresh failure:', signOutErr);
      })
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshToken,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}