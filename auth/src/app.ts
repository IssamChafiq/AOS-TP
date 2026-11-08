import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { buildAuthRouter } from './contexts/auth/infrastructure/auth.routes.js';
import type { AuthUseCases } from './contexts/auth/use-cases/index.js';
import { errorHandler } from './infrastructure/http/error-handler.js';

export interface AppDeps {
  useCases: AuthUseCases;
  jwtSecret: string;
  jwtIssuer: string;
  corsOrigins?: string;
}

/**
 * Fabrique de l'application Express pour le service Auth.
 * Assemble les middlewares de sécurité (Helmet, CORS, Rate Limit),
 * les routes métier et le gestionnaire d'erreurs RFC 7807.
 */
export function buildApp(deps: AppDeps) {
  const app = express();

  // En-têtes de sécurité HTTP (Protection XSS, Clickjacking, MIME sniffing, etc.)
  app.use(helmet());

  // Gestion du Cross-Origin Resource Sharing (CORS)
  const allowedOrigins = deps.corsOrigins === '*' ? '*' : deps.corsOrigins?.split(',') ?? '*';
  app.use(cors({ origin: allowedOrigins }));

  // Protection contre le déni de service et le bruteforce (Rate Limiting)
  app.use(
    rateLimit({
      windowMs: 60 * 1000, // 1 minute
      limit: 300, // 300 requêtes maximum par minute
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // Parsing JSON avec limite de charge utile stricte
  app.use(express.json({ limit: '100kb' }));

  // Point de contrôle de santé (Health Check)
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'auth',
      uptime: process.uptime(),
    });
  });

  // Montage des routes d'authentification
  app.use(
    '/api/v1/auth',
    buildAuthRouter({
      useCases: deps.useCases,
      jwtSecret: deps.jwtSecret,
      jwtIssuer: deps.jwtIssuer,
    })
  );

  // Gestionnaire d'erreurs global (RFC 7807)
  app.use(errorHandler);

  return app;
}
