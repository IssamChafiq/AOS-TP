import { config } from './config.js';
import { buildApp } from './app.js';
import { Argon2PasswordHasher } from './contexts/auth/infrastructure/argon2-password-hasher.js';
import { JwtTokenIssuer } from './contexts/auth/infrastructure/jwt-token-issuer.js';
import { InMemoryUserRepository } from './contexts/auth/infrastructure/in-memory-user.repository.js';
import { PrismaUserRepository } from './contexts/auth/infrastructure/prisma-user.repository.js';
import { getPrismaClient } from './infrastructure/database/client.js';
import { RegisterUser } from './contexts/auth/use-cases/register-user.js';
import { LoginUser } from './contexts/auth/use-cases/login-user.js';
import { GetMe } from './contexts/auth/use-cases/get-me.js';

async function bootstrap() {
  const hasher = new Argon2PasswordHasher();
  const tokens = new JwtTokenIssuer(config.JWT_SECRET, config.JWT_ISSUER);

  // Choix du repository : Prisma si configuré, sinon InMemory
  let userRepository;
  try {
    const prisma = getPrismaClient();
    userRepository = new PrismaUserRepository(prisma);
  } catch (err) {
    console.warn('[auth] Impossible de connecter Prisma, utilisation du repository mémoire:', err);
    userRepository = new InMemoryUserRepository();
  }

  // Initialisation des cas d'usage
  const useCases = {
    registerUser: new RegisterUser(userRepository, hasher),
    loginUser: new LoginUser(userRepository, hasher, tokens),
    getMe: new GetMe(userRepository),
  };

  const app = buildApp({
    useCases,
    jwtSecret: config.JWT_SECRET,
    jwtIssuer: config.JWT_ISSUER,
    corsOrigins: config.CORS_ORIGINS,
  });

  app.listen(config.PORT, () => {
    console.log(`[auth] Microservice d'authentification à l'écoute sur http://localhost:${config.PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('[auth] Erreur critique au démarrage:', err);
  process.exit(1);
});
