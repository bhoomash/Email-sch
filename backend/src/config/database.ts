import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [], // Suppress Prisma's internal error logs (we handle them ourselves)
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Health check with retry logic for Neon serverless cold starts.
 * Neon databases auto-suspend after inactivity and take 2-5 seconds to wake up.
 */
export async function checkDatabaseHealth(retries = 3, delayMs = 3000): Promise<boolean> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      logger.info('✓ PostgreSQL connected');
      return true;
    } catch (error) {
      if (attempt < retries) {
        logger.info(`⏳ PostgreSQL waking up (Neon cold start)... retry ${attempt}/${retries}`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        logger.warn('✗ PostgreSQL connection deferred (will auto-connect on first API request)');
      }
    }
  }
  return false;
}
