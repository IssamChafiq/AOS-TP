import argon2 from 'argon2';
import type { PasswordHasher } from '../domain/password-hasher.js';

/**
 * Implémentation du service de hachage avec Argon2 (variante argon2id recommandée par l'OWASP).
 * Fournit une protection élevée contre les attaques par force brute et par GPU/ASIC.
 */
export class Argon2PasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return argon2.hash(plain, {
      type: argon2.argon2id,
    });
  }

  async verify(plain: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plain);
    } catch {
      return false;
    }
  }
}
