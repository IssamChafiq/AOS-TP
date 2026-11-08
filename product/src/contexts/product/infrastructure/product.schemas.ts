import { z } from 'zod';

/**
 * Schémas Zod de validation des requêtes pour le microservice Product.
 */

// Validation de l'identifiant dans les paramètres d'URL (ex: UUID ou string non vide)
export const IdParamSchema = z.object({
  id: z.string().min(1, 'id must be specified'),
});

// Corps de requête pour la création d'un produit (POST)
export const ProductInputSchema = z.object({
  name: z.string().min(1, 'name is required'),
  priceCents: z.number().int().positive('priceCents must be a positive integer'),
  tags: z.array(z.string()).default([]),
});

// Corps de requête pour la mise à jour partielle (PATCH / PUT)
export const ProductPatchInputSchema = z.object({
  name: z.string().min(1).optional(),
  priceCents: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
});

// Paramètres de requête pour la liste paginée et filtrée (GET /products)
export const ListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.enum(['name', 'priceCents', 'createdAt']).default('createdAt'),
  category: z.string().optional(),
  q: z.string().optional(),
});

export type IdParam = z.infer<typeof IdParamSchema>;
export type ProductInput = z.infer<typeof ProductInputSchema>;
export type ProductPatchInput = z.infer<typeof ProductPatchInputSchema>;
export type ListQuery = z.infer<typeof ListQuerySchema>;
