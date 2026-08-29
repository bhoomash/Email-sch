import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errors.js';
import { env } from '../config/env.js';
import { AuthService } from '../services/auth.service.js';
import { logger } from '../utils/logger.js';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return next();
  }

  // Developer auth fallback if DEV_AUTH_MODE is active
  if (env.DEV_AUTH_MODE === 'true') {
    try {
      if ((req.session as any)?.userId) {
        const devUser = await AuthService.getUserById((req.session as any).userId);
        if (devUser) {
          req.user = devUser;
          return next();
        }
      }

      // Auto-attach default demo user in dev mode
      const defaultUser = await AuthService.getDevUser();
      req.user = defaultUser;
      (req.session as any).userId = defaultUser.id;
      return next();
    } catch (error) {
      logger.warn('Database unavailable for dev auth — returning 503');
      return res.status(503).json({
        success: false,
        message: 'Database is waking up (Neon cold start). Please retry in a few seconds.',
      });
    }
  }

  return next(new UnauthorizedError('Authentication required'));
}
