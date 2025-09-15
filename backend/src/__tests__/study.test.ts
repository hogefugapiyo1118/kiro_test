import express from 'express';
import request from 'supertest';
import studyRoutes from '../routes/study';
import { errorHandler } from '../middleware/errorHandler';

describe('Study API Basic Test', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/study', studyRoutes);
  app.use(errorHandler);

  it('sanity math', () => {
    expect(1 + 1).toBe(2);
  });

  it('GET /api/study/session without auth should return 401', async () => {
    const res = await request(app).get('/api/study/session');
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('POST /api/study/result without auth should return 401', async () => {
    const res = await request(app)
      .post('/api/study/result')
      .send({
        vocabulary_id: 'test-id',
        is_correct: true
      });
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('GET /api/study/stats without auth should return 401', async () => {
    const res = await request(app).get('/api/study/stats');
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('GET /api/study/history without auth should return 401', async () => {
    const res = await request(app).get('/api/study/history');
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });
});