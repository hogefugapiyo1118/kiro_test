import React from 'react'
import { StudySession } from '../../types'

interface StudyResultsProps {
  results: StudySession[]
  onStartNewSession: () => void
  onBackToMenu: () => void
}

const StudyResults: React.FC<StudyResultsProps> = ({
  results,
  onStartNewSession,
  onBackToMenu
}) => {
  // Calculate statistics
  const totalWords = results.length
  const correctAnswers = results.filter(result => result.is_correct).length
  const accuracy = totalWords > 0 ? (correctAnswers / totalWords) * 100 : 0
  
  // Calculate average response time
  const responseTimes = results
    .filter(result => result.response_time !== undefined && result.response_time !== null)
    .map(result => result.response_time!)
  const averageResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    : 0

  // Format time in seconds
  const formatTime = (milliseconds: number) => {
    return (milliseconds / 1000).toFixed(1) + '秒'
  }

  // Get accuracy color
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600'
    if (accuracy >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Get accuracy message
  const getAccuracyMessage = (accuracy: number) => {
    if (accuracy >= 90) return '素晴らしい！'
    if (accuracy >= 80) return 'よくできました！'
    if (accuracy >= 60) return 'もう少し頑張りましょう'
    return '復習が必要です'
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">学習結果</h1>
        <p className="text-gray-600">お疲れさまでした！</p>
      </div>

      {/* Results Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        {/* Main Stats */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <div className={`text-6xl font-bold ${getAccuracyColor(accuracy)} mb-2`}>
              {accuracy.toFixed(0)}%
            </div>
            <div className="text-xl text-gray-700 mb-2">
              {getAccuracyMessage(accuracy)}
            </div>
            <div className="text-gray-600">
              {correctAnswers} / {totalWords} 問正解
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {totalWords}
            </div>
            <div className="text-sm text-blue-800">学習した単語数</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {correctAnswers}
            </div>
            <div className="text-sm text-green-800">正解数</div>
          </div>
          
          {averageResponseTime > 0 && (
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {formatTime(averageResponseTime)}
              </div>
              <div className="text-sm text-purple-800">平均回答時間</div>
            </div>
          )}
        </div>

        {/* Progress Message */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">学習のポイント</h3>
          <div className="text-sm text-gray-600 space-y-1">
            {accuracy >= 80 ? (
              <>
                <p>✅ 高い正解率を維持できています</p>
                <p>💡 新しい単語を追加して語彙を増やしましょう</p>
              </>
            ) : accuracy >= 60 ? (
              <>
                <p>📚 もう少し復習が必要な単語があります</p>
                <p>💡 間違えた単語を重点的に学習しましょう</p>
              </>
            ) : (
              <>
                <p>🔄 復習を重ねて定着を図りましょう</p>
                <p>💡 難易度を下げて基本的な単語から始めることをお勧めします</p>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onStartNewSession}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            もう一度学習する
          </button>
          <button
            onClick={onBackToMenu}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            メニューに戻る
          </button>
        </div>
      </div>

      {/* Detailed Results (if there are results) */}
      {results.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">詳細結果</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={result.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  result.is_correct ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    result.is_correct ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {result.is_correct ? '○' : '×'}
                  </div>
                  <span className="text-gray-800">問題 {index + 1}</span>
                </div>
                {result.response_time && (
                  <span className="text-sm text-gray-600">
                    {formatTime(result.response_time)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default StudyResults