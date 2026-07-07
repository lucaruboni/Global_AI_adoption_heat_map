import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/ApiError';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  // Zod validation errors → 400 with field details
  if (err instanceof ZodError) {
    logger.warn('Validation error', { issues: err.issues });
    return res.status(400).json({
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        status: 400,
        details: err.flatten().fieldErrors,
      },
    });
  }

  if (err instanceof ApiError) {
    if (err.status >= 500) {
      logger.error('Application error', { message: err.message, code: err.code, stack: err.stack });
    } else {
      logger.warn('Request error', { message: err.message, code: err.code });
    }
    return res.status(err.status).json({
      error: { message: err.message, code: err.code, status: err.status },
    });
  }

  const message = err instanceof Error ? err.message : 'Internal server error';
  logger.error('Unhandled error', {
    message,
    stack: err instanceof Error ? err.stack : undefined,
  });

  return res.status(500).json({
    error: { message: 'Internal server error', code: 'INTERNAL_ERROR', status: 500 },
  });
};
