import { z } from 'zod';

/**
 * Schémas de validation Zod pour les requêtes HTTP du service Auth.
 */

export const RegisterInputSchema = z.object({
  email: z.string().email('Format email invalide'),
  password: z.string().min(8, 'Le mot de passe doit comporter au moins 8 caractères'),
  role: z.enum(['user', 'admin']).optional(),
});

export const LoginInputSchema = z.object({
  email: z.string().email('Format email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export type RegisterInput = z.infer<typeof RegisterInputSchema>;
export type LoginInput = z.infer<typeof LoginInputSchema>;
