import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { EMAIL_QUEUE_NAME, enqueueEmailJob } from './email.queue.js';
import { processEmailJob, EmailJobData } from './email.processor.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const emailWorker = new Worker<EmailJobData>(
  EMAIL_QUEUE_NAME,
  async (job: Job<EmailJobData>) => {
    await processEmailJob(job.data, enqueueEmailJob);
  },
  {
    connection: redisConnection,
    concurrency: env.WORKER_CONCURRENCY,
  }
);

emailWorker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'BullMQ worker job completed');
});

emailWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'BullMQ worker job failed');
});
