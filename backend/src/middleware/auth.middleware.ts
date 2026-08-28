import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errors.js';
import { env } from '../config/env.js';
import { AuthService } from '../services/auth.service.js';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return next();
  }

  // Developer auth fallback if DEV_AUTH_MODE is active and user session exists or auto-attaches demo user
  if (env.DEV_AUTH_MODE === 'true') {
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
  }

  return next(new UnauthorizedError('Authentication required'));
}
