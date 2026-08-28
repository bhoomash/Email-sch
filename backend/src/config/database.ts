import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

export const prisma = new PrismaClient();

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✓ PostgreSQL connected');
    return true;
  } catch (error) {
    logger.error({ error }, '✗ PostgreSQL connection failed');
    return false;
  }
}
