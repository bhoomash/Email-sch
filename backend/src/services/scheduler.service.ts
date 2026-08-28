import { enqueueEmailJob } from '../queues/email.queue.js';
import { generateBullJobId } from '../utils/idempotency.js';

export class SchedulerService {
  /**
   * Enqueues a list of created email records into BullMQ as delayed jobs.
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
}
