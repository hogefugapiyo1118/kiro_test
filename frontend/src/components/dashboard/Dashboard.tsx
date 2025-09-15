import type React from 'react'
import { useDashboard } from '../../hooks/useDashboard'
import StatsSummary from './StatsSummary'
import ProgressChart from './ProgressChart'
import LoadingSpinner from '../common/LoadingSpinner'

const Dashboard: React.FC = () => {
  const { stats, weeklyProgress, loading, error, refreshData } = useDashboard()

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="text-red-400">
            ⚠️
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              データの読み込みに失敗しました
            </h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={refreshData}
            className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">データがありません</p>
        <button
          onClick={refreshData}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          データを読み込む
        </button>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* ヘッダー - Responsive layout */}
      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-start gap-4 mb-6 xl:mb-8">
        <div className="flex-1">
          <h1 className="text-2xl xl:text-3xl font-bold text-gray-900 mb-2">ダッシュボード</h1>
          <p className="text-gray-600 hidden xl:block">
            学習の進捗状況と統計を確認しましょう
          </p>
        </div>
        <div className="xl:flex-shrink-0">
          <button
            onClick={refreshData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 sm:py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center min-h-[44px] w-full xl:w-auto"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            更新
          </button>
        </div>
      </div>

      {/* Main dashboard content with multi-column layout */}
      <div className="xl:grid xl:grid-cols-12 xl:gap-8 space-y-6 xl:space-y-0">
        {/* Left column - Stats and motivational content */}
        <div className="xl:col-span-8 space-y-6">
          {/* 統計サマリー */}
          <StatsSummary stats={stats} />

          {/* 学習のモチベーション */}
          {stats.totalVocabulary === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 xl:p-6">
              <div className="flex items-start xl:items-center">
                <div className="text-blue-400 text-2xl flex-shrink-0">
                  🚀
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-base xl:text-lg font-medium text-blue-800">
                    学習を始めましょう！
                  </h3>
                  <p className="text-blue-700 mt-1 text-sm xl:text-base">
                    まずは単語を登録して、学習を開始してみてください。
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <a
                  href="/vocabulary"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 xl:py-2 rounded-md text-sm font-medium transition-colors inline-block min-h-[44px] flex items-center justify-center w-full xl:w-auto"
                >
                  単語を登録する
                </a>
              </div>
            </div>
          )}

          {/* 学習継続のエンカレッジメント */}
          {stats.totalVocabulary > 0 && stats.todayStudied === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 xl:p-6">
              <div className="flex items-start xl:items-center">
                <div className="text-yellow-400 text-2xl flex-shrink-0">
                  💪
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-base xl:text-lg font-medium text-yellow-800">
                    今日も学習しませんか？
                  </h3>
                  <p className="text-yellow-700 mt-1 text-sm xl:text-base">
                    継続は力なり！今日も少しでも学習してみましょう。
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <a
                  href="/study"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 xl:py-2 rounded-md text-sm font-medium transition-colors inline-block min-h-[44px] flex items-center justify-center w-full xl:w-auto"
                >
                  学習を開始する
                </a>
              </div>
            </div>
          )}

          {/* 今日の学習完了メッセージ */}
          {stats.todayStudied > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 xl:p-6">
              <div className="flex items-start xl:items-center">
                <div className="text-green-400 text-2xl flex-shrink-0">
                  🎉
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-base xl:text-lg font-medium text-green-800">
                    今日もお疲れさまでした！
                  </h3>
                  <p className="text-green-700 mt-1 text-sm xl:text-base">
                    今日は{stats.todayStudied}個の単語を学習しました。素晴らしいです！
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column - Progress chart and additional info */}
        <div className="xl:col-span-4">
          {/* 学習進捗グラフ */}
          {stats.totalVocabulary > 0 && weeklyProgress.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg xl:text-xl font-bold text-gray-900 mb-4">学習進捗</h2>
              <ProgressChart weeklyProgress={weeklyProgress} />
            </div>
          )}

          {/* Quick actions panel for large screens */}
          {stats.totalVocabulary > 0 && (
            <div className="hidden xl:block mt-6 bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">クイックアクション</h3>
              <div className="space-y-3">
                <a
                  href="/vocabulary"
                  className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                >
                  📚 単語を追加
                </a>
                <a
                  href="/study"
                  className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                >
                  🎯 学習を開始
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard