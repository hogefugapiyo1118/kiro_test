import type React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const HomePage: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="w-full">
      {/* Hero section with responsive layout */}
      <div className="text-center xl:text-left xl:grid xl:grid-cols-12 xl:gap-8 xl:items-center mb-12 xl:mb-16">
        <div className="xl:col-span-8">
          <h1 className="text-3xl sm:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 xl:mb-6">
            英単語学習アプリ
          </h1>
          <p className="text-lg sm:text-xl xl:text-2xl text-gray-600 mb-8 xl:mb-10">
            効率的な単語学習で語彙力を向上させましょう
          </p>
          
          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-center xl:justify-start gap-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors inline-block text-center"
                >
                  ダッシュボードへ
                </Link>
                <Link
                  to="/study"
                  className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors inline-block text-center"
                >
                  学習を始める
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors inline-block text-center"
              >
                今すぐ始める
              </Link>
            )}
          </div>
        </div>
        
        {/* Hero illustration placeholder for large screens */}
        <div className="hidden xl:block xl:col-span-4">
          <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-primary-700 font-medium">効率的な学習体験</p>
          </div>
        </div>
      </div>

      {/* Features section with optimized grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8 mb-12 xl:mb-16">
        <div className="bg-white p-6 xl:p-8 rounded-lg shadow-md">
          <div className="text-3xl mb-4">📝</div>
          <h3 className="text-lg xl:text-xl font-semibold mb-3">単語管理</h3>
          <p className="text-gray-600">
            英単語と日本語訳を登録・管理できます。複数の意味や例文も保存可能です。
          </p>
        </div>
        <div className="bg-white p-6 xl:p-8 rounded-lg shadow-md">
          <div className="text-3xl mb-4">🎯</div>
          <h3 className="text-lg xl:text-xl font-semibold mb-3">フラッシュカード学習</h3>
          <p className="text-gray-600">
            効果的なフラッシュカード形式で記憶定着を促進。理解度に応じた復習システム。
          </p>
        </div>
        <div className="bg-white p-6 xl:p-8 rounded-lg shadow-md sm:col-span-2 xl:col-span-1">
          <div className="text-3xl mb-4">📊</div>
          <h3 className="text-lg xl:text-xl font-semibold mb-3">学習進捗管理</h3>
          <p className="text-gray-600">
            学習統計とグラフで進捗を可視化。継続的な学習をサポートします。
          </p>
        </div>
      </div>

      {/* Additional info section for large screens */}
      <div className="hidden xl:block bg-gray-100 rounded-lg p-8">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">学習の特徴</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                スマートな復習システム
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                進捗の可視化
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                モバイル対応
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">始め方</h3>
            <ol className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="bg-primary-100 text-primary-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">1</span>
                アカウントを作成
              </li>
              <li className="flex items-start">
                <span className="bg-primary-100 text-primary-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">2</span>
                単語を登録
              </li>
              <li className="flex items-start">
                <span className="bg-primary-100 text-primary-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">3</span>
                学習開始
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage