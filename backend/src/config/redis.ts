import { Redis } from 'ioredis';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export const redisConnection = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
});

redisConnection.on('connect', () => {
  logger.info('Redis connected successfully');
});

redisConnection.on('error', (err) => {
  logger.error({ err }, 'Redis connection error');
});

export async function checkRedisHealth(): Promise<boolean> {
  try {
    const pong = await redisConnection.ping();
    return pong === 'PONG';
  } catch (error) {
    logger.error({ error }, 'Redis health check failed');
    return false;
  }
}
