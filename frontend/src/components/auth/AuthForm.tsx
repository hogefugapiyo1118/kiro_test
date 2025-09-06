import type React from 'react'
import { useState } from 'react'

interface AuthFormProps {
  mode: 'login' | 'register'
  onSubmit: (email: string, password: string, confirmPassword?: string) => Promise<void>
  loading: boolean
  error: string | null
  onModeChange: () => void
  onForgotPassword?: () => void
}

const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  onSubmit,
  loading,
  error,
  onModeChange,
  onForgotPassword
}) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (mode === 'register' && password !== confirmPassword) {
      return
    }
    
    await onSubmit(email, password, confirmPassword)
  }

  const isLogin = mode === 'login'

  return (
    <div className="w-full max-w-md">
      <h2 className="text-2xl font-bold text-center mb-6">
        {isLogin ? 'ログイン' : 'アカウント作成'}
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            パスワード {!isLogin && '(6文字以上)'}
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        {!isLogin && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              パスワード確認
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                password && confirmPassword && password !== confirmPassword
                  ? 'border-red-400'
                  : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-red-600 text-sm mt-1">パスワードが一致しません</p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (!isLogin && password !== confirmPassword)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '処理中...' : (isLogin ? 'ログイン' : 'アカウント作成')}
        </button>
      </form>

      <div className="mt-6 text-center space-y-2">
        <button
          onClick={onModeChange}
          className="text-blue-600 hover:text-blue-700 text-sm block w-full"
          disabled={loading}
        >
          {isLogin ? 'アカウントを作成する' : 'ログインする'}
        </button>
        
        {isLogin && onForgotPassword && (
          <button
            onClick={onForgotPassword}
            className="text-gray-600 hover:text-gray-800 text-sm block w-full"
            disabled={loading}
          >
            パスワードを忘れた方
          </button>
        )}
      </div>
    </div>
  )
}

export default AuthForm