import { prisma, withDbRetry } from '../config/database.js';
import { SearchService } from './search.service.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export class EmailService {
  static async getScheduledEmails(userId: string, options: PaginationOptions = {}) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const whereClause = {
      campaign: { userId },
      status: { in: ['SCHEDULED' as const, 'PROCESSING' as const, 'RATE_LIMITED' as const] },
    };

    try {
      return await withDbRetry(async () => {
        const [items, total] = await Promise.all([
          prisma.email.findMany({
            where: whereClause,
            orderBy: { scheduledAt: 'asc' },
            skip,
            take: limit,
            include: {
              sender: { select: { email: true } },
              campaign: { select: { subject: true } },
            },
          }),
          prisma.email.count({ where: whereClause }),
        ]);

        return {
          items,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
          },
        };
      });
    } catch (err) {
      return {
        items: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }
  }

  static async getSentEmails(userId: string, options: PaginationOptions = {}) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const whereClause = {
      campaign: { userId },
      status: { in: ['SENT' as const, 'FAILED' as const] },
    };

    try {
      return await withDbRetry(async () => {
        const [items, total] = await Promise.all([
          prisma.email.findMany({
            where: whereClause,
            orderBy: { updatedAt: 'desc' },
            skip,
            take: limit,
            include: {
              sender: { select: { email: true } },
              campaign: { select: { subject: true } },
            },
          }),
          prisma.email.count({ where: whereClause }),
        ]);

        return {
          items,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
          },
        };
      });
    } catch (err) {
      return {
        items: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }
  }


  static async getEmailById(userId: string, emailId: string) {
    return withDbRetry(async () => {
      const email = await prisma.email.findUnique({
        where: { id: emailId },
        include: {
          campaign: true,
          sender: {
            select: {
              id: true,
              email: true,
              smtpHost: true,
              smtpPort: true,
            },
          },
        },
      });

      if (!email) {
        throw new NotFoundError('Email not found');
      }

      if (email.campaign.userId !== userId) {
        throw new ForbiddenError('Access denied');
      }

      return email;
    });
  }

  static async searchEmails(userId: string, queryText: string) {
    // 1. Try search using Elasticsearch (scoped strictly to userId)
    const esHits = await SearchService.searchUserEmails(userId, queryText);
    if (esHits && esHits.length > 0) {
      return esHits;
    }

    // 2. Fallback to PostgreSQL database search if Elasticsearch is offline or index empty
    return withDbRetry(async () => {
      return prisma.email.findMany({
        where: {
          campaign: { userId },
          OR: [
            { recipient: { contains: queryText, mode: 'insensitive' } },
            { subject: { contains: queryText, mode: 'insensitive' } },
            { body: { contains: queryText, mode: 'insensitive' } },
          ],
        },
        include: {
          sender: { select: { email: true } },
          campaign: { select: { subject: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    });
  }
}
