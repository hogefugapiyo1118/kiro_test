export interface Vocabulary {
  id: string
  user_id: string
  english_word: string
  example_sentence?: string
  difficulty_level: number
  mastery_level: 0 | 1 | 2
  created_at: string
  updated_at: string
}

export interface JapaneseMeaning {
  id: string
  vocabulary_id: string
  meaning: string
  part_of_speech?: string
  usage_note?: string
  created_at: string
}

export interface StudySession {
  id: string
  user_id: string
  vocabulary_id: string
  is_correct: boolean
  response_time?: number
  studied_at: string
}

export interface DailyStats {
  id: string
  user_id: string
  study_date: string
  words_studied: number
  correct_answers: number
  total_study_time: number
  created_at: string
}

export interface VocabularyWithMeanings extends Vocabulary {
  japanese_meanings: JapaneseMeaning[]
}

export interface User {
  id: string
  email: string
  created_at: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, confirmPassword: string) => Promise<any>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<any>
  refreshToken: () => Promise<void>
  clearError: () => void
}

// API Request/Response types
export interface CreateVocabularyRequest {
  english_word: string
  example_sentence?: string
  difficulty_level?: number
  japanese_meanings: Omit<JapaneseMeaning, 'id' | 'vocabulary_id' | 'created_at'>[]
}

export interface UpdateVocabularyRequest {
  english_word?: string
  example_sentence?: string
  difficulty_level?: number
  mastery_level?: 0 | 1 | 2
  japanese_meanings?: Omit<JapaneseMeaning, 'id' | 'vocabulary_id' | 'created_at'>[]
}

export interface StudySessionRequest {
  vocabulary_id: string
  is_correct: boolean
  response_time?: number
}

export interface StudySessionResponse {
  vocabulary: VocabularyWithMeanings[]
  session_id?: string
}

export interface DashboardStats {
  totalVocabulary: number
  masteredVocabulary: number
  todayStudied: number
  currentStreak: number
  weeklyProgress: DailyStats[]
  totalStats: {
    totalWordsStudied: number
    totalCorrectAnswers: number
    totalStudyTime: number
    studyDays: number
    averageAccuracy: number
  }
}

// Search and filter types
export interface VocabularySearchParams {
  query?: string
  mastery_level?: 0 | 1 | 2
  difficulty_level?: number
  limit?: number
  offset?: number
  sort_by?: 'created_at' | 'english_word' | 'mastery_level'
  sort_order?: 'asc' | 'desc'
}