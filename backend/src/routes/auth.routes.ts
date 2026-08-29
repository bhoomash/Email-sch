import { Router } from 'express';
import passport from 'passport';
import { AuthController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=OAuthFailed' }),
  AuthController.googleCallback
);

// Dev auth login endpoint
router.post('/dev-login', AuthController.devLogin);

// Current user profile (uses requireAuth to guarantee req.user resolution)
router.get('/me', requireAuth, AuthController.getCurrentUser);

// Logout
router.post('/logout', AuthController.logout);

export default router;
