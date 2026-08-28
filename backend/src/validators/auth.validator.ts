import { z } from 'zod';

export const devLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
});
