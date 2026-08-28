import { Router } from 'express';
import passport from 'passport';
import { AuthController } from '../controllers/auth.controller.js';

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

// Current user profile
router.get('/me', AuthController.getCurrentUser);

// Logout
router.post('/logout', AuthController.logout);

export default router;
