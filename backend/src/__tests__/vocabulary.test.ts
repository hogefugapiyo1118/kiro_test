import express from 'express';
import request from 'supertest';
import vocabularyRoutes from '../routes/vocabulary';
import { errorHandler } from '../middleware/errorHandler';

describe('Vocabulary API Basic Test', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/vocabulary', vocabularyRoutes);
  app.use(errorHandler);

  it('sanity math', () => {
    expect(1 + 1).toBe(2);
  });

  it('GET /api/vocabulary without auth should return 401', async () => {
    const res = await request(app).get('/api/vocabulary');
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });
});