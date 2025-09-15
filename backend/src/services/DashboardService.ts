import { DailyStatsRepository } from '../repositories/DailyStatsRepository';
import { VocabularyRepository } from '../repositories/VocabularyRepository';
import { DashboardStats } from '../types/index';

export class DashboardService {
  constructor(
    private dailyStatsRepository: DailyStatsRepository,
    private vocabularyRepository: VocabularyRepository
  ) {}

  async getDashboardStats(userId: string): Promise<DashboardStats> {
    // Get all vocabulary counts by mastery level
    const allVocabulary = await this.vocabularyRepository.findByUserId(userId);
    const totalVocabulary = allVocabulary.length;
    const masteredVocabulary = allVocabulary.filter(v => v.mastery_level === 2).length;

    // Get today's study stats
    const todayStats = await this.dailyStatsRepository.getTodayStats(userId);
    const todayStudied = todayStats?.words_studied || 0;

    // Get current streak
    const currentStreak = await this.dailyStatsRepository.getStreakDays(userId);

    // Get weekly progress (last 7 days)
    const weeklyProgress = await this.dailyStatsRepository.getWeeklyStats(userId);

    // Get total stats
    const totalStats = await this.dailyStatsRepository.getTotalStats(userId);

    return {
      totalVocabulary,
      masteredVocabulary,
      todayStudied,
      currentStreak,
      weeklyProgress,
      totalStats
    };
  }

  async getWeeklyProgress(userId: string): Promise<{ date: string; wordsStudied: number; correctAnswers: number; accuracy: number }[]> {
    const weeklyStats = await this.dailyStatsRepository.getWeeklyStats(userId);
    
    // Fill in missing days with zero values
    const result = [];
    const endDate = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(endDate.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const dayStats = weeklyStats.find(stat => stat.study_date === dateString);
      const wordsStudied = dayStats?.words_studied || 0;
      const correctAnswers = dayStats?.correct_answers || 0;
      const accuracy = wordsStudied > 0 ? (correctAnswers / wordsStudied) * 100 : 0;
      
      result.push({
        date: dateString,
        wordsStudied,
        correctAnswers,
        accuracy: Math.round(accuracy * 100) / 100 // Round to 2 decimal places
      });
    }
    
    return result;
  }
}