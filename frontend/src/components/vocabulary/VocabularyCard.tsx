import React from 'react'
import type { VocabularyWithMeanings } from '../../types'

interface VocabularyCardProps {
  vocabulary: VocabularyWithMeanings
  onEdit: (vocabulary: VocabularyWithMeanings) => void
  onDelete: (id: string) => void
}

const VocabularyCard: React.FC<VocabularyCardProps> = ({
  vocabulary,
  onEdit,
  onDelete
}) => {
  const getMasteryLevelColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-gray-100 text-gray-800'
      case 1: return 'bg-yellow-100 text-yellow-800'
      case 2: return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMasteryLevelText = (level: number) => {
    switch (level) {
      case 0: return '未学習'
      case 1: return '学習中'
      case 2: return '習得済み'
      default: return '未学習'
    }
  }

  const getDifficultyLevelText = (level: number) => {
    switch (level) {
      case 1: return '初級'
      case 2: return '中級'
      case 3: return '上級'
      default: return `レベル${level}`
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow">
      {/* Header with English word and actions */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 break-words">
            {vocabulary.english_word}
          </h3>
          <div className="flex flex-wrap gap-2 mb-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMasteryLevelColor(vocabulary.mastery_level)}`}>
              {getMasteryLevelText(vocabulary.mastery_level)}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {getDifficultyLevelText(vocabulary.difficulty_level)}
            </span>
          </div>
        </div>
        <div className="flex gap-1 sm:gap-2 ml-2 sm:ml-4 flex-shrink-0">
          <button
            onClick={() => onEdit(vocabulary)}
            className="p-2 sm:p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="編集"
          >
            <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(vocabulary.id)}
            className="p-2 sm:p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="削除"
          >
            <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Japanese meanings */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">日本語訳</h4>
        <div className="space-y-2">
          {vocabulary.japanese_meanings.map((meaning) => (
            <div key={meaning.id} className="flex flex-wrap items-start gap-2">
              <span className="text-gray-900">{meaning.meaning}</span>
              {meaning.part_of_speech && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                  {meaning.part_of_speech}
                </span>
              )}
              {meaning.usage_note && (
                <span className="text-sm text-gray-500 italic">
                  ({meaning.usage_note})
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Example sentence */}
      {vocabulary.example_sentence && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-1">例文</h4>
          <p className="text-gray-600 italic">{vocabulary.example_sentence}</p>
        </div>
      )}

      {/* Footer with metadata */}
      <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t border-gray-100">
        <span>追加日: {formatDate(vocabulary.created_at)}</span>
        {vocabulary.updated_at !== vocabulary.created_at && (
          <span>更新日: {formatDate(vocabulary.updated_at)}</span>
        )}
      </div>
    </div>
  )
}

export default VocabularyCard