import { prisma } from '../config/database.js';
import { RateLimitService } from '../services/rate-limit.service.js';
import { SmtpService } from '../services/smtp.service.js';
import { SlackService } from '../services/slack.service.js';
import { SearchService } from '../services/search.service.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export interface EmailJobData {
  emailId: string;
  campaignId: string;
  senderId: string;
  userId: string;
}

export async function processEmailJob(
  jobData: EmailJobData,
  enqueueFn?: (data: EmailJobData, delayMs: number) => Promise<string>
): Promise<void> {
  const { emailId, campaignId, senderId, userId } = jobData;
  logger.info({ emailId }, 'Processing email job');

  // 1. Fetch email record from PostgreSQL
  const emailRecord = await prisma.email.findUnique({
    where: { id: emailId },
    include: {
      sender: true,
      campaign: true,
    },
  });

  if (!emailRecord) {
    logger.warn({ emailId }, 'Email record not found in database; terminating job');
    return;
  }

  // 2. Idempotency check: if already sent, exit cleanly
  if (emailRecord.status === 'SENT') {
    logger.info({ emailId }, 'Email already SENT; idempotent skip');
    return;
  }

  const { sender, campaign } = emailRecord;

  // 3. Rate Limit Evaluation
  const rateLimitCheck = await RateLimitService.checkAndIncrementSenderLimit(
    senderId,
    campaign.hourlyLimit
  );

  if (!rateLimitCheck.allowed && rateLimitCheck.nextHourStart) {
    logger.warn(
      { senderId: sender.email, current: rateLimitCheck.currentCount, limit: rateLimitCheck.limit },
      'Hourly rate limit reached for sender. Rescheduling job.'
    );

    const nextRunTime = rateLimitCheck.nextHourStart.getTime();
    const delayMs = Math.max(0, nextRunTime - Date.now());

    // Update email status to RATE_LIMITED then back to SCHEDULED
    await prisma.email.update({
      where: { id: emailId },
      data: {
        status: 'RATE_LIMITED',
        scheduledAt: rateLimitCheck.nextHourStart,
      },
    });

    // Update ES
    await SearchService.updateEmailStatus(emailId, 'RATE_LIMITED');

    // Re-enqueue job if enqueue function provided
    if (enqueueFn) {
      await enqueueFn(jobData, delayMs);
    }

    // Trigger Slack notification asynchronously
    SlackService.notifyRateLimitReached(
      userId,
      sender.email,
      senderId,
      rateLimitCheck.limit,
      rateLimitCheck.hourWindow
    ).catch((err) => logger.error({ err }, 'Slack notice error'));

    return;
  }

  // 4. Enforce per-sender minimum delay between sends across distributed workers
  await RateLimitService.enforceMinimumSenderDelay(senderId, campaign.delayMs || env.MIN_SEND_DELAY_MS);

  // 5. Transition DB status to PROCESSING
  await prisma.email.update({
    where: { id: emailId },
    data: {
      status: 'PROCESSING',
      attempts: { increment: 1 },
    },
  });
  await SearchService.updateEmailStatus(emailId, 'PROCESSING');

  try {
    // 6. Send Email through SMTP Transporter
    const sendResult = await SmtpService.sendEmail({
      smtpHost: sender.smtpHost,
      smtpPort: sender.smtpPort,
      smtpUser: sender.smtpUser,
      smtpPassword: sender.smtpPassword,
      from: sender.email,
      to: emailRecord.recipient,
      subject: emailRecord.subject,
      body: emailRecord.body,
    });

    const sentAt = new Date();

    // 7. Update DB record to SENT
    await prisma.email.update({
      where: { id: emailId },
      data: {
        status: 'SENT',
        sentAt,
        messageId: sendResult.messageId,
        errorMessage: null,
      },
    });

    // 8. Update Elasticsearch Index
    await SearchService.updateEmailStatus(emailId, 'SENT', sentAt);

    logger.info(
      { emailId, recipient: emailRecord.recipient, messageId: sendResult.messageId },
      'Email successfully sent and indexed'
    );
  } catch (error: any) {
    const errorMessage = error?.message || 'SMTP sending error';
    logger.error({ error, emailId, recipient: emailRecord.recipient }, 'Failed to send email');

    // Update DB record status to FAILED
    await prisma.email.update({
      where: { id: emailId },
      data: {
        status: 'FAILED',
        errorMessage,
      },
    });

    await SearchService.updateEmailStatus(emailId, 'FAILED', null, errorMessage);

    // Re-throw to trigger BullMQ retry backoff
    throw error;
  }
}
