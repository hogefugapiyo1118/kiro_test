import type React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [localLoading, setLocalLoading] = useState(false)
  const [localError, setLocalError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const { signIn, signUp, resetPassword, loading, error, clearError, user } = useAuth()
  const navigate = useNavigate()

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  // Clear errors when switching between forms
  useEffect(() => {
    setLocalError('')
    setSuccessMessage('')
    clearError()
  }, [isLogin, showResetPassword, clearError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // すでに送信中なら無視（Enter 連打 / ダブルクリック防止）
    if (localLoading || loading) return
    setLocalLoading(true)
    setLocalError('')
    setSuccessMessage('')

    try {
      if (isLogin) {
        const result = await signIn(email, password)
        // user state は AuthContext 内で即時更新され、上位 useEffect が /dashboard へ遷移
        if (result?.user) {
          navigate('/dashboard')
        }
      } else {
        if (password !== confirmPassword) {
          throw new Error('パスワードが一致しません')
        }
        const result = await signUp(email, password, confirmPassword)

        if (result.user && !result.session) {
          setSuccessMessage('登録完了！メールを確認してアカウントを有効化してください。')
        } else {
          navigate('/dashboard')
        }
      }
    } catch (error: any) {
      setLocalError(error.message || 'エラーが発生しました')
    } finally {
      setLocalLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalLoading(true)
    setLocalError('')

    try {
      await resetPassword(resetEmail)
      setSuccessMessage('パスワードリセットメールを送信しました。メールを確認してください。')
      setShowResetPassword(false)
      setResetEmail('')
    } catch (error: any) {
      setLocalError(error.message || 'パスワードリセットに失敗しました')
    } finally {
      setLocalLoading(false)
    }
  }

  if (showResetPassword) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          パスワードリセット
        </h2>

        {(localError || error) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {localError || error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              id="resetEmail"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={localLoading || loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {(localLoading || loading) ? '送信中...' : 'リセットメールを送信'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setShowResetPassword(false)}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            ログインに戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">
        {isLogin ? 'ログイン' : 'アカウント作成'}
      </h2>

      {(localError || error) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {localError || error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={localLoading || loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {(localLoading || loading) ? '処理中...' : (isLogin ? 'ログイン' : 'アカウント作成')}
        </button>
      </form>

      <div className="mt-6 text-center space-y-2">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-600 hover:text-blue-700 text-sm block w-full"
        >
          {isLogin ? 'アカウントを作成する' : 'ログインする'}
        </button>

        {isLogin && (
          <button
            onClick={() => setShowResetPassword(true)}
            className="text-gray-600 hover:text-gray-800 text-sm block w-full"
          >
            パスワードを忘れた方
          </button>
        )}
      </div>

      <div className="mt-4 text-center">
        <Link to="/" className="text-gray-600 hover:text-gray-800 text-sm">
          ホームに戻る
        </Link>
      </div>
    </div>
  )
}

export default LoginPage