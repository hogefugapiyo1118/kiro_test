import type React from 'react'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Header from './Header'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // For non-authenticated users, use simple layout
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {children}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header with sidebar toggle */}
      <div className="xl:hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
      </div>

      <div className="flex h-screen xl:pt-0 pt-16">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden xl:ml-0">
          {/* Desktop header */}
          <div className="hidden xl:block">
            <div className="bg-white shadow-sm border-b">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-semibold text-gray-900">
                    {getPageTitle(window.location.pathname)}
                  </h1>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600">
                      {user.email}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 sm:px-6 xl:px-8 py-4 sm:py-6 xl:py-8 max-w-none">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

// Helper function to get page title based on pathname
const getPageTitle = (pathname: string): string => {
  switch (pathname) {
    case '/dashboard':
      return 'ダッシュボード'
    case '/vocabulary':
      return '単語帳'
    case '/study':
      return '学習'
    default:
      return '英単語学習アプリ'
  }
}

export default Layout