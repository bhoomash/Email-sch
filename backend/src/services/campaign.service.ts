import { Prisma } from '@prisma/client';
import { prisma, withDbRetry } from '../config/database.js';
import { ScheduleCampaignInput } from '../validators/campaign.validator.js';
import { SchedulerService } from './scheduler.service.js';
import { SearchService } from './search.service.js';
import { generateBullJobId } from '../utils/idempotency.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { randomUUID } from 'crypto';

export class CampaignService {
  static async scheduleCampaign(userId: string, input: ScheduleCampaignInput) {
    // 1. Verify sender ownership
    const sender = await withDbRetry(async () =>
      prisma.sender.findFirst({
        where: { id: input.senderId, userId },
      })
    );

    if (!sender) {
      throw new NotFoundError('Sender not found or does not belong to user');
    }

    const startTimeMs = new Date(input.startTime).getTime();
    const delayMs = input.delayMs || 2000;
    const now = new Date();

    // Prepare email payloads with client-generated IDs for atomic insertion
    const emailDataToCreate = input.recipients.map((recipient, index) => {
      const emailId = randomUUID();
      const scheduledAt = new Date(startTimeMs + index * delayMs);
      const bullJobId = generateBullJobId(emailId);

      return {
        id: emailId,
        senderId: input.senderId,
        recipient,
        subject: input.subject,
        body: input.body,
        scheduledAt,
        bullJobId,
        status: 'SCHEDULED' as const,
        createdAt: now,
        sentAt: null,
      };
    });

    // 2. Perform Atomic DB Transaction (Fast 1-step insert without redundant findMany)
    const { campaign, createdEmails } = await withDbRetry(async () =>
      prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const campaignRecord = await tx.campaign.create({
            data: {
              userId,
              senderId: input.senderId,
              subject: input.subject,
              body: input.body,
              startTime: new Date(input.startTime),
              delayMs,
              hourlyLimit: input.hourlyLimit,
            },
          });

          const emailsToInsert = emailDataToCreate.map((item) => ({
            ...item,
            campaignId: campaignRecord.id,
          }));

          await tx.email.createMany({
            data: emailsToInsert,
          });

          return { campaign: campaignRecord, createdEmails: emailsToInsert };
        },
        {
          maxWait: 10000,
          timeout: 30000,
        }
      )
    );

    // 3. Enqueue BullMQ delayed jobs safely
    await SchedulerService.scheduleEmailJobs(createdEmails, userId);

    // 4. Index in Elasticsearch asynchronously
    for (const email of createdEmails) {
      SearchService.indexEmail({
        id: email.id,
        campaignId: email.campaignId,
        senderId: email.senderId,
        userId,
        recipient: email.recipient,
        subject: email.subject,
        body: email.body,
        status: email.status,
        scheduledAt: email.scheduledAt,
        sentAt: email.sentAt,
        createdAt: email.createdAt,
      }).catch(() => {});
    }

    return {
      campaign,
      totalScheduled: createdEmails.length,
    };
  }

  static async getUserCampaigns(userId: string) {
    return withDbRetry(async () =>
      prisma.campaign.findMany({
        where: { userId },
        include: {
          sender: {
            select: { email: true },
          },
          _count: {
            select: { emails: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    );
  }

  static async getCampaignById(userId: string, campaignId: string) {
    return withDbRetry(async () => {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
          sender: { select: { email: true } },
          emails: true,
        },
      });

      if (!campaign) {
        throw new NotFoundError('Campaign not found');
      }

      if (campaign.userId !== userId) {
        throw new ForbiddenError('Access denied');
      }

      return campaign;
    });
  }
}
