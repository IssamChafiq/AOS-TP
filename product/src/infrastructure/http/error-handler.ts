import type { ErrorRequestHandler } from 'express';
import { DomainError } from '../../shared/domain-error.js';

/**
 * Middleware d'interception d'erreurs global (RFC 7807 Problem Details).
 * Convertit les exceptions DomainError en réponses HTTP avec le format standardisé.
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

  console.error('[product] Uncaught error:', err);
  res.status(500).type('application/problem+json').json({
    type: 'https://polyshop.fr/problems/internal-server-error',
    title: 'Internal Server Error',
    status: 500,
    detail: 'An unexpected internal error occurred',
    instance: req.originalUrl,
  });
};
