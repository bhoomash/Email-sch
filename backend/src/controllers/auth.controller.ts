import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { AuthService } from '../services/auth.service.js';
import { devLoginSchema } from '../validators/auth.validator.js';

export class AuthController {
  static async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const { id, googleId, name, email, avatar, createdAt } = req.user;

      return res.json({
        success: true,
        data: {
          id,
          googleId,
          name,
          email,
          avatar,
          createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async devLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = devLoginSchema.parse(req.body);
      const user = await AuthService.getDevUser(validated.email, validated.name);

      (req.session as any).userId = user.id;

      return res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static googleCallback(req: Request, res: Response) {
    if (req.user) {
      (req.session as any).userId = req.user.id;
    }
    return res.redirect(env.FRONTEND_URL);
  }

  static logout(req: Request, res: Response, next: NextFunction) {
    req.logout?.((err) => {
      if (err) return next(err);
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        return res.json({
          success: true,
          message: 'Logged out successfully',
        });
      });
    });
  }
}
