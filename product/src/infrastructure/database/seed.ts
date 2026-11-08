import { PrismaProductRepository } from '../../contexts/product/infrastructure/prisma-product.repository.js';
import { getPrismaClient } from './client.js';

const initialProducts = [
  { name: 'Clavier mécanique', priceCents: 8990, tags: ['peripherique', 'usb'] },
  { name: 'Souris sans fil', priceCents: 3490, tags: ['peripherique', 'bluetooth'] },
  { name: 'Écran 27" 4K', priceCents: 42900, tags: ['ecran'] },
  { name: 'Casque audio', priceCents: 12900, tags: ['audio', 'bluetooth'] },
  { name: 'Webcam 1080p', priceCents: 5990, tags: ['peripherique', 'usb'] },
];

async function main() {
  const prisma = getPrismaClient();
  const repo = new PrismaProductRepository(prisma);

  for (const item of initialProducts) {
    const existing = await repo.findByName(item.name);
    if (!existing) {
      await repo.create(item);
      console.log(`[product/seed] Produit inséré : ${item.name}`);
    } else {
      console.log(`[product/seed] Produit déjà présent : ${item.name}`);
    }
  }
}

main()
  .catch((err) => {
    console.error('[product/seed] Erreur lors du seed:', err);
    process.exit(1);
  })
  .finally(async () => {
    const prisma = getPrismaClient();
    await prisma.$disconnect();
  });
