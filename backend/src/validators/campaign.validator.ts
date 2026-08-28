import { z } from 'zod';

export const scheduleCampaignSchema = z.object({
  senderId: z.string().uuid('Invalid sender ID'),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Email body is required'),
  startTime: z.string().datetime().or(z.date()).transform((val) => new Date(val)),
  delayMs: z.number().int().min(2000, 'Minimum send delay must be at least 2000ms'),
  hourlyLimit: z.number().int().positive('Hourly limit must be greater than 0'),
  recipients: z.array(z.string().email('Invalid email address')).min(1, 'At least one recipient is required'),
});

export type ScheduleCampaignInput = z.infer<typeof scheduleCampaignSchema>;
