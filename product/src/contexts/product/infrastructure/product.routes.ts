import { Router } from 'express';
import { requireAuth, requireRole } from '../../../infrastructure/http/auth.middleware.js';
import { validate } from '../../../infrastructure/http/validate.js';
import type { ProductUseCases } from '../use-cases/index.js';
import {
  IdParamSchema,
  ListQuerySchema,
  ProductInputSchema,
  ProductPatchInputSchema,
} from './product.schemas.js';

export interface ProductRouterOptions {
  useCases: ProductUseCases;
  authConfig: {
    jwtSecret: string;
    jwtIssuer: string;
  };
}

/**
 * Construit le routeur Express pour les produits (/api/v1/products).
 * En accord avec le TP3, les opérations de modification (POST, PUT, PATCH, DELETE)
 * sont sécurisées et nécessitent le rôle administrateur ('admin').
 * Les opérations de consultation (GET) sont publiques.
 */
export function buildProductRouter(options: ProductRouterOptions): Router {
  const router = Router();
  const { useCases, authConfig } = options;

  // Middlewares de protection pour les opérations réservées aux administrateurs
  const admin = [requireAuth(authConfig), requireRole('admin')];

  // Liste paginée et filtrée (GET /)
  router.get('/', validate(ListQuerySchema, 'query'), async (_req, res, next) => {
    try {
      const page = await useCases.listProducts.execute(res.locals.query);
      res.status(200).json(page);
    } catch (err) {
      next(err);
    }
  });

  // Consultation d'un produit par ID (GET /:id)
  router.get('/:id', validate(IdParamSchema, 'params'), async (_req, res, next) => {
    try {
      const product = await useCases.getProduct.execute(res.locals.params.id);
      // Support ETag pour le cache HTTP conditionnel (TP2)
      res.set('ETag', `"${product.id}-${product.createdAt.getTime()}"`);
      res.status(200).json(product);
    } catch (err) {
      next(err);
    }
  });

  // Création d'un produit (POST /) - Protégé Admin
  router.post('/', ...admin, validate(ProductInputSchema, 'body'), async (_req, res, next) => {
    try {
      const created = await useCases.createProduct.execute(res.locals.body);
      res.status(201).location(`/api/v1/products/${created.id}`).json(created);
    } catch (err) {
      next(err);
    }
  });

  // Mise à jour partielle (PATCH /:id) - Protégé Admin
  router.patch(
    '/:id',
    ...admin,
    validate(IdParamSchema, 'params'),
    validate(ProductPatchInputSchema, 'body'),
    async (_req, res, next) => {
      try {
        const updated = await useCases.updateProduct.execute(
          res.locals.params.id,
          res.locals.body
        );
        res.status(200).json(updated);
      } catch (err) {
        next(err);
      }
    }
  );

  // Mise à jour complète (PUT /:id) - Protégé Admin
  router.put(
    '/:id',
    ...admin,
    validate(IdParamSchema, 'params'),
    validate(ProductInputSchema, 'body'),
    async (_req, res, next) => {
      try {
        const updated = await useCases.updateProduct.execute(
          res.locals.params.id,
          res.locals.body
        );
        res.status(200).json(updated);
      } catch (err) {
        next(err);
      }
    }
  );

  // Suppression d'un produit (DELETE /:id) - Protégé Admin
  router.delete('/:id', ...admin, validate(IdParamSchema, 'params'), async (_req, res, next) => {
    try {
      await useCases.deleteProduct.execute(res.locals.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
