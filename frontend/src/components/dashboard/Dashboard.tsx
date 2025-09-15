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
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
        <button
          onClick={refreshData}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          更新
        </button>
      </div>

      {/* 統計サマリー */}
      <StatsSummary stats={stats} />

      {/* 学習のモチベーション */}
      {stats.totalVocabulary === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-blue-400 text-2xl">
              🚀
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-blue-800">
                学習を始めましょう！
              </h3>
              <p className="text-blue-700 mt-1">
                まずは単語を登録して、学習を開始してみてください。
              </p>
            </div>
          </div>
          <div className="mt-4">
            <a
              href="/vocabulary"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors inline-block"
            >
              単語を登録する
            </a>
          </div>
        </div>
      )}

      {/* 学習継続のエンカレッジメント */}
      {stats.totalVocabulary > 0 && stats.todayStudied === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-yellow-400 text-2xl">
              💪
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-yellow-800">
                今日も学習しませんか？
              </h3>
              <p className="text-yellow-700 mt-1">
                継続は力なり！今日も少しでも学習してみましょう。
              </p>
            </div>
          </div>
          <div className="mt-4">
            <a
              href="/study"
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors inline-block"
            >
              学習を開始する
            </a>
          </div>
        </div>
      )}

      {/* 今日の学習完了メッセージ */}
      {stats.todayStudied > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-green-400 text-2xl">
              🎉
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-green-800">
                今日もお疲れさまでした！
              </h3>
              <p className="text-green-700 mt-1">
                今日は{stats.todayStudied}個の単語を学習しました。素晴らしいです！
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 学習進捗グラフ */}
      {stats.totalVocabulary > 0 && weeklyProgress.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">学習進捗</h2>
          <ProgressChart weeklyProgress={weeklyProgress} />
        </div>
      )}
    </div>
  )
}

export default Dashboard