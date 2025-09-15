import type React from 'react'
import type { DashboardStats } from '../../types'

interface StatsSummaryProps {
  stats: DashboardStats
}

const StatsSummary: React.FC<StatsSummaryProps> = ({ stats }) => {
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}時間${minutes}分`
    }
    return `${minutes}分`
  }

  const getStreakBadge = (streak: number) => {
    if (streak >= 30) {
      return { text: '🔥 30日連続達成！', color: 'bg-red-100 text-red-800' }
    } else if (streak >= 14) {
      return { text: '⭐ 2週間連続！', color: 'bg-yellow-100 text-yellow-800' }
    } else if (streak >= 7) {
      return { text: '🎯 1週間連続！', color: 'bg-green-100 text-green-800' }
    } else if (streak >= 3) {
      return { text: '💪 3日連続！', color: 'bg-blue-100 text-blue-800' }
    }
    return null
  }

  const streakBadge = getStreakBadge(stats.currentStreak)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6">
      {/* 総単語数 */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <div className="p-2 sm:p-3 rounded-full bg-blue-100 text-blue-600 text-lg sm:text-xl">
            📚
          </div>
          <div className="ml-3 sm:ml-4">
            <p className="text-sm font-medium text-gray-600">総単語数</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalVocabulary}</p>
          </div>
        </div>
      </div>

      {/* 習得済み単語数 */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <div className="p-2 sm:p-3 rounded-full bg-green-100 text-green-600 text-lg sm:text-xl">
            ✅
          </div>
          <div className="ml-3 sm:ml-4">
            <p className="text-sm font-medium text-gray-600">習得済み</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.masteredVocabulary}</p>
            <p className="text-xs text-gray-500">
              {stats.totalVocabulary > 0 
                ? `${Math.round((stats.masteredVocabulary / stats.totalVocabulary) * 100)}%`
                : '0%'
              }
            </p>
          </div>
        </div>
      </div>

      {/* 今日の学習数 */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <div className="p-2 sm:p-3 rounded-full bg-purple-100 text-purple-600 text-lg sm:text-xl">
            📖
          </div>
          <div className="ml-3 sm:ml-4">
            <p className="text-sm font-medium text-gray-600">今日の学習</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.todayStudied}</p>
            <p className="text-xs text-gray-500">単語</p>
          </div>
        </div>
      </div>

      {/* 連続学習日数 */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <div className="p-2 sm:p-3 rounded-full bg-orange-100 text-orange-600 text-lg sm:text-xl">
            🔥
          </div>
          <div className="ml-3 sm:ml-4">
            <p className="text-sm font-medium text-gray-600">連続学習</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.currentStreak}</p>
            <p className="text-xs text-gray-500">日</p>
          </div>
        </div>
        {streakBadge && (
          <div className="mt-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${streakBadge.color}`}>
              {streakBadge.text}
            </span>
          </div>
        )}
      </div>

      {/* 学習統計サマリー - Full width on large screens */}
      <div className="bg-white p-4 xl:p-6 rounded-lg shadow-md sm:col-span-2 xl:col-span-4">
        <h3 className="text-base xl:text-lg font-semibold text-gray-900 mb-4">学習統計</h3>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6">
          <div className="text-center">
            <p className="text-xl xl:text-2xl font-bold text-blue-600">{stats.totalStats.totalWordsStudied}</p>
            <p className="text-xs xl:text-sm text-gray-600">累計学習単語</p>
          </div>
          <div className="text-center">
            <p className="text-xl xl:text-2xl font-bold text-green-600">
              {Math.round(stats.totalStats.averageAccuracy)}%
            </p>
            <p className="text-xs xl:text-sm text-gray-600">平均正解率</p>
          </div>
          <div className="text-center">
            <p className="text-xl xl:text-2xl font-bold text-purple-600">{stats.totalStats.studyDays}</p>
            <p className="text-xs xl:text-sm text-gray-600">学習日数</p>
          </div>
          <div className="text-center">
            <p className="text-xl xl:text-2xl font-bold text-orange-600">
              {formatTime(stats.totalStats.totalStudyTime)}
            </p>
            <p className="text-xs xl:text-sm text-gray-600">累計学習時間</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsSummary