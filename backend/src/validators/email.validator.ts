import { z } from 'zod';

export const emailQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
  limit: z.string().optional().transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 20)),
});

export const emailSearchSchema = z.object({
  q: z.string().min(1, 'Search query cannot be empty'),
});
