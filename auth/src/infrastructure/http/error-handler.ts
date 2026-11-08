import type { ErrorRequestHandler } from 'express';
import { DomainError } from '../../shared/domain-error.js';

/**
 * Middleware global de gestion d'erreurs (RFC 7807 Problem Details).
 * Intercepte les DomainError pour générer les réponses HTTP correspondantes.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof DomainError) {
    res.status(err.status).type('application/problem+json').json({
      type: err.type,
      title: err.title,
      status: err.status,
      detail: err.message,
      instance: req.originalUrl,
    });
    return;
  }

  // Erreur interne non gérée
  console.error('[auth] Uncaught error:', err);
  res.status(500).type('application/problem+json').json({
    type: 'https://polyshop.fr/problems/internal-server-error',
    title: 'Internal Server Error',
    status: 500,
    detail: 'An unexpected internal error occurred',
    instance: req.originalUrl,
  });
};
