import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errors.js';
import { env } from '../config/env.js';
import { AuthService } from '../services/auth.service.js';
import { logger } from '../utils/logger.js';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  // 1. Passport session authentication (Google OAuth)
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return next();
  }

  // 2. Session userId resolution (Dev Login or explicit session)
  const sessionUserId = (req.session as any)?.userId;
  if (sessionUserId) {
    try {
      const user = await AuthService.getUserById(sessionUserId);
      if (user) {
        req.user = user;
        return next();
      }
    } catch (error) {
      logger.warn({ sessionUserId }, 'Database error resolving session user');
    }
  }

  // 3. Reject unauthenticated requests
  return next(new UnauthorizedError('Authentication required'));
}

