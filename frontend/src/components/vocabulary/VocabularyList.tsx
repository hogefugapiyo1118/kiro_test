import React, { useState, useEffect, useCallback } from 'react'
import type { VocabularyWithMeanings, VocabularySearchParams } from '../../types'
import VocabularyCard from './VocabularyCard'
import SearchFilter from './SearchFilter'
import Pagination from './Pagination'
import LoadingSpinner from '../common/LoadingSpinner'
import { useVocabulary } from '../../hooks/useVocabulary'

interface VocabularyListProps {
  onEdit: (vocabulary: VocabularyWithMeanings) => void
  onDelete: (id: string) => void
  refreshTrigger?: number
}

const ITEMS_PER_PAGE = 12

const VocabularyList: React.FC<VocabularyListProps> = ({
  onEdit,
  onDelete,
  refreshTrigger
}) => {
  const [searchParams, setSearchParams] = useState<VocabularySearchParams>({
    limit: ITEMS_PER_PAGE,
    offset: 0,
    sort_by: 'created_at',
    sort_order: 'desc'
  })

  const [currentPage, setCurrentPage] = useState(1)

  const {
    vocabularies,
    totalCount,
    loading,
    error,
    fetchVocabularies
  } = useVocabulary()

  // Fetch vocabularies when search params change
  useEffect(() => {
    fetchVocabularies(searchParams)
  }, [searchParams, fetchVocabularies, refreshTrigger])

  const handleSearchChange = useCallback((newParams: VocabularySearchParams) => {
    setSearchParams(newParams)
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    const offset = (page - 1) * ITEMS_PER_PAGE
    setSearchParams(prev => ({ ...prev, offset }))
    setCurrentPage(page)
  }, [])

  const handleReset = useCallback(() => {
    const resetParams: VocabularySearchParams = {
      limit: ITEMS_PER_PAGE,
      offset: 0,
      sort_by: 'created_at',
      sort_order: 'desc'
    }
    setSearchParams(resetParams)
    setCurrentPage(1)
  }, [])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              エラーが発生しました
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => fetchVocabularies(searchParams)}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
              >
                再試行
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <SearchFilter
        searchParams={searchParams}
        onSearchChange={handleSearchChange}
        onReset={handleReset}
      />

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {loading ? (
            '読み込み中...'
          ) : (
            <>
              {totalCount > 0 ? (
                <>
                  {totalCount}件の単語が見つかりました
                  {(searchParams.query || searchParams.mastery_level !== undefined || searchParams.difficulty_level !== undefined) && (
                    <span className="ml-2 text-blue-600">（フィルタ適用中）</span>
                  )}
                </>
              ) : (
                '単語が見つかりませんでした'
              )}
            </>
          )}
        </div>
        
        {!loading && totalCount > 0 && (
          <div className="text-sm text-gray-500">
            ページ {currentPage} / {totalPages}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {/* Empty State */}
      {!loading && totalCount === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">単語がありません</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchParams.query || searchParams.mastery_level !== undefined || searchParams.difficulty_level !== undefined
              ? '検索条件に一致する単語が見つかりませんでした。フィルタを変更してみてください。'
              : '最初の単語を追加してみましょう。'
            }
          </p>
          {(searchParams.query || searchParams.mastery_level !== undefined || searchParams.difficulty_level !== undefined) && (
            <div className="mt-6">
              <button
                onClick={handleReset}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                すべての単語を表示
              </button>
            </div>
          )}
        </div>
      )}

      {/* Vocabulary Grid - Optimized for different screen sizes */}
      {!loading && vocabularies.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
            {vocabularies.map((vocabulary) => (
              <VocabularyCard
                key={vocabulary.id}
                vocabulary={vocabulary}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalCount}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  )
}

export default VocabularyList