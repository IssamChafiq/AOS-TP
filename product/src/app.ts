import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { buildProductRouter } from './contexts/product/infrastructure/product.routes.js';
import type { ProductUseCases } from './contexts/product/use-cases/index.js';
import { setupDocs } from './infrastructure/http/docs.js';
import { errorHandler } from './infrastructure/http/error-handler.js';

export interface AppDeps {
  useCases: ProductUseCases;
  jwtSecret: string;
  jwtIssuer: string;
  corsOrigins?: string;
}

/**
 * Fabrique de l'application Express pour le microservice Product.
 * Conforme aux exigences du TP2 et du TP3 (sécurité, rate-limit, helmet, RFC 7807, docs).
 */
export function buildApp(deps: AppDeps) {
  const app = express();

  // En-têtes HTTP sécurisés avec Helmet (inclut nosniff, etc.)
  app.use(helmet());

  // Gestion des requêtes multi-origines (CORS)
  const origins = deps.corsOrigins === '*' ? '*' : deps.corsOrigins?.split(',') ?? '*';
  app.use(cors({ origin: origins }));

  // Protection contre le déni de service (Rate Limit: 300 req/min)
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // Analyse du corps JSON avec taille maximale contrôlée (100 Ko)
  app.use(express.json({ limit: '100kb' }));

  // Documentation interactive Swagger UI sur /docs (asynchrone)
  setupDocs(app).catch((err) => console.warn('Could not setup docs:', err));

  // Contrôle de santé (Health Check)
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'product',
      uptime: process.uptime(),
    });
  });

  // Montage des routes de produits (/api/v1/products)
  app.use(
    '/api/v1/products',
    buildProductRouter({
      useCases: deps.useCases,
      authConfig: {
        jwtSecret: deps.jwtSecret,
        jwtIssuer: deps.jwtIssuer,
      },
    })
  );

  // Gestionnaire d'erreurs global (RFC 7807)
  app.use(errorHandler);

  return app;
}
