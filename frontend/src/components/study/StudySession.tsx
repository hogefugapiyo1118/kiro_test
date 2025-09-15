import React, { useEffect } from 'react'
import { useStudy } from '../../hooks/useStudy'
import FlashCard from './FlashCard'
import StudyResults from './StudyResults'
import LoadingSpinner from '../common/LoadingSpinner'

interface StudySessionProps {
  sessionLimit?: number
}

const StudySession: React.FC<StudySessionProps> = ({ sessionLimit = 10 }) => {
  const {
    loading,
    error,
    sessionData,
    currentIndex,
    showAnswer,
    sessionResults,
    progress,
    currentVocabulary,
    isSessionCompleted,
    startSession,
    recordAnswer,
    showAnswerCard,
    resetSession,
    clearError
  } = useStudy()

  // Auto-start session on mount if no session is active
  useEffect(() => {
    if (!sessionData && !loading && !isSessionCompleted) {
      startSession(sessionLimit)
    }
  }, [sessionData, loading, isSessionCompleted, startSession, sessionLimit])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!currentVocabulary) return

      switch (event.key) {
        case ' ':
        case 'Enter':
          event.preventDefault()
          if (!showAnswer) {
            showAnswerCard()
          }
          break
        case '1':
          event.preventDefault()
          if (showAnswer) {
            recordAnswer(false)
          }
          break
        case '2':
          event.preventDefault()
          if (showAnswer) {
            recordAnswer(true)
          }
          break
        case 'Escape':
          event.preventDefault()
          resetSession()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentVocabulary, showAnswer, showAnswerCard, recordAnswer, resetSession])

  if (loading && !sessionData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">学習セッションを準備中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">エラーが発生しました</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={clearError}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              エラーをクリア
            </button>
            <button
              onClick={() => startSession(sessionLimit)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isSessionCompleted) {
    return (
      <div className="max-w-4xl mx-auto">
        <StudyResults
          results={sessionResults}
          onStartNewSession={() => startSession(sessionLimit)}
          onBackToMenu={resetSession}
        />
      </div>
    )
  }

  if (!sessionData || !currentVocabulary) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            学習する単語がありません
          </h2>
          <p className="text-gray-600 mb-6">
            まず単語を登録してから学習を開始してください。
          </p>
          <button
            onClick={() => window.location.href = '/vocabulary'}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            単語管理へ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">フラッシュカード学習</h1>
          <button
            onClick={resetSession}
            className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded"
          >
            終了
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            {currentIndex + 1} / {sessionData.total_words}
          </span>
          <span>{Math.round(progress)}% 完了</span>
        </div>
      </div>

      {/* Flash Card */}
      <FlashCard
        vocabulary={currentVocabulary}
        showAnswer={showAnswer}
        onShowAnswer={showAnswerCard}
        onAnswer={recordAnswer}
        loading={loading}
      />

      {/* Controls Help */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">操作方法</h3>
        
        {/* Desktop Controls */}
        <div className="hidden md:block mb-3">
          <h4 className="text-xs font-medium text-gray-600 mb-1">キーボード</h4>
          <div className="grid grid-cols-4 gap-2 text-xs text-gray-600">
            <div><kbd className="bg-white px-2 py-1 rounded">Space</kbd> 答えを表示</div>
            <div><kbd className="bg-white px-2 py-1 rounded">1</kbd> 覚えていない</div>
            <div><kbd className="bg-white px-2 py-1 rounded">2</kbd> 覚えた</div>
            <div><kbd className="bg-white px-2 py-1 rounded">Esc</kbd> 終了</div>
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden">
          <h4 className="text-xs font-medium text-gray-600 mb-1">タッチ操作</h4>
          <div className="grid grid-cols-1 gap-1 text-xs text-gray-600">
            <div>↑ 上にスワイプ: 答えを表示</div>
            <div>← 左にスワイプ: 覚えていない</div>
            <div>→ 右にスワイプ: 覚えた</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudySession