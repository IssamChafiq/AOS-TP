import { PrismaClient } from '@prisma/client';
import type { Role, User } from '../domain/user.js';
import type { UserRepository } from '../domain/user.repository.js';

/**
 * Implémentation du UserRepository basée sur Prisma ORM.
 * Fonctionne indifféremment avec SQLite ou PostgreSQL.
 */
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!raw) return null;
    return {
      id: raw.id,
      email: raw.email,
      passwordHash: raw.passwordHash,
      role: raw.role as Role,
      createdAt: raw.createdAt,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!raw) return null;
    return {
      id: raw.id,
      email: raw.email,
      passwordHash: raw.passwordHash,
      role: raw.role as Role,
      createdAt: raw.createdAt,
    };
  }

  async create(data: { email: string; passwordHash: string; role?: Role }): Promise<User> {
    const raw = await this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        role: data.role ?? 'user',
      },
    });
    return {
      id: raw.id,
      email: raw.email,
      passwordHash: raw.passwordHash,
      role: raw.role as Role,
      createdAt: raw.createdAt,
    };
  }
}
