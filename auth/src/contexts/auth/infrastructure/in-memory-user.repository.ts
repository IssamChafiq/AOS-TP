import { randomUUID } from 'node:crypto';
import type { Role, User } from '../domain/user.js';
import type { UserRepository } from '../domain/user.repository.js';

/**
 * Implémentation en mémoire (In-Memory) du UserRepository.
 * Idéale pour les tests unitaires et le développement local rapide sans dépendance externe.
 */
export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, User>();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalized = email.toLowerCase();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === normalized) {
        return user;
      }
    }
    return null;
  }

  async create(data: { email: string; passwordHash: string; role?: Role }): Promise<User> {
    const user: User = {
      id: randomUUID(),
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      role: data.role ?? 'user',
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  // Méthode utilitaire pour réinitialiser le repository (utilisée dans les tests)
  clear(): void {
    this.users.clear();
  }
}
