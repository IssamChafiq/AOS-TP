import { Router } from 'express';
import { requireAuth } from '../../../infrastructure/http/auth.middleware.js';
import { validate } from '../../../infrastructure/http/validate.js';
import type { AuthUseCases } from '../use-cases/index.js';
import { LoginInputSchema, RegisterInputSchema } from './auth.schemas.js';

export interface AuthRouterOptions {
  useCases: AuthUseCases;
  jwtSecret: string;
  jwtIssuer: string;
}

/**
 * Construit le routeur Express pour l'authentification (/api/v1/auth)
 */
export function buildAuthRouter(options: AuthRouterOptions): Router {
  const router = Router();
  const { useCases, jwtSecret, jwtIssuer } = options;

  // Inscription (POST /register)
  router.post('/register', validate(RegisterInputSchema, 'body'), async (_req, res, next) => {
    try {
      const publicUser = await useCases.registerUser.execute(res.locals.body);
      res.status(201).json(publicUser);
    } catch (err) {
      next(err);
    }
  });

  // Connexion (POST /login)
  router.post('/login', validate(LoginInputSchema, 'body'), async (_req, res, next) => {
    try {
      const result = await useCases.loginUser.execute(res.locals.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  // Profil connecté (GET /me)
  router.get('/me', requireAuth({ jwtSecret, jwtIssuer }), async (_req, res, next) => {
    try {
      const user = await useCases.getMe.execute(res.locals.user.id);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
