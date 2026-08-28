import { WebClient } from '@slack/web-api';
import { prisma } from '../config/database.js';
import { redisConnection } from '../config/redis.js';
import { getSlackNotificationKey } from '../utils/idempotency.js';
import { logger } from '../utils/logger.js';

export class SlackService {
  /**
   * Stores Slack connection details for a user.
   */
  static async saveSlackConnection(userId: string, accessToken: string, teamId: string, teamName: string) {
    return prisma.slackConnection.upsert({
      where: { userId },
      update: { accessToken, teamId, teamName },
      create: { userId, accessToken, teamId, teamName },
    });
  }

  static async getSlackConnection(userId: string) {
    return prisma.slackConnection.findUnique({
      where: { userId },
    });
  }

  static async removeSlackConnection(userId: string) {
    return prisma.slackConnection.deleteMany({
      where: { userId },
    });
  }

  /**
   * Sends a rate limit alert message to the connected Slack workspace if available.
   * Ensures only 1 notification is sent per sender per hour window.
   */
  static async notifyRateLimitReached(
    userId: string,
    senderEmail: string,
    senderId: string,
    hourlyLimit: number,
    hourWindow: string
  ): Promise<boolean> {
    try {
      // Check Redis key for duplicate notification prevention
      const notificationKey = getSlackNotificationKey(senderId, hourWindow);
      const isFirstNotice = await redisConnection.set(notificationKey, '1', 'EX', 7200, 'NX');

      if (!isFirstNotice) {
        logger.debug({ senderId, hourWindow }, 'Slack notification already sent for this sender/hour');
        return false;
      }

      // Check if user has connected Slack
      const slackConn = await this.getSlackConnection(userId);
      if (!slackConn || !slackConn.accessToken) {
        logger.info({ userId }, 'Slack not connected for user; skipping rate limit alert');
        return false;
      }

      const client = new WebClient(slackConn.accessToken);

      // Post message to user's general/default channel or DM
      await client.chat.postMessage({
        channel: '#general',
        text: `⚠️ *ReachInbox Email Rate Limit Reached*`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '⚠️ Email Rate Limit Reached',
              emoji: true,
            },
          },
          {
            type: 'section',
            fields: [
              { type: 'mrkdwn', text: `*Sender:*\n${senderEmail}` },
              { type: 'mrkdwn', text: `*Hourly Limit:*\n${hourlyLimit} emails/hour` },
              { type: 'mrkdwn', text: `*Window:*\n${hourWindow}` },
              { type: 'mrkdwn', text: `*Action:*\nRescheduled to next hour` },
            ],
          },
        ],
      });

      logger.info({ senderEmail, hourWindow }, 'Slack rate limit notification sent successfully');
      return true;
    } catch (error) {
      logger.error({ error, senderEmail }, 'Failed to send Slack notification');
      return false;
    }
  }
}
