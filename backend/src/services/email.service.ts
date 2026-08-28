import { prisma } from '../config/database.js';
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
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getSentEmails(userId: string, options: PaginationOptions = {}) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const whereClause = {
      campaign: { userId },
      status: { in: ['SENT' as const, 'FAILED' as const] },
    };

    const [items, total] = await Promise.all([
      prisma.email.findMany({
        where: whereClause,
        orderBy: { sentAt: 'desc' },
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
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getEmailById(userId: string, emailId: string) {
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
  }

  static async searchEmails(userId: string, queryText: string) {
    // Search using Elasticsearch (scoped strictly to userId)
    const esHits = await SearchService.searchUserEmails(userId, queryText);
    return esHits;
  }
}
