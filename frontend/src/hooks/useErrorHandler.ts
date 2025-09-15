import { useCallback } from 'react'
import { AxiosError } from 'axios'
import { useToast } from '../contexts/ToastContext'

export interface ApiError {
  message: string
  status?: number
  code?: string
}

export interface ErrorHandlerOptions {
  showToast?: boolean
  redirectOnAuth?: boolean
}

export const useErrorHandler = () => {
  const { showError } = useToast()
  const handleError = useCallback((
    error: unknown,
    options: ErrorHandlerOptions = {}
  ): ApiError => {
    const { showToast = true, redirectOnAuth = true } = options

    let apiError: ApiError = {
      message: '予期しないエラーが発生しました'
    }

    if (error instanceof AxiosError) {
      const status = error.response?.status
      const data = error.response?.data

      apiError.status = status
      apiError.code = data?.code

      switch (status) {
        case 400:
          apiError.message = data?.message || '入力内容に誤りがあります'
          break
        case 401:
          apiError.message = 'ログインが必要です'
          if (redirectOnAuth) {
            // Redirect to login page
            window.location.href = '/login'
          }
          break
        case 403:
          apiError.message = 'この操作を実行する権限がありません'
          break
        case 404:
          apiError.message = '要求されたリソースが見つかりません'
          break
        case 409:
          apiError.message = data?.message || 'データの競合が発生しました'
          break
        case 422:
          apiError.message = data?.message || '入力データの検証に失敗しました'
          break
        case 429:
          apiError.message = 'リクエストが多すぎます。しばらく時間をおいてから再度お試しください'
          break
        case 500:
          apiError.message = 'サーバーエラーが発生しました。しばらく時間をおいてから再度お試しください'
          break
        case 502:
        case 503:
        case 504:
          apiError.message = 'サービスが一時的に利用できません。しばらく時間をおいてから再度お試しください'
          break
        default:
          if (data?.message) {
            apiError.message = data.message
          } else if (error.message) {
            apiError.message = error.message
          }
      }
    } else if (error instanceof Error) {
      apiError.message = error.message
    } else if (typeof error === 'string') {
      apiError.message = error
    }

    // Log error in development
    if (import.meta.env.DEV) {
      console.error('API Error:', error)
    }

    // Show toast notification if enabled
    if (showToast) {
      showError(apiError.message)
    }

    return apiError
  }, [])

  const getErrorMessage = useCallback((error: unknown): string => {
    const apiError = handleError(error, { showToast: false })
    return apiError.message
  }, [handleError])

  return {
    handleError,
    getErrorMessage
  }
}

export default useErrorHandler