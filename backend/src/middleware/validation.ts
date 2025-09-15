import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from './errorHandler';

export interface ValidationOptions {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  headers?: Joi.ObjectSchema;
}

/**
 * Validation middleware factory
 * Creates middleware that validates request data against Joi schemas
 */
export const validate = (options: ValidationOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: any[] = [];

    // Validate request body
    if (options.body) {
      const { error, value } = options.body.validate(req.body, {
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: true
      });

      if (error) {
        errors.push(...error.details.map(detail => ({
          field: `body.${detail.path.join('.')}`,
          message: detail.message,
          value: detail.context?.value
        })));
      } else {
        req.body = value; // Use validated and sanitized value
      }
    }

    // Validate query parameters
    if (options.query) {
      const { error, value } = options.query.validate(req.query, {
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: true
      });

      if (error) {
        errors.push(...error.details.map(detail => ({
          field: `query.${detail.path.join('.')}`,
          message: detail.message,
          value: detail.context?.value
        })));
      } else {
        req.query = value; // Use validated and sanitized value
      }
    }

    // Validate URL parameters
    if (options.params) {
      const { error, value } = options.params.validate(req.params, {
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: true
      });

      if (error) {
        errors.push(...error.details.map(detail => ({
          field: `params.${detail.path.join('.')}`,
          message: detail.message,
          value: detail.context?.value
        })));
      } else {
        req.params = value; // Use validated and sanitized value
      }
    }

    // Validate headers
    if (options.headers) {
      const { error, value } = options.headers.validate(req.headers, {
        abortEarly: false,
        allowUnknown: true, // Allow unknown headers
        stripUnknown: false
      });

      if (error) {
        errors.push(...error.details.map(detail => ({
          field: `headers.${detail.path.join('.')}`,
          message: detail.message,
          value: detail.context?.value
        })));
      }
    }

    // If there are validation errors, throw ValidationError
    if (errors.length > 0) {
      const errorMessage = `バリデーションエラー: ${errors.length}個の項目に問題があります`;
      const validationError = new ValidationError(errorMessage);
      
      // Add details to the error for the error handler to use
      (validationError as any).details = errors;
      
      return next(validationError);
    }

    next();
  };
};

/**
 * Shorthand validation functions for common use cases
 */
export const validateBody = (schema: Joi.ObjectSchema) => validate({ body: schema });
export const validateQuery = (schema: Joi.ObjectSchema) => validate({ query: schema });
export const validateParams = (schema: Joi.ObjectSchema) => validate({ params: schema });
export const validateHeaders = (schema: Joi.ObjectSchema) => validate({ headers: schema });

/**
 * Combine body and query validation
 */
export const validateBodyAndQuery = (bodySchema: Joi.ObjectSchema, querySchema: Joi.ObjectSchema) => 
  validate({ body: bodySchema, query: querySchema });

/**
 * Combine params and body validation
 */
export const validateParamsAndBody = (paramsSchema: Joi.ObjectSchema, bodySchema: Joi.ObjectSchema) => 
  validate({ params: paramsSchema, body: bodySchema });

/**
 * Combine params and query validation
 */
export const validateParamsAndQuery = (paramsSchema: Joi.ObjectSchema, querySchema: Joi.ObjectSchema) => 
  validate({ params: paramsSchema, query: querySchema });