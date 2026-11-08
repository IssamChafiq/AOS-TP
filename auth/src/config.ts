import { z } from 'zod';

/**
 * Schéma de validation des variables d'environnement du service Auth
 */
const ConfigSchema = z.object({
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters long')
    .default('polyshop-super-secret-jwt-key-min-32-characters'),
  JWT_ISSUER: z.string().default('polyshop-auth'),
  DATABASE_URL: z.string().default('file:./dev.db'),
  CORS_ORIGINS: z.string().default('*'),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  const result = ConfigSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment variables:', result.error.format());
    throw new Error('Invalid environment configuration');
  }
  return result.data;
}

export const config = loadConfig();
