import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { generateBullJobId } from '../utils/idempotency.js';
import { logger } from '../utils/logger.js';
import { processEmailJob, EmailJobData } from './email.processor.js';

export type { EmailJobData };

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
      { emailId: data.emailId, delayMs, error: error.message },
      '⚠️ Redis is offline — activating in-process timer fallback to dispatch email job'
    );

    // Fallback: Schedule in-process dispatch using setTimeout / setImmediate
    setTimeout(async () => {
      try {
        await processEmailJob(data, enqueueEmailJob);
      } catch (err: any) {
        logger.error({ emailId: data.emailId, err }, 'In-process fallback email dispatch failed');
      }
    }, Math.max(0, delayMs));

    return jobId;
  }
}
