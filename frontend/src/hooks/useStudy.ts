import { useState, useCallback } from 'react'
import { studyApi } from '../services/api'
import { VocabularyWithMeanings, StudySession } from '../types'

interface StudySessionData {
  vocabulary: VocabularyWithMeanings[]
  session_id: string
  total_words: number
}

interface StudyStats {
  totalSessions: number
  correctAnswers: number
  averageResponseTime: number
  accuracy: number
}

export const useStudy = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionData, setSessionData] = useState<StudySessionData | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [sessionResults, setSessionResults] = useState<StudySession[]>([])
  const [, setSessionStartTime] = useState<number | null>(null)
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null)

  const startSession = useCallback(async (limit: number = 10) => {
    setLoading(true)
    setError(null)
    try {
      const response = await studyApi.startSession(limit)
      setSessionData(response.data)
      setCurrentIndex(0)
      setShowAnswer(false)
      setSessionResults([])
      setSessionStartTime(Date.now())
      setQuestionStartTime(Date.now())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start study session')
    } finally {
      setLoading(false)
    }
  }, [])

  const recordAnswer = useCallback(async (isCorrect: boolean) => {
    if (!sessionData || !questionStartTime) return

    const currentVocabulary = sessionData.vocabulary[currentIndex]
    const responseTime = Date.now() - questionStartTime

    setLoading(true)
    try {
      const response = await studyApi.recordResult(
        currentVocabulary.id,
        isCorrect,
        responseTime
      )
      
      setSessionResults(prev => [...prev, response.data])
      
      // Move to next question or end session
      if (currentIndex < sessionData.vocabulary.length - 1) {
        setCurrentIndex(prev => prev + 1)
        setShowAnswer(false)
        setQuestionStartTime(Date.now())
      } else {
        // Session completed
        setSessionData(null)
        setCurrentIndex(0)
        setShowAnswer(false)
        setQuestionStartTime(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record answer')
    } finally {
      setLoading(false)
    }
  }, [sessionData, currentIndex, questionStartTime])

  const showAnswerCard = useCallback(() => {
    setShowAnswer(true)
  }, [])

  const getStats = useCallback(async (vocabularyId?: string): Promise<StudyStats | null> => {
    try {
      const response = await studyApi.getStats(vocabularyId)
      return response.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get stats')
      return null
    }
  }, [])

  const getHistory = useCallback(async (limit: number = 50): Promise<StudySession[] | null> => {
    try {
      const response = await studyApi.getHistory(limit)
      return response.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get history')
      return null
    }
  }, [])

  const resetSession = useCallback(() => {
    setSessionData(null)
    setCurrentIndex(0)
    setShowAnswer(false)
    setSessionResults([])
    setSessionStartTime(null)
    setQuestionStartTime(null)
    setError(null)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Calculate session progress
  const progress = sessionData 
    ? ((currentIndex + (showAnswer ? 0.5 : 0)) / sessionData.vocabulary.length) * 100
    : 0

  // Get current vocabulary item
  const currentVocabulary = sessionData?.vocabulary[currentIndex] || null

  // Check if session is completed
  const isSessionCompleted = sessionData && currentIndex >= sessionData.vocabulary.length

  return {
    // State
    loading,
    error,
    sessionData,
    currentIndex,
    showAnswer,
    sessionResults,
    progress,
    currentVocabulary,
    isSessionCompleted,
    
    // Actions
    startSession,
    recordAnswer,
    showAnswerCard,
    getStats,
    getHistory,
    resetSession,
    clearError
  }
}