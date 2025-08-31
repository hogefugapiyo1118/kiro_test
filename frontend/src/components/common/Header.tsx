import type React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const Header: React.FC = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-primary-600">
            英単語学習アプリ
          </Link>

          <nav className="flex items-center space-x-6">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  ダッシュボード
                </Link>
                <Link
                  to="/vocabulary"
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  単語帳
                </Link>
                <Link
                  to="/study"
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  学習
                </Link>
                <button
                  onClick={handleSignOut}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
              >
                ログイン
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header