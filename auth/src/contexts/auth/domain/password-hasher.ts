/**
 * Port secondaire (Interface) pour le service de hachage de mot de passe.
 * Permet d'abstraire l'algorithme sous-jacent (Argon2, bcrypt, mock pour les tests).
 */
export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  verify(plain: string, hash: string): Promise<boolean>;
}
