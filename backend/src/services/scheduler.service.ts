import { enqueueEmailJob } from '../queues/email.queue.js';
import { prisma, withDbRetry } from '../config/database.js';
import { logger } from '../utils/logger.js';

export class SchedulerService {
  /**
   * Enqueues a list of created email records into BullMQ or in-process queue as delayed jobs.
   */
  static async scheduleEmailJobs(
    emails: Array<{ id: string; campaignId: string; senderId: string; scheduledAt: Date }>,
    userId: string
  ): Promise<void> {
    const now = Date.now();

    for (const email of emails) {
      const scheduledTime = email.scheduledAt.getTime();
      const delayMs = Math.max(0, scheduledTime - now);

      await enqueueEmailJob(
        {
          emailId: email.id,
          campaignId: email.campaignId,
          senderId: email.senderId,
          userId,
        },
        delayMs
      );
    }
  }

  /**
   * Recovers any emails stuck in SCHEDULED status in DB and dispatches them.
   */
  static async recoverScheduledEmails(): Promise<number> {
    try {
      const pendingEmails = await withDbRetry(() =>
        prisma.email.findMany({
          where: { status: 'SCHEDULED' },
          select: {
            id: true,
            campaignId: true,
            senderId: true,
            scheduledAt: true,
            campaign: { select: { userId: true } },
          },
        })
      );

      if (pendingEmails.length === 0) return 0;

      logger.info({ count: pendingEmails.length }, 'Found pending SCHEDULED emails — enqueuing for dispatch');

      const now = Date.now();
      for (const email of pendingEmails) {
        const delayMs = Math.max(0, email.scheduledAt.getTime() - now);
        await enqueueEmailJob(
          {
            emailId: email.id,
            campaignId: email.campaignId,
            senderId: email.senderId,
            userId: email.campaign.userId,
          },
          delayMs
        );
      }

      return pendingEmails.length;
    } catch (err: any) {
      logger.warn({ err: err.message }, 'Scheduled email recovery notice');
      return 0;
    }
  }
}
