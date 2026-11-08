import { Argon2PasswordHasher } from '../../contexts/auth/infrastructure/argon2-password-hasher.js';
import { PrismaUserRepository } from '../../contexts/auth/infrastructure/prisma-user.repository.js';
import { getPrismaClient } from './client.js';

/**
 * Script de peuplement (Seed) de la base de données Auth.
 * Crée le compte administrateur par défaut spécifié dans le workbook :
 * - Email: admin@polyshop.fr
 * - Mot de passe: admin-polyshop-2026
 * - Rôle: admin
 */
async function main() {
  const prisma = getPrismaClient();
  const repo = new PrismaUserRepository(prisma);
  const hasher = new Argon2PasswordHasher();

  const adminEmail = 'admin@polyshop.fr';
  const existing = await repo.findByEmail(adminEmail);

  if (!existing) {
    const passwordHash = await hasher.hash('admin-polyshop-2026');
    await repo.create({
      email: adminEmail,
      passwordHash,
      role: 'admin',
    });
    console.log(`[auth/seed] Utilisateur administrateur créé : ${adminEmail}`);
  } else {
    console.log(`[auth/seed] L'administrateur ${adminEmail} existe déjà.`);
  }
}

main()
  .catch((err) => {
    console.error('[auth/seed] Erreur lors du seeding:', err);
    process.exit(1);
  })
  .finally(async () => {
    const prisma = getPrismaClient();
    await prisma.$disconnect();
  });
