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

  // Supabase errors
  if (error.message.includes('duplicate key')) {
    return res.status(409).json({
      error: 'Resource already exists',
      status: 'error'
    });
  }

  // Default error
  return res.status(500).json({
    error: 'Internal server error',
    status: 'error'
  });
};