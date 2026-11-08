import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

/**
 * Middleware de validation Zod réutilisable.
 * Extrait et valide les données de la requête (body, query ou params).
 * En cas d'erreur de validation, retourne une réponse RFC 7807 (Problem Details, 400).
 */
export const validate = (
  schema: ZodType,
  source: 'body' | 'query' | 'params' = 'body'
): RequestHandler => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    res.status(400).type('application/problem+json').json({
      type: 'https://polyshop.fr/problems/validation',
      title: 'Validation failed',
      status: 400,
      instance: req.originalUrl,
      errors: result.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      })),
    });
    return;
  }
  res.locals[source] = result.data;
  next();
};
