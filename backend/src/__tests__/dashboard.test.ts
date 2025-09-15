import request from 'supertest';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dashboardRoutes from '../routes/dashboard';
import { authenticateToken } from '../middleware/auth';

// Mock Supabase
jest.mock('@supabase/supabase-js');
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

// Mock authentication middleware
jest.mock('../middleware/auth');
const mockAuthenticateToken = authenticateToken as jest.MockedFunction<typeof authenticateToken>;

describe('Dashboard API', () => {
  let app: express.Application;
  let mockSupabase: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(),
      rpc: jest.fn()
    };
    
    mockCreateClient.mockReturnValue(mockSupabase);
    
    // Mock authentication to always pass with a test user
    mockAuthenticateToken.mockImplementation(async (req: any, res: any, next: any) => {
      req.user = { id: 'test-user-id' };
      next();
      return Promise.resolve(undefined);
    });
    
    app.use('/api/dashboard', dashboardRoutes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/dashboard/stats', () => {
    it('should return dashboard statistics', async () => {
      // Mock vocabulary data
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [
              { id: '1', mastery_level: 0 },
              { id: '2', mastery_level: 1 },
              { id: '3', mastery_level: 2 },
              { id: '4', mastery_level: 2 }
            ],
            error: null
          })
        })
      });

      // Mock today's stats
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { words_studied: 5, correct_answers: 4 },
                error: null
              })
            })
          })
        })
      });

      // Mock streak calculation
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            gt: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: [
                  { study_date: new Date().toISOString().split('T')[0] }
                ],
                error: null
              })
            })
          })
        })
      });

      const response = await request(app)
        .get('/api/dashboard/stats')
        .expect(200);

      expect(response.body).toHaveProperty('totalVocabulary');
      expect(response.body).toHaveProperty('masteredVocabulary');
      expect(response.body).toHaveProperty('todayStudied');
      expect(response.body).toHaveProperty('currentStreak');
      expect(response.body).toHaveProperty('weeklyProgress');
      expect(response.body).toHaveProperty('totalStats');
    });

    it('should handle errors gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockRejectedValue(new Error('Database error'))
        })
      });

      const response = await request(app)
        .get('/api/dashboard/stats')
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Failed to fetch dashboard statistics');
    });
  });

  describe('GET /api/dashboard/progress', () => {
    it('should return weekly progress data', async () => {
      // Mock weekly stats
      const mockWeeklyData = [
        {
          study_date: new Date().toISOString().split('T')[0],
          words_studied: 10,
          correct_answers: 8
        }
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            gte: jest.fn().mockReturnValue({
              lte: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: mockWeeklyData,
                  error: null
                })
              })
            })
          })
        })
      });

      const response = await request(app)
        .get('/api/dashboard/progress')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(7); // Should return 7 days of data
      
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('date');
        expect(response.body[0]).toHaveProperty('wordsStudied');
        expect(response.body[0]).toHaveProperty('correctAnswers');
        expect(response.body[0]).toHaveProperty('accuracy');
      }
    });

    it('should handle errors gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            gte: jest.fn().mockReturnValue({
              lte: jest.fn().mockReturnValue({
                order: jest.fn().mockRejectedValue(new Error('Database error'))
              })
            })
          })
        })
      });

      const response = await request(app)
        .get('/api/dashboard/progress')
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Failed to fetch weekly progress');
    });
  });
});