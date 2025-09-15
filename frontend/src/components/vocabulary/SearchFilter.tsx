import React from 'react'
import type { VocabularySearchParams } from '../../types'

interface SearchFilterProps {
  searchParams: VocabularySearchParams
  onSearchChange: (params: VocabularySearchParams) => void
  onReset: () => void
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchParams,
  onSearchChange,
  onReset
}) => {
  const handleQueryChange = (query: string) => {
    onSearchChange({ ...searchParams, query, offset: 0 })
  }

  const handleMasteryLevelChange = (masteryLevel: string) => {
    const level = masteryLevel === '' ? undefined : parseInt(masteryLevel) as 0 | 1 | 2
    onSearchChange({ ...searchParams, mastery_level: level, offset: 0 })
  }

  const handleDifficultyLevelChange = (difficultyLevel: string) => {
    const level = difficultyLevel === '' ? undefined : parseInt(difficultyLevel)
    onSearchChange({ ...searchParams, difficulty_level: level, offset: 0 })
  }

  const handleSortChange = (sortBy: string, sortOrder: string) => {
    onSearchChange({
      ...searchParams,
      sort_by: sortBy as 'created_at' | 'english_word' | 'mastery_level',
      sort_order: sortOrder as 'asc' | 'desc',
      offset: 0
    })
  }

  const getMasteryLevelText = (level: number) => {
    switch (level) {
      case 0: return '未学習'
      case 1: return '学習中'
      case 2: return '習得済み'
      default: return ''
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Query */}
        <div>
          <label htmlFor="search-query" className="block text-sm font-medium text-gray-700 mb-1">
            検索
          </label>
          <input
            id="search-query"
            type="text"
            placeholder="英単語または日本語訳で検索"
            value={searchParams.query || ''}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Mastery Level Filter */}
        <div>
          <label htmlFor="mastery-level" className="block text-sm font-medium text-gray-700 mb-1">
            学習状態
          </label>
          <select
            id="mastery-level"
            value={searchParams.mastery_level?.toString() || ''}
            onChange={(e) => handleMasteryLevelChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">すべて</option>
            <option value="0">未学習</option>
            <option value="1">学習中</option>
            <option value="2">習得済み</option>
          </select>
        </div>

        {/* Difficulty Level Filter */}
        <div>
          <label htmlFor="difficulty-level" className="block text-sm font-medium text-gray-700 mb-1">
            難易度
          </label>
          <select
            id="difficulty-level"
            value={searchParams.difficulty_level?.toString() || ''}
            onChange={(e) => handleDifficultyLevelChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">すべて</option>
            <option value="1">初級</option>
            <option value="2">中級</option>
            <option value="3">上級</option>
          </select>
        </div>

        {/* Sort Options */}
        <div>
          <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
            並び順
          </label>
          <div className="flex gap-2">
            <select
              id="sort-by"
              value={searchParams.sort_by || 'created_at'}
              onChange={(e) => handleSortChange(e.target.value, searchParams.sort_order || 'desc')}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="created_at">追加日</option>
              <option value="english_word">英単語</option>
              <option value="mastery_level">学習状態</option>
            </select>
            <select
              value={searchParams.sort_order || 'desc'}
              onChange={(e) => handleSortChange(searchParams.sort_by || 'created_at', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="desc">降順</option>
              <option value="asc">昇順</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      <div className="mt-4 flex flex-wrap gap-2">
        {searchParams.query && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
            検索: "{searchParams.query}"
            <button
              onClick={() => handleQueryChange('')}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              ×
            </button>
          </span>
        )}
        {searchParams.mastery_level !== undefined && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
            学習状態: {getMasteryLevelText(searchParams.mastery_level)}
            <button
              onClick={() => handleMasteryLevelChange('')}
              className="ml-2 text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </span>
        )}
        {searchParams.difficulty_level !== undefined && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
            難易度: レベル{searchParams.difficulty_level}
            <button
              onClick={() => handleDifficultyLevelChange('')}
              className="ml-2 text-purple-600 hover:text-purple-800"
            >
              ×
            </button>
          </span>
        )}
        {(searchParams.query || searchParams.mastery_level !== undefined || searchParams.difficulty_level !== undefined) && (
          <button
            onClick={onReset}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 hover:bg-gray-200"
          >
            すべてクリア
          </button>
        )}
      </div>
    </div>
  )
}

export default SearchFilter