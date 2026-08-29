import { enqueueEmailJob } from '../queues/email.queue.js';
import { processEmailJob } from '../queues/email.processor.js';
import { prisma, withDbRetry } from '../config/database.js';
import { logger } from '../utils/logger.js';

let isPollerRunning = false;

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
      const now = new Date();
      const dueEmails = await withDbRetry(() =>
        prisma.email.findMany({
          where: {
            status: 'SCHEDULED',
            scheduledAt: { lte: now },
          },
          select: {
            id: true,
            campaignId: true,
            senderId: true,
            scheduledAt: true,
            campaign: { select: { userId: true } },
          },
          take: 50,
        })
      );

      if (dueEmails.length === 0) return 0;

      logger.info({ count: dueEmails.length }, '⚡ Executing dispatch for due SCHEDULED emails');

      for (const email of dueEmails) {
        try {
          await processEmailJob(
            {
              emailId: email.id,
              campaignId: email.campaignId,
              senderId: email.senderId,
              userId: email.campaign.userId,
            },
            enqueueEmailJob
          );
        } catch (err: any) {
          logger.error({ emailId: email.id, err: err.message }, 'Failed dispatch for due email');
        }
      }

      return dueEmails.length;
    } catch (err: any) {
      logger.warn({ err: err.message }, 'Scheduled email recovery notice');
      return 0;
    }
  }

  /**
   * Starts periodic background heartbeat to dispatch due scheduled emails every 5 seconds.
   */
  static startPoller(intervalMs = 5000) {
    if (isPollerRunning) return;
    isPollerRunning = true;

    logger.info('✓ Periodic email scheduler heartbeat started (5s interval)');

    setInterval(async () => {
      try {
        await SchedulerService.recoverScheduledEmails();
      } catch (err: any) {
        // Silent catch for periodic poller
      }
    }, intervalMs);
  }
}

