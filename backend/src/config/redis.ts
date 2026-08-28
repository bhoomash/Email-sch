import { Redis } from 'ioredis';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let connectionErrorLogged = false;

export const redisConnection = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
  lazyConnect: true,
  retryStrategy(times) {
    // Limit retries when Redis is offline to prevent continuous terminal log spam
    if (times > 5) {
      if (!connectionErrorLogged) {
        logger.warn('✗ Redis server is offline on localhost:6379. BullMQ queueing paused until Redis starts.');
        connectionErrorLogged = true;
      }
      return 10000; // Retry every 10 seconds silently
    }
    return Math.min(times * 500, 2000);
  },
});

redisConnection.on('connect', () => {
  connectionErrorLogged = false;
  logger.info('✓ Redis connected');
});

redisConnection.on('error', (err) => {
  if (!connectionErrorLogged) {
    logger.warn(`✗ Redis connection refused on ${env.REDIS_HOST}:${env.REDIS_PORT}. (Ensure local Redis service is running)`);
    connectionErrorLogged = true;
  }
});

export async function checkRedisHealth(): Promise<boolean> {
  try {
    const pong = await redisConnection.ping();
    if (pong === 'PONG') {
      logger.info('✓ Redis health verified');
      return true;
    }
    logger.warn('✗ Redis ping failed');
    return false;
  } catch (error) {
    logger.warn('✗ Redis server is not running on localhost:6379');
    return false;
  }
}
