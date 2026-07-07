import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface ApiError extends Error {
  status?: number;
  code?: string;
}

export const errorHandler = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  logger.error('Request error', {
    status,
    message,
    stack: err.stack,
    code: err.code,
  });

  return res.status(status).json({
    error: {
      message,
      code: err.code || 'INTERNAL_ERROR',
      status,
    },
  });
};
