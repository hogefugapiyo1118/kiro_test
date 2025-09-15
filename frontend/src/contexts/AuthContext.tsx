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
  // 同時ログイン要求多重送信防止用フラグ
  const [authInFlight, setAuthInFlight] = useState(false)

  useEffect(() => {
    let cancelled = false
    const AUTH_INIT_TIMEOUT_MS = 5000

    const finish = (nextUser: User | null) => {
      if (cancelled) return
      setUser(nextUser)
      setLoading(false)
    }

    // Supabase が未設定ならすぐ終了
    if (!supabase) {
      finish(null)
      return
    }

    const init = async () => {
      try {
        // getSession がハングするケースへのタイムアウト対策
        const timeoutPromise = new Promise<null>((resolve) => {
          setTimeout(() => resolve(null), AUTH_INIT_TIMEOUT_MS)
        })

        // supabase はこの時点では null ではないはずだが型ガード
        const sessionPromise = (supabase as typeof supabase)!.auth.getSession().then(({ data: { session } }) => session)
        const session = await Promise.race([sessionPromise, timeoutPromise])

        if (session && 'user' in session && session?.user) {
          finish({
            id: session.user.id,
            email: session.user.email!,
            created_at: session.user.created_at
          })
        } else {
          // タイムアウトもしくは未ログイン
          finish(null)
        }
      } catch (e) {
        // 失敗しても無限ローディングは避ける
        // eslint-disable-next-line no-console
        console.error('[Auth] 初期セッション取得に失敗しました', e)
        finish(null)
      }
    }

    void init()

    // 認証状態変更監視 (init 後も最新化)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return
      finish(session?.user ? {
        id: session.user.id,
        email: session.user.email!,
        created_at: session.user.created_at
      } : null)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  const clearError = () => setError(null)

  const signIn = async (email: string, password: string): Promise<AuthApiResponse> => {
    try {
      if (authInFlight) {
        return { message: 'Auth request already in progress' }
      }
      setError(null)
      setLoading(true)
      setAuthInFlight(true)
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
      setAuthInFlight(false)
    }
  }

  const signUp = async (email: string, password: string, confirmPassword: string): Promise<AuthApiResponse> => {
    try {
      if (authInFlight) {
        return { message: 'Auth request already in progress' }
      }
      setError(null)
      setLoading(true)
      setAuthInFlight(true)
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
      setAuthInFlight(false)
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