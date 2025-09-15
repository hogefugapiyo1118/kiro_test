import express from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { StudyService } from '../services/StudyService';
import { supabase } from '../config/database';
import { StudySessionRequest } from '../types/index';

const router = express.Router();

// Initialize study service
const studyService = new StudyService(supabase);

/**
 * GET /api/study/session
 * Get vocabulary words for study session
 */
router.get('/session', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 10;

    if (limit < 1 || limit > 50) {
      return res.status(400).json({ 
        error: 'Limit must be between 1 and 50' 
      });
    }

    const vocabulary = await studyService.startStudySession(userId, limit);

    res.json({
      success: true,
      data: {
        vocabulary,
        session_id: `session_${Date.now()}_${userId}`,
        total_words: vocabulary.length
      }
    });
  } catch (error) {
    console.error('Error starting study session:', error);
    res.status(500).json({ 
      error: 'Failed to start study session',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/study/result
 * Record study session result
 */
router.post('/result', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const studySessionRequest: StudySessionRequest = req.body;

    // Validate required fields
    if (!studySessionRequest.vocabulary_id) {
      return res.status(400).json({ 
        error: 'vocabulary_id is required' 
      });
    }

    if (typeof studySessionRequest.is_correct !== 'boolean') {
      return res.status(400).json({ 
        error: 'is_correct must be a boolean value' 
      });
    }

    const studySession = await studyService.recordStudyResult(userId, studySessionRequest);

    res.status(201).json({
      success: true,
      data: studySession
    });
  } catch (error) {
    console.error('Error recording study result:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Validation failed')) {
        return res.status(400).json({ 
          error: error.message 
        });
      }
      if (error.message.includes('not found') || error.message.includes('access denied')) {
        return res.status(404).json({ 
          error: error.message 
        });
      }
    }

    res.status(500).json({ 
      error: 'Failed to record study result',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/study/stats
 * Get study statistics for user or specific vocabulary
 */
router.get('/stats', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const vocabularyId = req.query.vocabulary_id as string;

    const stats = await studyService.getStudyStats(userId, vocabularyId);

    res.json({
      success: true,
      data: {
        ...stats,
        accuracy: stats.totalSessions > 0 ? (stats.correctAnswers / stats.totalSessions) : 0
      }
    });
  } catch (error) {
    console.error('Error getting study stats:', error);
    res.status(500).json({ 
      error: 'Failed to get study statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/study/history
 * Get recent study sessions
 */
router.get('/history', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 50;

    if (limit < 1 || limit > 200) {
      return res.status(400).json({ 
        error: 'Limit must be between 1 and 200' 
      });
    }

    const sessions = await studyService.getRecentStudySessions(userId, limit);

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Error getting study history:', error);
    res.status(500).json({ 
      error: 'Failed to get study history',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;