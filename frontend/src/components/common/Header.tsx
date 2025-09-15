import type React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface HeaderProps {
  onMenuClick?: () => void
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
      setIsMobileMenuOpen(false)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-lg sm:text-xl font-bold text-primary-600 truncate"
            onClick={closeMobileMenu}
          >
            英単語学習アプリ
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
                >
                  ダッシュボード
                </Link>
                <Link
                  to="/vocabulary"
                  className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
                >
                  単語帳
                </Link>
                <Link
                  to="/study"
                  className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
                >
                  学習
                </Link>
                <button
                  onClick={handleSignOut}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors font-medium"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors font-medium"
              >
                ログイン
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={onMenuClick ? onMenuClick : () => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors"
            aria-expanded="false"
          >
            <span className="sr-only">メニューを開く</span>
            {/* Hamburger icon */}
            <svg
              className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            {/* Close icon */}
            <svg
              className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden pb-4`}>
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200 mt-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                  onClick={closeMobileMenu}
                >
                  ダッシュボード
                </Link>
                <Link
                  to="/vocabulary"
                  className="block px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                  onClick={closeMobileMenu}
                >
                  単語帳
                </Link>
                <Link
                  to="/study"
                  className="block px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                  onClick={closeMobileMenu}
                >
                  学習
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left block px-3 py-3 rounded-md text-base font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors mt-4"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block px-3 py-3 rounded-md text-base font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors text-center"
                onClick={closeMobileMenu}
              >
                ログイン
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header