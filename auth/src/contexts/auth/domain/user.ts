/**
 * Domaine Métier - Entité Utilisateur et Rôles
 */

export type Role = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
}

/**
 * Version publique d'un utilisateur, expurgée de son empreinte de mot de passe (passwordHash)
 */
export type PublicUser = Omit<User, 'passwordHash'>;

export interface Credentials {
  email: string;
  password: string;
}
