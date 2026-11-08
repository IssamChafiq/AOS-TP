import { config } from './config.js';
import { buildApp } from './app.js';
import { InMemoryProductRepository } from './contexts/product/infrastructure/in-memory-product.repository.js';
import { PrismaProductRepository } from './contexts/product/infrastructure/prisma-product.repository.js';
import { getPrismaClient } from './infrastructure/database/client.js';
import { GetProduct } from './contexts/product/use-cases/get-product.js';
import { ListProducts } from './contexts/product/use-cases/list-products.js';
import { CreateProduct } from './contexts/product/use-cases/create-product.js';
import { UpdateProduct } from './contexts/product/use-cases/update-product.js';
import { DeleteProduct } from './contexts/product/use-cases/delete-product.js';

async function bootstrap() {
  let repository;
  try {
    const prisma = getPrismaClient();
    repository = new PrismaProductRepository(prisma);
  } catch (err) {
    console.warn('[product] Impossible de connecter Prisma, utilisation du repository mémoire:', err);
    repository = new InMemoryProductRepository();
  }

  const useCases = {
    getProduct: new GetProduct(repository),
    listProducts: new ListProducts(repository),
    createProduct: new CreateProduct(repository),
    updateProduct: new UpdateProduct(repository),
    deleteProduct: new DeleteProduct(repository),
  };

  const app = buildApp({
    useCases,
    jwtSecret: config.JWT_SECRET,
    jwtIssuer: config.JWT_ISSUER,
    corsOrigins: config.CORS_ORIGINS,
  });

  app.listen(config.PORT, () => {
    console.log(`[product] Microservice Product démarré sur http://localhost:${config.PORT}`);
    console.log(`[product] Documentation Swagger : http://localhost:${config.PORT}/docs`);
  });
}

bootstrap().catch((err) => {
  console.error('[product] Erreur critique au démarrage:', err);
  process.exit(1);
});
