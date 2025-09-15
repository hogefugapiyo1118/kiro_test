import request from 'supertest';
import express from 'express';
import { errorHandler, ValidationError, AuthenticationError, NotFoundError } from '../middleware/errorHandler';
import { validate, validateBody } from '../middleware/validation';
import { vocabularySchemas } from '../validators/joiSchemas';

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Test route that throws different types of errors
  app.post('/test/validation', validateBody(vocabularySchemas.create), (req, res) => {
    res.json({ success: true });
  });
  
  app.get('/test/auth-error', (req, res, next) => {
    next(new AuthenticationError('認証が必要です'));
  });
  
  app.get('/test/not-found', (req, res, next) => {
    next(new NotFoundError('リソースが見つかりません'));
  });
  
  app.get('/test/validation-error', (req, res, next) => {
    next(new ValidationError('バリデーションエラー'));
  });
  
  app.get('/test/generic-error', (req, res, next) => {
    next(new Error('予期しないエラー'));
  });
  
  // Apply error handler
  app.use(errorHandler);
  
  return app;
};

describe('Error Handling Middleware', () => {
  let app: express.Application;
  
  beforeEach(() => {
    app = createTestApp();
  });

  describe('Validation Errors', () => {
    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/test/validation')
        .send({
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('バリデーションエラー');
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.details).toBeDefined();
      expect(Array.isArray(response.body.details)).toBe(true);
    });

    it('should return 400 for invalid field values', async () => {
      const response = await request(app)
        .post('/test/validation')
        .send({
          english_word: '', // Empty string
          japanese_meanings: [] // Empty array
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('バリデーションエラー');
      expect(response.body.details).toBeDefined();
    });

    it('should accept valid data', async () => {
      const response = await request(app)
        .post('/test/validation')
        .send({
          english_word: 'test',
          japanese_meanings: [
            {
              meaning: 'テスト'
            }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Authentication Errors', () => {
    it('should return 401 for authentication errors', async () => {
      const response = await request(app)
        .get('/test/auth-error');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('認証が必要です');
      expect(response.body.code).toBe('AUTH_ERROR');
      expect(response.body.status).toBe('error');
    });
  });

  describe('Not Found Errors', () => {
    it('should return 404 for not found errors', async () => {
      const response = await request(app)
        .get('/test/not-found');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('リソースが見つかりません');
      expect(response.body.code).toBe('NOT_FOUND');
    });
  });

  describe('Validation Errors (Custom)', () => {
    it('should return 400 for custom validation errors', async () => {
      const response = await request(app)
        .get('/test/validation-error');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('バリデーションエラー');
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Generic Errors', () => {
    it('should return 500 for unhandled errors', async () => {
      const response = await request(app)
        .get('/test/generic-error');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('予期しないエラーが発生しました');
      expect(response.body.code).toBe('INTERNAL_SERVER_ERROR');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBe('/test/generic-error');
      expect(response.body.method).toBe('GET');
    });
  });

  describe('Error Response Format', () => {
    it('should include standard error response fields', async () => {
      const response = await request(app)
        .get('/test/auth-error');

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('path');
      expect(response.body).toHaveProperty('method');
      expect(response.body).toHaveProperty('code');
    });
  });
});