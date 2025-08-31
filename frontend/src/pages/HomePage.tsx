import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const HomePage: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        英単語学習アプリ
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        効率的な単語学習で語彙力を向上させましょう
      </p>
      
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-3">単語管理</h3>
          <p className="text-gray-600">
            英単語と日本語訳を登録・管理できます
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-3">フラッシュカード学習</h3>
          <p className="text-gray-600">
            効果的なフラッシュカード形式で記憶定着を促進
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-3">学習進捗管理</h3>
          <p className="text-gray-600">
            学習統計とグラフで進捗を可視化
          </p>
        </div>
      </div>

      {user ? (
        <div className="space-x-4">
          <Link 
            to="/dashboard" 
            className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors inline-block"
          >
            ダッシュボードへ
          </Link>
          <Link 
            to="/study" 
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors inline-block"
          >
            学習を始める
          </Link>
        </div>
      ) : (
        <Link 
          to="/login" 
          className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors inline-block"
        >
          今すぐ始める
        </Link>
      )}
    </div>
  )
}

export default HomePage