import type { PublicUser } from '../domain/user.js';
import { UserNotFound } from '../domain/user.errors.js';
import type { UserRepository } from '../domain/user.repository.js';

/**
 * Cas d'usage : Récupération du profil de l'utilisateur actuellement authentifié (GET /me)
 */
export class GetMe {
  constructor(private readonly users: UserRepository) {}

  async execute(userId: string): Promise<PublicUser> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new UserNotFound(userId);
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
