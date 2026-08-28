import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/reachinbox?schema=public'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  ELASTICSEARCH_URL: z.string().default('http://localhost:9200'),
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
  GOOGLE_CALLBACK_URL: z.string().default('http://localhost:5000/api/auth/google/callback'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  SESSION_SECRET: z.string().default('reachinbox-session-secret-key-12345'),
  ETHEREAL_HOST: z.string().default('smtp.ethereal.email'),
  ETHEREAL_PORT: z.string().transform(Number).default('587'),
  ETHEREAL_USER: z.string().optional().default(''),
  ETHEREAL_PASSWORD: z.string().optional().default(''),
  WORKER_CONCURRENCY: z.string().transform(Number).default('10'),
  MIN_SEND_DELAY_MS: z.string().transform(Number).default('2000'),
  MAX_EMAILS_PER_HOUR_PER_SENDER: z.string().transform(Number).default('50'),
  SLACK_CLIENT_ID: z.string().optional().default(''),
  SLACK_CLIENT_SECRET: z.string().optional().default(''),
  SLACK_REDIRECT_URI: z.string().default('http://localhost:5000/api/slack/callback'),
  LOG_LEVEL: z.string().default('info'),
  DEV_AUTH_MODE: z.string().optional().default('true'),
});

export const env = envSchema.parse(process.env);
