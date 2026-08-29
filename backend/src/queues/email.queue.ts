import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { generateBullJobId } from '../utils/idempotency.js';
import { logger } from '../utils/logger.js';

export interface EmailJobData {
  emailId: string;
  campaignId: string;
  senderId: string;
  userId: string;
}

export const EMAIL_QUEUE_NAME = 'email-queue';

export const emailQueue = new Queue<EmailJobData>(EMAIL_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});

export async function enqueueEmailJob(data: EmailJobData, delayMs: number): Promise<string> {
  const jobId = generateBullJobId(data.emailId);

  try {
    const job = await emailQueue.add('send-email', data, {
      jobId, // Deterministic ID ensures idempotency
      delay: Math.max(0, delayMs),
    });

    logger.info({ jobId: job.id, emailId: data.emailId, delayMs }, 'Enqueued BullMQ delayed job');
    return job.id!;
  } catch (error: any) {
    logger.warn(
      { emailId: data.emailId, error: error.message },
      '⚠️ Redis is offline — BullMQ job enqueue deferred (email remains SCHEDULED in database)'
    );
    return jobId;
  }
}
