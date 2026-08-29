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
  private static memoryLastSent = new Map<string, number>();
  private static memoryCounts = new Map<string, { count: number; hour: string }>();

  /**
   * Atomically checks and increments the hourly send count for a sender.
   * Gracefully falls back to in-memory counting if Redis is offline.
   */
  static async checkAndIncrementSenderLimit(senderId: string, maxHourlyLimit: number): Promise<RateLimitCheckResult> {
    const now = new Date();
    const key = getRateLimitKey(senderId, now);
    const hourWindow = key.split(':').pop() || '';
    const effectiveLimit = Math.min(maxHourlyLimit, env.MAX_EMAILS_PER_HOUR_PER_SENDER);

    let currentCount = 1;

    try {
      currentCount = await redisConnection.incr(key);
      if (currentCount === 1) {
        await redisConnection.expire(key, 7200);
      }
    } catch (err) {
      // In-memory fallback when Redis is offline
      const existing = this.memoryCounts.get(senderId);
      if (existing && existing.hour === hourWindow) {
        existing.count += 1;
        currentCount = existing.count;
      } else {
        this.memoryCounts.set(senderId, { count: 1, hour: hourWindow });
        currentCount = 1;
      }
    }

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
   * Gracefully falls back to in-memory delay when Redis is offline.
   */
  static async enforceMinimumSenderDelay(senderId: string, minDelayMs = env.MIN_SEND_DELAY_MS): Promise<void> {
    const key = getSenderLastSentKey(senderId);
    const now = Date.now();
    let lastSent: number | null = null;

    try {
      const lastSentStr = await redisConnection.get(key);
      if (lastSentStr) {
        lastSent = parseInt(lastSentStr, 10);
      }
    } catch (err) {
      lastSent = this.memoryLastSent.get(senderId) || null;
    }

    if (lastSent) {
      const elapsed = now - lastSent;
      if (elapsed < minDelayMs) {
        const sleepTime = minDelayMs - elapsed;
        logger.debug({ senderId, sleepTime }, 'Enforcing minimum send delay between emails');
        await new Promise((resolve) => setTimeout(resolve, sleepTime));
      }
    }

    const currentTimestamp = Date.now();
    this.memoryLastSent.set(senderId, currentTimestamp);

    try {
      await redisConnection.set(key, currentTimestamp.toString(), 'PX', 3600000);
    } catch (err) {
      // Silently ignore Redis offline when setting last sent timestamp
    }
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
