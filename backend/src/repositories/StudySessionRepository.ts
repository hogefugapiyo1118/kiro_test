import { SupabaseClient } from '@supabase/supabase-js';
import { StudySession } from '../types/index.js';

export class StudySessionRepository {
  constructor(private supabase: SupabaseClient) {}

  async create(session: Omit<StudySession, 'id' | 'studied_at'>): Promise<StudySession> {
    const { data, error } = await this.supabase
      .from('study_sessions')
      .insert(session)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create study session: ${error.message}`);
    }

    return data;
  }

  async findByUserId(userId: string, limit?: number): Promise<StudySession[]> {
    let query = this.supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('studied_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch study sessions: ${error.message}`);
    }

    return data || [];
  }

  async findByVocabularyId(vocabularyId: string, userId: string): Promise<StudySession[]> {
    const { data, error } = await this.supabase
      .from('study_sessions')
      .select('*')
      .eq('vocabulary_id', vocabularyId)
      .eq('user_id', userId)
      .order('studied_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch study sessions for vocabulary: ${error.message}`);
    }

    return data || [];
  }

  async getRecentSessions(userId: string, days: number = 7): Promise<StudySession[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await this.supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('studied_at', startDate.toISOString())
      .order('studied_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch recent study sessions: ${error.message}`);
    }

    return data || [];
  }

  async getStudyStats(userId: string, vocabularyId?: string): Promise<{
    totalSessions: number;
    correctAnswers: number;
    averageResponseTime: number;
  }> {
    let query = this.supabase
      .from('study_sessions')
      .select('is_correct, response_time')
      .eq('user_id', userId);

    if (vocabularyId) {
      query = query.eq('vocabulary_id', vocabularyId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get study stats: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return {
        totalSessions: 0,
        correctAnswers: 0,
        averageResponseTime: 0
      };
    }

    const totalSessions = data.length;
    const correctAnswers = data.filter(session => session.is_correct).length;
    const responseTimes = data
      .filter(session => session.response_time !== null)
      .map(session => session.response_time);
    
    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    return {
      totalSessions,
      correctAnswers,
      averageResponseTime
    };
  }
}