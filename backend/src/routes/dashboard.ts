import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { DashboardService } from '../services/DashboardService';
import { DailyStatsRepository } from '../repositories/DailyStatsRepository';
import { VocabularyRepository } from '../repositories/VocabularyRepository';
import { supabase } from '../config/database';

const router = express.Router();

// 既存の共通 Supabase クライアントを利用することで、
// 環境変数の不整合や無効なキーによる "Expected 3 parts in JWT" エラーを防ぐ

// Initialize repositories and service
const dailyStatsRepository = new DailyStatsRepository(supabase);
const vocabularyRepository = new VocabularyRepository(supabase);
const dashboardService = new DashboardService(dailyStatsRepository, vocabularyRepository);

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics including total vocabulary, mastered words, today's study count, and streak
 */
router.get('/stats', authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    const userId = (req as any).user.id;
    const stats = await dashboardService.getDashboardStats(userId);
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/dashboard/progress
 * Get weekly progress data for the last 7 days
 */
router.get('/progress', authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    const userId = (req as any).user.id;
    const progress = await dashboardService.getWeeklyProgress(userId);
    
    res.json(progress);
  } catch (error) {
    console.error('Error fetching weekly progress:', error);
    res.status(500).json({ 
      error: 'Failed to fetch weekly progress',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;