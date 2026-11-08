import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

/**
 * Middleware générique de validation Zod pour Express.
 * Valide soit le body, la query ou les params d'une requête.
 * En cas d'échec, renvoie une réponse HTTP 400 au format RFC 7807 (Problem Details).
 * En cas de succès, stocke les données validées dans res.locals[source].
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
  // En Express 5, req.query est en lecture seule, res.locals est donc le conteneur recommandé
  res.locals[source] = result.data;
  next();
};
