import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTH_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
    if (details) {
      this.message = `${message}: ${details}`;
    }
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT');
  }
}

interface ErrorResponse {
  error: string;
  status: 'error';
  code?: string;
  details?: any;
  timestamp: string;
  path: string;
  method: string;
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error details
  const errorLog = {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    timestamp: new Date().toISOString(),
    userAgent: req.get('User-Agent'),
    ip: req.ip
  };

  // Log to console in development, in production you might want to use a proper logger
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Details:', errorLog);
  } else {
    console.error('Error:', {
      message: error.message,
      url: req.url,
      method: req.method,
      timestamp: errorLog.timestamp
    });
  }

  const baseResponse: ErrorResponse = {
    error: 'Internal server error',
    status: 'error',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };

  // Handle Joi validation errors
  if (Joi.isError(error)) {
    return res.status(400).json({
      ...baseResponse,
      error: 'バリデーションエラーが発生しました',
      code: 'VALIDATION_ERROR',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }))
    });
  }

  // Handle custom app errors
  if (error instanceof AppError) {
    const response: any = {
      ...baseResponse,
      error: error.message,
      code: error.code
    };

    // Add validation details if available
    if ((error as any).details) {
      response.details = (error as any).details;
    }

    return res.status(error.statusCode).json(response);
  }

  // Handle Supabase authentication errors
  if (error.message.includes('Invalid login credentials')) {
    return res.status(401).json({
      ...baseResponse,
      error: 'メールアドレスまたはパスワードが正しくありません',
      code: 'INVALID_CREDENTIALS'
    });
  }

  if (error.message.includes('Email not confirmed')) {
    return res.status(401).json({
      ...baseResponse,
      error: 'メールアドレスの確認が完了していません',
      code: 'EMAIL_NOT_CONFIRMED'
    });
  }

  if (error.message.includes('User already registered')) {
    return res.status(409).json({
      ...baseResponse,
      error: 'このメールアドレスは既に登録されています',
      code: 'USER_ALREADY_EXISTS'
    });
  }

  // Handle Supabase database errors
  if (error.message.includes('duplicate key')) {
    return res.status(409).json({
      ...baseResponse,
      error: 'データが既に存在します',
      code: 'DUPLICATE_RESOURCE'
    });
  }

  if (error.message.includes('foreign key')) {
    return res.status(400).json({
      ...baseResponse,
      error: '関連するデータが見つかりません',
      code: 'FOREIGN_KEY_VIOLATION'
    });
  }

  // Handle JWT token errors
  if (error.message.includes('jwt') || error.message.includes('token')) {
    return res.status(401).json({
      ...baseResponse,
      error: '認証トークンが無効または期限切れです',
      code: 'INVALID_TOKEN'
    });
  }

  // Handle network/connection errors
  if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
    return res.status(503).json({
      ...baseResponse,
      error: 'サービスが一時的に利用できません',
      code: 'SERVICE_UNAVAILABLE'
    });
  }

  // Handle timeout errors
  if (error.message.includes('timeout')) {
    return res.status(408).json({
      ...baseResponse,
      error: 'リクエストがタイムアウトしました',
      code: 'REQUEST_TIMEOUT'
    });
  }

  // Handle payload too large errors
  if (error.message.includes('PayloadTooLargeError') || error.message.includes('entity too large')) {
    return res.status(413).json({
      ...baseResponse,
      error: 'リクエストのサイズが大きすぎます',
      code: 'PAYLOAD_TOO_LARGE'
    });
  }

  // Handle syntax errors (malformed JSON, etc.)
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({
      ...baseResponse,
      error: 'リクエストの形式が正しくありません',
      code: 'MALFORMED_REQUEST'
    });
  }

  // Default error response
  return res.status(500).json({
    ...baseResponse,
    error: '予期しないエラーが発生しました',
    code: 'INTERNAL_SERVER_ERROR'
  });
};