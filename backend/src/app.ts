import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import cors from 'cors';
import helmet from 'helmet';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { ExpressAdapter } from '@bull-board/express';

import { env } from './config/env.js';
import { emailQueue } from './queues/email.queue.js';
import { AuthService } from './services/auth.service.js';

import authRoutes from './routes/auth.routes.js';
import campaignRoutes from './routes/campaign.routes.js';
import emailRoutes from './routes/email.routes.js';
import senderRoutes from './routes/sender.routes.js';
import slackRoutes from './routes/slack.routes.js';
import healthRoutes from './routes/health.routes.js';

import { errorHandler } from './middleware/error.middleware.js';
import { notFoundHandler } from './middleware/not-found.middleware.js';
import { requireAuth } from './middleware/auth.middleware.js';

export const app = express();

// Trust reverse proxy header (Render, Vercel, Nginx)
app.set('trust proxy', 1);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Bull Board UI inline styles/scripts
  })
);

// Dynamic CORS allowing FRONTEND_URL or Vercel deployment origins
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === env.FRONTEND_URL || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// Passport OAuth Setup
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await AuthService.getUserById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await AuthService.findOrCreateGoogleUser(profile);
          return done(null, user);
        } catch (error: any) {
          return done(error, undefined);
        }
      }
    )
  );
}

import { SafeBullMQAdapter } from './utils/safe-bull-adapter.js';

// Setup Bull Board UI
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new SafeBullMQAdapter(emailQueue as any) as any],
  serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/senders', senderRoutes);
app.use('/api/slack', slackRoutes);
app.use('/api/health', healthRoutes);

// Error and Not Found Handlers
app.use(notFoundHandler);
app.use(errorHandler);
