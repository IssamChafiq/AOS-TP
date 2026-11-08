import jwt from 'jsonwebtoken';
import type { TokenClaims, TokenIssuer } from '../domain/token-issuer.js';

/**
 * Implémentation du service d'émission de jetons avec JSON Web Token (JWT).
 * Signe un jeton cryptographique contenant le sujet (sub = user.id) et le rôle.
 */
export class JwtTokenIssuer implements TokenIssuer {
  constructor(
    private readonly secret: string,
    private readonly issuer: string,
    private readonly expiresInSeconds: number = 900 // 15 minutes par défaut
  ) {}

  issue(claims: TokenClaims): string {
    return jwt.sign(
      { role: claims.role },
      this.secret,
      {
        subject: claims.sub,
        issuer: this.issuer,
        expiresIn: this.expiresInSeconds,
        algorithm: 'HS256',
      }
    );
  }
}
