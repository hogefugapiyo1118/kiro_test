import { SupabaseClient } from '@supabase/supabase-js';
import { VocabularyRepository, StudySessionRepository, DailyStatsRepository } from '../repositories/index.js';
import { StudySessionValidator } from '../validators/index.js';
import { 
  StudySession, 
  StudySessionRequest, 
  VocabularyWithMeanings,
  DashboardStats 
} from '../types/index.js';

export class StudyService {
  private vocabularyRepo: VocabularyRepository;
  private studySessionRepo: StudySessionRepository;
  private dailyStatsRepo: DailyStatsRepository;

  constructor(private supabase: SupabaseClient) {
    this.vocabularyRepo = new VocabularyRepository(supabase);
    this.studySessionRepo = new StudySessionRepository(supabase);
    this.dailyStatsRepo = new DailyStatsRepository(supabase);
  }

  async startStudySession(userId: string, limit: number = 10): Promise<VocabularyWithMeanings[]> {
    return this.vocabularyRepo.getRandomForStudy(userId, limit);
  }

  async recordStudyResult(userId: string, request: StudySessionRequest): Promise<StudySession> {
    // Validate study session data
    const validation = StudySessionValidator.validateStudySession(request);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Verify vocabulary belongs to user
    const vocabulary = await this.vocabularyRepo.findById(request.vocabulary_id, userId);
    if (!vocabulary) {
      throw new Error('Vocabulary not found or access denied');
    }

    // Create study session record
    const sessionData = {
      user_id: userId,
      vocabulary_id: request.vocabulary_id,
      is_correct: request.is_correct,
      response_time: request.response_time
    };

    const studySession = await this.studySessionRepo.create(sessionData);

    // Update daily stats
    const studyTime = request.response_time ? Math.round(request.response_time / 1000) : 0; // Convert to seconds
    await this.dailyStatsRepo.incrementTodayStats(
      userId,
      1, // words studied
      request.is_correct ? 1 : 0, // correct answers
      studyTime
    );

    // Update vocabulary mastery level based on recent performance
    await this.updateVocabularyMastery(userId, request.vocabulary_id);

    return studySession;
  }

  async getStudyStats(userId: string, vocabularyId?: string): Promise<{
    totalSessions: number;
    correctAnswers: number;
    averageResponseTime: number;
  }> {
    return this.studySessionRepo.getStudyStats(userId, vocabularyId);
  }

  async getDashboardStats(userId: string): Promise<DashboardStats> {
    // Get vocabulary counts
    const allVocabulary = await this.vocabularyRepo.findByUserId(userId);
    const totalVocabulary = allVocabulary.length;
    const masteredVocabulary = allVocabulary.filter(v => v.mastery_level === 2).length;

    // Get today's stats
    const todayStats = await this.dailyStatsRepo.getTodayStats(userId);
    const todayStudied = todayStats?.words_studied || 0;

    // Get streak
    const currentStreak = await this.dailyStatsRepo.getStreakDays(userId);

    // Get weekly progress
    const weeklyProgress = await this.dailyStatsRepo.getWeeklyStats(userId);

    // Get total stats
    const totalStats = await this.dailyStatsRepo.getTotalStats(userId);

    return {
      totalVocabulary,
      masteredVocabulary,
      todayStudied,
      currentStreak,
      weeklyProgress,
      totalStats
    };
  }

  async getRecentStudySessions(userId: string, limit: number = 50): Promise<StudySession[]> {
    return this.studySessionRepo.findByUserId(userId, limit);
  }

  private async updateVocabularyMastery(userId: string, vocabularyId: string): Promise<void> {
    // Get recent study sessions for this vocabulary (last 10 sessions)
    const recentSessions = await this.studySessionRepo.findByVocabularyId(vocabularyId, userId);
    
    if (recentSessions.length < 3) {
      // Not enough data to determine mastery
      return;
    }

    const last10Sessions = recentSessions.slice(0, 10);
    const correctCount = last10Sessions.filter(session => session.is_correct).length;
    const accuracy = correctCount / last10Sessions.length;

    // Get current vocabulary
    const vocabulary = await this.vocabularyRepo.findById(vocabularyId, userId);
    if (!vocabulary) return;

    let newMasteryLevel = vocabulary.mastery_level;

    // Determine new mastery level based on recent performance
    if (accuracy >= 0.8 && last10Sessions.length >= 5) {
      // High accuracy with sufficient attempts - mark as mastered
      newMasteryLevel = 2;
    } else if (accuracy >= 0.5 && last10Sessions.length >= 3) {
      // Moderate accuracy - mark as learning
      newMasteryLevel = 1;
    } else if (accuracy < 0.3 && last10Sessions.length >= 5) {
      // Low accuracy - mark as not learned
      newMasteryLevel = 0;
    }

    // Update mastery level if it changed
    if (newMasteryLevel !== vocabulary.mastery_level) {
      await this.vocabularyRepo.update(vocabularyId, userId, { mastery_level: newMasteryLevel });
    }
  }
}