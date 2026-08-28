import { RateLimitService } from './rate-limit.service';
import { getRateLimitKey, getSlackNotificationKey } from '../utils/idempotency';

describe('RateLimitService Utility Tests', () => {
  it('should correctly calculate the start of the next hour window', () => {
    const fixedDate = new Date('2026-08-28T14:25:30.000Z');
    const nextHour = RateLimitService.getNextHourWindow(fixedDate);

    expect(nextHour.toISOString()).toBe('2026-08-28T15:00:00.000Z');
  });

  it('should generate valid Redis rate limit keys with UTC date formatting', () => {
    const fixedDate = new Date('2026-08-28T14:05:00.000Z');
    const key = getRateLimitKey('sender-123', fixedDate);

    expect(key).toBe('email-rate:sender-123:2026082814');
  });

  it('should generate Slack notification key format correctly', () => {
    const noticeKey = getSlackNotificationKey('sender-123', '2026082814');
    expect(noticeKey).toBe('slack-rate-limit-notified:sender-123:2026082814');
  });
});
