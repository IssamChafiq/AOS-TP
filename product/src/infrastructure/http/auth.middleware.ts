import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

export type Role = 'user' | 'admin';

export interface AuthUser {
  id: string;
  role: Role;
}

/**
 * Middleware vérifiant le token JWT transmis dans l'en-tête Authorization: Bearer <token>.
 * Conforme au TP3 du workbook PolyShop.
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
        detail: 'Authorization Bearer token is missing',
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
 * Middleware vérifiant que l'utilisateur connecté détient l'un des rôles exigés (ex: 'admin').
 */
export const requireRole = (...roles: Role[]): RequestHandler => (_req, res, next) => {
  const user = res.locals.user as AuthUser | undefined;
  if (!user || !roles.includes(user.role)) {
    res.status(403).type('application/problem+json').json({
      type: 'https://polyshop.fr/problems/forbidden',
      title: 'Forbidden',
      status: 403,
      detail: `Access denied. Required roles: ${roles.join(', ')}`,
      instance: _req.originalUrl,
    });
    return;
  }
  next();
};
