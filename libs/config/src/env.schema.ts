import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  BOT_TOKEN: z.string().min(1),
  DATABASE_URL: z.url(),
  ADMIN_ID: z.preprocess((val) => Number(val), z.number().int()),
  GRAM_API_ID: z.preprocess((val) => Number(val), z.number().int()),
  GRAM_API_HASH: z.string().min(1),
  X_BEARER_TOKEN: z.string().min(1),
  REDIS_URL: z.url(),
});

export type Env = z.infer<typeof envSchema>;
