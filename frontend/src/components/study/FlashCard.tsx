import { useState, useRef, FC, TouchEvent } from 'react'
import { VocabularyWithMeanings } from '../../types'

interface FlashCardProps {
  vocabulary: VocabularyWithMeanings
  showAnswer: boolean
  onShowAnswer: () => void
  onAnswer: (isCorrect: boolean) => void
  loading?: boolean
}

const FlashCard: FC<FlashCardProps> = ({
  vocabulary,
  showAnswer,
  onShowAnswer,
  onAnswer,
  loading = false
}) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // Handle touch events for swipe gestures
  const handleTouchStart = (e: TouchEvent) => {
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distanceX = touchStart.x - touchEnd.x
    const distanceY = touchStart.y - touchEnd.y
    const isLeftSwipe = distanceX > 50
    const isRightSwipe = distanceX < -50
    const isUpSwipe = distanceY > 50
    const isVerticalSwipe = Math.abs(distanceY) > Math.abs(distanceX)

    if (showAnswer && !isVerticalSwipe) {
      if (isLeftSwipe) {
        onAnswer(false) // Swipe left = incorrect
      } else if (isRightSwipe) {
        onAnswer(true) // Swipe right = correct
      }
    } else if (!showAnswer && isUpSwipe) {
      onShowAnswer() // Swipe up = show answer
    }
  }
  return (
    <div className="max-w-md mx-auto">
      {/* Card */}
      <div
        ref={cardRef}
        className="bg-white rounded-xl shadow-lg p-8 min-h-[300px] flex flex-col justify-center items-center text-center touch-manipulation select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* English Word */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {vocabulary.english_word}
          </h2>
          {vocabulary.example_sentence && (
            <p className="text-sm text-gray-600 italic">
              "{vocabulary.example_sentence}"
            </p>
          )}
        </div>

        {/* Answer Section */}
        {showAnswer ? (
          <div className="mb-6 w-full">
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">日本語訳</h3>
              <div className="space-y-2">
                {vocabulary.japanese_meanings.map((meaning) => (
                  <div key={meaning.id} className="text-blue-800">
                    <span className="font-medium">{meaning.meaning}</span>
                    {meaning.part_of_speech && (
                      <span className="text-sm text-blue-600 ml-2">
                        ({meaning.part_of_speech})
                      </span>
                    )}
                    {meaning.usage_note && (
                      <p className="text-xs text-blue-600 mt-1">
                        {meaning.usage_note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Answer Buttons */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => onAnswer(false)}
                disabled={loading}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                {loading ? '記録中...' : '覚えていない'}
              </button>
              <button
                onClick={() => onAnswer(true)}
                disabled={loading}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                {loading ? '記録中...' : '覚えた'}
              </button>
            </div>
          </div>
        ) : (
          /* Show Answer Button */
          <button
            onClick={onShowAnswer}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
          >
            答えを見る
          </button>
        )}
      </div>

      {/* Difficulty Level Indicator */}
      <div className="mt-4 flex justify-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">難易度:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`w-2 h-2 rounded-full ${level <= vocabulary.difficulty_level
                    ? 'bg-yellow-400'
                    : 'bg-gray-200'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FlashCard