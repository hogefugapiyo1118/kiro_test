import { SupabaseClient } from '@supabase/supabase-js';
import { DailyStats } from '../types/index.js';

export class DailyStatsRepository {
  constructor(private supabase: SupabaseClient) {}

  async upsert(stats: Omit<DailyStats, 'id' | 'created_at'>): Promise<DailyStats> {
    const { data, error } = await this.supabase
      .from('daily_stats')
      .upsert(stats, {
        onConflict: 'user_id,study_date'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to upsert daily stats: ${error.message}`);
    }

    return data;
  }

  async findByUserId(userId: string, limit?: number): Promise<DailyStats[]> {
    let query = this.supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', userId)
      .order('study_date', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch daily stats: ${error.message}`);
    }

    return data || [];
  }

  async findByDateRange(userId: string, startDate: string, endDate: string): Promise<DailyStats[]> {
    const { data, error } = await this.supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', userId)
      .gte('study_date', startDate)
      .lte('study_date', endDate)
      .order('study_date', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch daily stats by date range: ${error.message}`);
    }

    return data || [];
  }

  async getTodayStats(userId: string): Promise<DailyStats | null> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    const { data, error } = await this.supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('study_date', today)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch today's stats: ${error.message}`);
    }

    return data;
  }

  async getWeeklyStats(userId: string): Promise<DailyStats[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6); // Last 7 days

    return this.findByDateRange(
      userId,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
  }

  async getTotalStats(userId: string): Promise<{
    totalWordsStudied: number;
    totalCorrectAnswers: number;
    totalStudyTime: number;
    studyDays: number;
    averageAccuracy: number;
  }> {
    const { data, error } = await this.supabase
      .from('daily_stats')
      .select('words_studied, correct_answers, total_study_time')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to get total stats: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return {
        totalWordsStudied: 0,
        totalCorrectAnswers: 0,
        totalStudyTime: 0,
        studyDays: 0,
        averageAccuracy: 0
      };
    }

    const totalWordsStudied = data.reduce((sum, day) => sum + day.words_studied, 0);
    const totalCorrectAnswers = data.reduce((sum, day) => sum + day.correct_answers, 0);
    const totalStudyTime = data.reduce((sum, day) => sum + day.total_study_time, 0);
    const studyDays = data.length;
    const averageAccuracy = totalWordsStudied > 0 ? (totalCorrectAnswers / totalWordsStudied) * 100 : 0;

    return {
      totalWordsStudied,
      totalCorrectAnswers,
      totalStudyTime,
      studyDays,
      averageAccuracy
    };
  }

  async getStreakDays(userId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('daily_stats')
      .select('study_date')
      .eq('user_id', userId)
      .gt('words_studied', 0) // Only count days with actual study
      .order('study_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to get streak days: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return 0;
    }

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < data.length; i++) {
      const studyDate = new Date(data[i].study_date);
      studyDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (studyDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  async incrementTodayStats(userId: string, wordsStudied: number, correctAnswers: number, studyTime: number): Promise<DailyStats> {
    const today = new Date().toISOString().split('T')[0];
    
    // Get current stats or create new ones
    const currentStats = await this.getTodayStats(userId);
    
    const updatedStats = {
      user_id: userId,
      study_date: today,
      words_studied: (currentStats?.words_studied || 0) + wordsStudied,
      correct_answers: (currentStats?.correct_answers || 0) + correctAnswers,
      total_study_time: (currentStats?.total_study_time || 0) + studyTime
    };

    return this.upsert(updatedStats);
  }
}