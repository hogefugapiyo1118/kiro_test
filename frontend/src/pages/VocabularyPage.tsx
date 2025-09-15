import React, { useState } from 'react'
import { VocabularyList, VocabularyForm } from '../components/vocabulary'
import Modal from '../components/common/Modal'
import { useVocabulary } from '../hooks/useVocabulary'
import type { VocabularyWithMeanings, CreateVocabularyRequest, UpdateVocabularyRequest } from '../types'

const VocabularyPage: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVocabulary, setEditingVocabulary] = useState<VocabularyWithMeanings | undefined>()
  const [formLoading, setFormLoading] = useState(false)

  const { createVocabulary, updateVocabulary, deleteVocabulary } = useVocabulary()

  const handleAdd = () => {
    setEditingVocabulary(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (vocabulary: VocabularyWithMeanings) => {
    setEditingVocabulary(vocabulary)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('この単語を削除してもよろしいですか？')) {
      try {
        await deleteVocabulary(id)
        setRefreshTrigger(prev => prev + 1)
      } catch (error) {
        console.error('Failed to delete vocabulary:', error)
        alert('単語の削除に失敗しました。もう一度お試しください。')
      }
    }
  }

  const handleFormSubmit = async (data: CreateVocabularyRequest | UpdateVocabularyRequest) => {
    try {
      setFormLoading(true)
      
      if (editingVocabulary) {
        await updateVocabulary(editingVocabulary.id, data as UpdateVocabularyRequest)
      } else {
        await createVocabulary(data as CreateVocabularyRequest)
      }
      
      setIsModalOpen(false)
      setEditingVocabulary(undefined)
      setRefreshTrigger(prev => prev + 1)
    } catch (error) {
      console.error('Failed to save vocabulary:', error)
      alert('単語の保存に失敗しました。もう一度お試しください。')
    } finally {
      setFormLoading(false)
    }
  }

  const handleModalClose = () => {
    if (!formLoading) {
      setIsModalOpen(false)
      setEditingVocabulary(undefined)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">単語帳</h1>
        <button
          onClick={handleAdd}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新しい単語を追加
        </button>
      </div>

      <VocabularyList
        onEdit={handleEdit}
        onDelete={handleDelete}
        refreshTrigger={refreshTrigger}
      />

      {/* Vocabulary Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        size="xl"
      >
        <VocabularyForm
          vocabulary={editingVocabulary}
          onSubmit={handleFormSubmit}
          onCancel={handleModalClose}
          loading={formLoading}
        />
      </Modal>
    </div>
  )
}

export default VocabularyPage