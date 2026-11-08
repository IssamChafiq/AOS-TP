import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import type { Role } from '../../contexts/auth/domain/user.js';

export interface AuthUser {
  id: string;
  role: Role;
}

/**
 * Middleware vérifiant la présence et la validité d'un JWT Bearer Token.
 * Extrait l'en-tête Authorization, vérifie la signature avec la clé secrète et l'émetteur,
 * et renseigne res.locals.user.
 */
export const requireAuth = (opts: {
  jwtSecret: string;
  jwtIssuer: string;
}): RequestHandler => (req, res, next) => {
  const header = req.get('Authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (!token) {
    res
      .status(401)
      .set('WWW-Authenticate', 'Bearer')
      .type('application/problem+json')
      .json({
        type: 'https://polyshop.fr/problems/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Authorization header with Bearer token is required',
        instance: req.originalUrl,
      });
    return;
  }

  try {
    const payload = jwt.verify(token, opts.jwtSecret, {
      issuer: opts.jwtIssuer,
      algorithms: ['HS256'],
    }) as jwt.JwtPayload;

    res.locals.user = {
      id: payload.sub as string,
      role: (payload.role as Role) ?? 'user',
    } satisfies AuthUser;

    next();
  } catch {
    res.status(401).type('application/problem+json').json({
      type: 'https://polyshop.fr/problems/unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: 'Invalid or expired token',
      instance: req.originalUrl,
    });
  }
};

/**
 * Middleware d'autorisation basé sur les rôles.
 * S'assure que l'utilisateur connecté possède l'un des rôles autorisés.
 */
export const requireRole = (...roles: Role[]): RequestHandler => (_req, res, next) => {
  const user = res.locals.user as AuthUser | undefined;
  if (!user || !roles.includes(user.role)) {
    res.status(403).type('application/problem+json').json({
      type: 'https://polyshop.fr/problems/forbidden',
      title: 'Forbidden',
      status: 403,
      detail: `Role required: ${roles.join(' or ')}`,
      instance: _req.originalUrl,
    });
    return;
  }
  next();
};
