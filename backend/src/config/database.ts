import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Retry wrapper for Prisma operations that may fail due to Neon cold starts.
 * Automatically retries on PrismaClientInitializationError (can't reach DB).
 */
export async function withDbRetry<T>(
  operation: () => Promise<T>,
  retries = 3,
  delayMs = 3000
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      const isConnectionError =
        error?.name === 'PrismaClientInitializationError' ||
        error?.code === 'P1001' ||
        error?.code === 'P2024';

      if (isConnectionError && attempt < retries) {
        logger.info(`⏳ Database reconnecting (attempt ${attempt}/${retries})...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Database operation failed after retries');
}

/**
 * Health check with retry logic for Neon serverless cold starts.
 */
export async function checkDatabaseHealth(retries = 5, delayMs = 4000): Promise<boolean> {
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
