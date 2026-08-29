import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { initElasticsearch } from './config/elasticsearch.js';
import { checkDatabaseHealth, prisma } from './config/database.js';
import { checkRedisHealth, redisConnection } from './config/redis.js';
import { emailQueue } from './queues/email.queue.js';
import { emailWorker } from './queues/email.worker.js';
import { SchedulerService } from './services/scheduler.service.js';

const PORT = env.PORT || 5000;

async function startServer() {
  try {
    // 1. Start HTTP server FIRST so API routes are immediately listening on PORT 5000
    const server = app.listen(PORT, () => {
      logger.info(`✓ API listening on port ${PORT}`);
      logger.info(`📊 Bull Board UI available on http://localhost:${PORT}/admin/queues`);
    });

    // 2. Perform service connectivity checks asynchronously
    checkDatabaseHealth().then(() => {
      SchedulerService.recoverScheduledEmails().catch((err) => logger.warn({ err }, 'Email recovery notice'));
    }).catch((err) => logger.warn({ err }, 'PostgreSQL health notice'));

    checkRedisHealth().catch((err) => logger.warn({ err }, 'Redis health notice'));
    initElasticsearch().catch((err) => logger.warn({ err }, 'Elasticsearch notice'));

    logger.info('✓ BullMQ worker initialized');

    // 3. Graceful shutdown handler
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed.');

        try {
          await emailWorker.close();
          logger.info('BullMQ worker closed.');

          await emailQueue.close();
          logger.info('BullMQ queue closed.');

          await redisConnection.quit();
          logger.info('Redis connection closed.');

          await prisma.$disconnect();
          logger.info('Database connection closed.');

          process.exit(0);
        } catch (err) {
          logger.error({ err }, 'Error during graceful shutdown');
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

startServer();
