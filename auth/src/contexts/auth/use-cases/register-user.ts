import type { PasswordHasher } from '../domain/password-hasher.js';
import type { PublicUser, Role } from '../domain/user.js';
import { EmailAlreadyUsed } from '../domain/user.errors.js';
import type { UserRepository } from '../domain/user.repository.js';

export interface RegisterUserInput {
  email: string;
  password: string;
  role?: Role;
}

/**
 * Cas d'usage : Inscription d'un nouvel utilisateur
 * 1. Vérifie si l'email est déjà utilisé (lève EmailAlreadyUsed si oui).
 * 2. Hache le mot de passe de manière sécurisée (Argon2id).
 * 3. Persiste le nouvel utilisateur.
 * 4. Retourne les informations publiques de l'utilisateur (sans le hash).
 */
export class RegisterUser {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher
  ) {}

  async execute(input: RegisterUserInput): Promise<PublicUser> {
    const existing = await this.users.findByEmail(input.email);
    if (existing) {
      throw new EmailAlreadyUsed(input.email);
    }

    const passwordHash = await this.hasher.hash(input.password);
    const user = await this.users.create({
      email: input.email,
      passwordHash,
      role: input.role ?? 'user',
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
