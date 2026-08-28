import { Redis } from 'ioredis';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export const redisConnection = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
  lazyConnect: true,
});

redisConnection.on('connect', () => {
  logger.info('✓ Redis connected');
});

redisConnection.on('error', (err) => {
  logger.error({ err }, '✗ Redis connection error');
});

export async function checkRedisHealth(): Promise<boolean> {
  try {
    const pong = await redisConnection.ping();
    if (pong === 'PONG') {
      logger.info('✓ Redis health verified');
      return true;
    }
    logger.error('✗ Redis ping failed');
    return false;
  } catch (error) {
    logger.error({ error }, '✗ Redis connection failed');
    return false;
  }
}
