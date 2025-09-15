import { createContext, useContext, useState, useCallback, ReactNode, FC } from 'react'
import Toast, { ToastMessage } from '../components/common/Toast'

interface ToastContextType {
  showToast: (message: string, type?: ToastMessage['type'], duration?: number) => void
  showSuccess: (message: string, duration?: number) => void
  showError: (message: string, duration?: number) => void
  showWarning: (message: string, duration?: number) => void
  showInfo: (message: string, duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export const ToastProvider: FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const showToast = useCallback((
    message: string,
    type: ToastMessage['type'] = 'info',
    duration?: number
  ) => {
    const id = generateId()
    const newToast: ToastMessage = {
      id,
      message,
      type,
      duration
    }

    setToasts(prev => [...prev, newToast])
  }, [])

  const showSuccess = useCallback((message: string, duration?: number) => {
    showToast(message, 'success', duration)
  }, [showToast])

  const showError = useCallback((message: string, duration?: number) => {
    showToast(message, 'error', duration)
  }, [showToast])

  const showWarning = useCallback((message: string, duration?: number) => {
    showToast(message, 'warning', duration)
  }, [showToast])

  const showInfo = useCallback((message: string, duration?: number) => {
    showToast(message, 'info', duration)
  }, [showToast])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const value: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast
  }

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 w-full max-w-sm">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider