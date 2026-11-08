import type { Role, User } from './user.js';

/**
 * Port secondaire (Interface du Repository) :
 * Définit le contrat d'accès aux données utilisateur sans dépendre d'une base de données spécifique.
 */
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: { email: string; passwordHash: string; role?: Role }): Promise<User>;
}
