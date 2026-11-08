import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserRepository } from '../../src/contexts/auth/infrastructure/in-memory-user.repository.js';
import { RegisterUser } from '../../src/contexts/auth/use-cases/register-user.js';
import { LoginUser } from '../../src/contexts/auth/use-cases/login-user.js';
import { GetMe } from '../../src/contexts/auth/use-cases/get-me.js';
import { EmailAlreadyUsed, InvalidCredentials, UserNotFound } from '../../src/contexts/auth/domain/user.errors.js';
import { PasswordHasher } from '../../src/contexts/auth/domain/password-hasher.js';
import { TokenIssuer } from '../../src/contexts/auth/domain/token-issuer.js';

describe('Auth Use Cases (Tests Unitaires)', () => {
  let userRepo: InMemoryUserRepository;
  let mockHasher: PasswordHasher;
  let mockTokens: TokenIssuer;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    mockHasher = {
      hash: async (p: string) => `h:${p}`,
      verify: async (p: string, h: string) => `h:${p}` === h,
    };
    mockTokens = {
      issue: (claims) => `token-for-${claims.sub}-${claims.role}`,
    };
  });

  describe('RegisterUser', () => {
    it('inscrit un nouvel utilisateur avec succès et hash son mot de passe', async () => {
      const register = new RegisterUser(userRepo, mockHasher);
      const user = await register.execute({
        email: 'test@polyshop.fr',
        password: 'password123',
      });

      expect(user.id).toBeDefined();
      expect(user.email).toBe('test@polyshop.fr');
      expect(user.role).toBe('user');
      expect('passwordHash' in user).toBe(false);

      // Vérifie que l'utilisateur est bien persisté
      const saved = await userRepo.findById(user.id);
      expect(saved?.passwordHash).toBe('h:password123');
    });

    it('rejette une inscription si l’email est déjà utilisé (EmailAlreadyUsed)', async () => {
      const register = new RegisterUser(userRepo, mockHasher);
      await register.execute({ email: 'duplicate@polyshop.fr', password: 'password123' });

      await expect(
        register.execute({ email: 'duplicate@polyshop.fr', password: 'otherpassword' })
      ).rejects.toBeInstanceOf(EmailAlreadyUsed);
    });
  });

  describe('LoginUser', () => {
    it('renvoie un jeton JWT d’accès si les identifiants sont corrects', async () => {
      const register = new RegisterUser(userRepo, mockHasher);
      const login = new LoginUser(userRepo, mockHasher, mockTokens);

      const registered = await register.execute({
        email: 'alice@polyshop.fr',
        password: 'securepassword',
        role: 'user',
      });

      const result = await login.execute({
        email: 'alice@polyshop.fr',
        password: 'securepassword',
      });

      expect(result.tokenType).toBe('Bearer');
      expect(result.accessToken).toBe(`token-for-${registered.id}-user`);
      expect(result.expiresIn).toBe(900);
    });

    it('lève InvalidCredentials si l’utilisateur n’existe pas', async () => {
      const login = new LoginUser(userRepo, mockHasher, mockTokens);
      await expect(
        login.execute({ email: 'unknown@polyshop.fr', password: 'any' })
      ).rejects.toBeInstanceOf(InvalidCredentials);
    });

    it('lève InvalidCredentials si le mot de passe est erroné', async () => {
      const register = new RegisterUser(userRepo, mockHasher);
      const login = new LoginUser(userRepo, mockHasher, mockTokens);

      await register.execute({ email: 'bob@polyshop.fr', password: 'correct' });

      await expect(
        login.execute({ email: 'bob@polyshop.fr', password: 'wrong' })
      ).rejects.toBeInstanceOf(InvalidCredentials);
    });
  });

  describe('GetMe', () => {
    it('renvoie les informations publiques de l’utilisateur connecté', async () => {
      const register = new RegisterUser(userRepo, mockHasher);
      const getMe = new GetMe(userRepo);

      const created = await register.execute({ email: 'me@polyshop.fr', password: 'pass' });
      const me = await getMe.execute(created.id);

      expect(me.id).toBe(created.id);
      expect(me.email).toBe('me@polyshop.fr');
    });

    it('lève UserNotFound si l’identifiant n’existe pas', async () => {
      const getMe = new GetMe(userRepo);
      await expect(getMe.execute('unknown-id')).rejects.toBeInstanceOf(UserNotFound);
    });
  });
});
