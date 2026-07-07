import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/AuthService';
import { ApiError } from '../utils/ApiError';

/** Attaches the authenticated user's id/email to the request, or throws 401. */
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) {
    throw new ApiError('Missing or malformed Authorization header', 401, 'NO_TOKEN');
  }

  const token = header.slice('Bearer '.length).trim();
  const claims = authService.verifyToken(token);
  req.userId = claims.sub;
  req.userEmail = claims.email;
  next();
};
