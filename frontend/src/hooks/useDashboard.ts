import { useState, useEffect } from 'react'
import { dashboardApi } from '../services/api'
import { useErrorHandler } from './useErrorHandler'
import type { DashboardStats } from '../types'

interface WeeklyProgressData {
  date: string
  wordsStudied: number
  correctAnswers: number
  accuracy: number
}

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgressData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { handleError } = useErrorHandler()

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch dashboard stats and weekly progress in parallel
      const [statsResponse, progressResponse] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getProgress()
      ])

      setStats(statsResponse)
      setWeeklyProgress(progressResponse)
    } catch (err) {
      const apiError = handleError(err, { showToast: false })
      setError(apiError.message)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    fetchDashboardData()
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return {
    stats,
    weeklyProgress,
    loading,
    error,
    refreshData
  }
}