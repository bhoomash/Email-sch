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
  delayMs = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      const isConnectionError =
        error?.name === 'PrismaClientInitializationError' ||
        error?.code === 'P1001' ||
        error?.code === 'P1002' ||
        error?.code === 'P1017' ||
        error?.code === 'P2024' ||
        (typeof error?.message === 'string' && error.message.includes("Can't reach database server"));

      if (isConnectionError && attempt < retries) {
        logger.info(`⏳ Database reconnecting (attempt ${attempt}/${retries})...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
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
export async function checkDatabaseHealth(retries = 2, delayMs = 1500): Promise<boolean> {
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
