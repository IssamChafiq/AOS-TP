import { z } from 'zod';

/**
 * Configuration validée du microservice Product
 */
const ConfigSchema = z.object({
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().default('file:./dev.db'),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters')
    .default('polyshop-super-secret-jwt-key-min-32-characters'),
  JWT_ISSUER: z.string().default('polyshop-auth'),
  CORS_ORIGINS: z.string().default('*'),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  const result = ConfigSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid configuration:', result.error.format());
    throw new Error('Invalid environment configuration');
  }
  return result.data;
}

export const config = loadConfig();
