import jwt from 'jsonwebtoken';

/**
 * Fonctions d'aide pour générer des jetons JWT valides pour les tests d'intégration.
 * Conforme au modèle de tests présenté dans le workbook (page 20).
 */
export function generateTestToken(opts: {
  secret: string;
  issuer: string;
  userId?: string;
  role?: 'user' | 'admin';
  expiresIn?: number;
}): string {
  return jwt.sign(
    { role: opts.role ?? 'user' },
    opts.secret,
    {
      subject: opts.userId ?? 'u-test',
      issuer: opts.issuer,
      expiresIn: opts.expiresIn ?? 900,
      algorithm: 'HS256',
    }
  );
}
