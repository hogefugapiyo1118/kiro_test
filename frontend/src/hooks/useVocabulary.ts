import { useState, useCallback } from 'react'
import api from '../services/api'
import type { 
  VocabularyWithMeanings, 
  VocabularySearchParams,
  CreateVocabularyRequest,
  UpdateVocabularyRequest
} from '../types'

interface UseVocabularyReturn {
  vocabularies: VocabularyWithMeanings[]
  totalCount: number
  loading: boolean
  error: string | null
  fetchVocabularies: (params?: VocabularySearchParams) => Promise<void>
  createVocabulary: (data: CreateVocabularyRequest) => Promise<VocabularyWithMeanings>
  updateVocabulary: (id: string, data: UpdateVocabularyRequest) => Promise<VocabularyWithMeanings>
  deleteVocabulary: (id: string) => Promise<void>
  clearError: () => void
}

export const useVocabulary = (): UseVocabularyReturn => {
  const [vocabularies, setVocabularies] = useState<VocabularyWithMeanings[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const fetchVocabularies = useCallback(async (params?: VocabularySearchParams) => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()
      
      if (params?.query) queryParams.append('query', params.query)
      if (params?.mastery_level !== undefined) queryParams.append('mastery_level', params.mastery_level.toString())
      if (params?.difficulty_level !== undefined) queryParams.append('difficulty_level', params.difficulty_level.toString())
      if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString())
      if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString())
      if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
      if (params?.sort_order) queryParams.append('sort_order', params.sort_order)

      const response = await api.get(`/vocabulary?${queryParams.toString()}`)
      
      setVocabularies(response.data.vocabularies || [])
      setTotalCount(response.data.totalCount || 0)
    } catch (err: any) {
      console.error('Failed to fetch vocabularies:', err)
      setError(err.response?.data?.error || 'Failed to fetch vocabularies')
      setVocabularies([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }, [])

  const createVocabulary = useCallback(async (data: CreateVocabularyRequest): Promise<VocabularyWithMeanings> => {
    try {
      setError(null)
      const response = await api.post('/vocabulary', data)
      return response.data
    } catch (err: any) {
      console.error('Failed to create vocabulary:', err)
      const errorMessage = err.response?.data?.error || 'Failed to create vocabulary'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const updateVocabulary = useCallback(async (id: string, data: UpdateVocabularyRequest): Promise<VocabularyWithMeanings> => {
    try {
      setError(null)
      const response = await api.put(`/vocabulary/${id}`, data)
      return response.data
    } catch (err: any) {
      console.error('Failed to update vocabulary:', err)
      const errorMessage = err.response?.data?.error || 'Failed to update vocabulary'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const deleteVocabulary = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null)
      await api.delete(`/vocabulary/${id}`)
    } catch (err: any) {
      console.error('Failed to delete vocabulary:', err)
      const errorMessage = err.response?.data?.error || 'Failed to delete vocabulary'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  return {
    vocabularies,
    totalCount,
    loading,
    error,
    fetchVocabularies,
    createVocabulary,
    updateVocabulary,
    deleteVocabulary,
    clearError
  }
}