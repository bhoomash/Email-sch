import { redisConnection } from '../config/redis.js';
import { getRateLimitKey, getSenderLastSentKey } from '../utils/idempotency.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export interface RateLimitCheckResult {
  allowed: boolean;
  currentCount: number;
  limit: number;
  hourWindow: string;
  nextHourStart?: Date;
}

export class RateLimitService {
  /**
   * Atomically checks and increments the hourly send count for a sender.
   */
  static async checkAndIncrementSenderLimit(senderId: string, maxHourlyLimit: number): Promise<RateLimitCheckResult> {
    const now = new Date();
    const key = getRateLimitKey(senderId, now);
    const hourWindow = key.split(':').pop() || '';

    // Atomic INCR
    const currentCount = await redisConnection.incr(key);

    // Set TTL on first increment (2 hours buffer)
    if (currentCount === 1) {
      await redisConnection.expire(key, 7200);
    }

    const effectiveLimit = Math.min(maxHourlyLimit, env.MAX_EMAILS_PER_HOUR_PER_SENDER);

    if (currentCount > effectiveLimit) {
      const nextHourStart = this.getNextHourWindow(now);
      return {
        allowed: false,
        currentCount,
        limit: effectiveLimit,
        hourWindow,
        nextHourStart,
      };
    }

    return {
      allowed: true,
      currentCount,
      limit: effectiveLimit,
      hourWindow,
    };
  }

  /**
   * Enforces minimum send delay between emails for a specific sender across distributed workers.
   */
  static async enforceMinimumSenderDelay(senderId: string, minDelayMs = env.MIN_SEND_DELAY_MS): Promise<void> {
    const key = getSenderLastSentKey(senderId);
    const now = Date.now();
    const lastSentStr = await redisConnection.get(key);

    if (lastSentStr) {
      const lastSent = parseInt(lastSentStr, 10);
      const elapsed = now - lastSent;
      if (elapsed < minDelayMs) {
        const sleepTime = minDelayMs - elapsed;
        logger.debug({ senderId, sleepTime }, 'Enforcing minimum send delay between emails');
        await new Promise((resolve) => setTimeout(resolve, sleepTime));
      }
    }

    // Update last sent timestamp
    await redisConnection.set(key, Date.now().toString(), 'PX', 3600000);
  }

  /**
   * Calculates the Date object for the start of the next hour window.
   */
  static getNextHourWindow(date = new Date()): Date {
    const nextHour = new Date(date);
    nextHour.setUTCHours(nextHour.getUTCHours() + 1, 0, 0, 0);
    return nextHour;
  }
}
