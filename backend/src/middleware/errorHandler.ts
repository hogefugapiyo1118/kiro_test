import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 400);
  }
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
      status: 'error'
    });
  }

  // Supabase authentication errors
  if (error.message.includes('Invalid login credentials')) {
    return res.status(401).json({
      error: 'Invalid email or password',
      status: 'error'
    });
  }

  if (error.message.includes('Email not confirmed')) {
    return res.status(401).json({
      error: 'Please confirm your email address before signing in',
      status: 'error'
    });
  }

  if (error.message.includes('User already registered')) {
    return res.status(409).json({
      error: 'An account with this email already exists',
      status: 'error'
    });
  }

  // Supabase database errors
  if (error.message.includes('duplicate key')) {
    return res.status(409).json({
      error: 'Resource already exists',
      status: 'error'
    });
  }

  // JWT token errors
  if (error.message.includes('jwt') || error.message.includes('token')) {
    return res.status(401).json({
      error: 'Invalid or expired token',
      status: 'error'
    });
  }

  // Default error
  return res.status(500).json({
    error: 'Internal server error',
    status: 'error'
  });
};