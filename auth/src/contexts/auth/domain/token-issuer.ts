import type { Role } from './user.js';

/**
 * Revendications (claims) contenues dans le jeton JWT
 */
export interface TokenClaims {
  sub: string;
  role: Role;
}

/**
 * Port secondaire (Interface) pour l'émission de jetons d'authentification.
 */
export interface TokenIssuer {
  issue(claims: TokenClaims): string;
}
