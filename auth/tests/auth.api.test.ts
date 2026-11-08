import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { buildApp } from '../src/app.js';
import { InMemoryUserRepository } from '../src/contexts/auth/infrastructure/in-memory-user.repository.js';
import { Argon2PasswordHasher } from '../src/contexts/auth/infrastructure/argon2-password-hasher.js';
import { JwtTokenIssuer } from '../src/contexts/auth/infrastructure/jwt-token-issuer.js';
import { RegisterUser } from '../src/contexts/auth/use-cases/register-user.js';
import { LoginUser } from '../src/contexts/auth/use-cases/login-user.js';
import { GetMe } from '../src/contexts/auth/use-cases/get-me.js';

describe('Auth Service - API HTTP', () => {
  const secret = 'super-secret-test-key-at-least-32-chars';
  const issuer = 'polyshop-auth-test';
  let app: ReturnType<typeof buildApp>;
  let userRepo: InMemoryUserRepository;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    const hasher = new Argon2PasswordHasher();
    const tokens = new JwtTokenIssuer(secret, issuer, 900);

    const useCases = {
      registerUser: new RegisterUser(userRepo, hasher),
      loginUser: new LoginUser(userRepo, hasher, tokens),
      getMe: new GetMe(userRepo),
    };

    app = buildApp({
      useCases,
      jwtSecret: secret,
      jwtIssuer: issuer,
    });
  });

  describe('GET /health', () => {
    it('renvoie 200 OK avec le service auth', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.service).toBe('auth');
      expect(res.body.status).toBe('ok');
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('enregistre un utilisateur avec succès (201 Created)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'leia@polyshop.fr', password: 'correct-horse-battery' });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.email).toBe('leia@polyshop.fr');
      expect(res.body.role).toBe('user');
      expect(res.body.passwordHash).toBeUndefined();
    });

    it('rejette un format email invalide avec 400 problem+json', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'bad-email', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.headers['content-type']).toContain('application/problem+json');
      expect(res.body.type).toBe('https://polyshop.fr/problems/validation');
    });

    it('rejette un email déjà utilisé avec 409 problem+json', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'unique@polyshop.fr', password: 'password123' });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'unique@polyshop.fr', password: 'password123' });

      expect(res.status).toBe(409);
      expect(res.headers['content-type']).toContain('application/problem+json');
      expect(res.body.type).toBe('https://polyshop.fr/problems/email-already-used');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'luke@polyshop.fr', password: 'may-the-force-be-with-you' });
    });

    it('connecte un utilisateur valide et renvoie son JWT (200 OK)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'luke@polyshop.fr', password: 'may-the-force-be-with-you' });

      expect(res.status).toBe(200);
      expect(res.body.tokenType).toBe('Bearer');
      expect(res.body.accessToken).toBeDefined();
      expect(typeof res.body.accessToken).toBe('string');
      expect(res.body.expiresIn).toBe(900);
    });

    it('rejette un mot de passe incorrect avec 401 problem+json', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'luke@polyshop.fr', password: 'wrong-password' });

      expect(res.status).toBe(401);
      expect(res.headers['content-type']).toContain('application/problem+json');
      expect(res.body.type).toBe('https://polyshop.fr/problems/invalid-credentials');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('renvoie 401 si le token est manquant', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.headers['content-type']).toContain('application/problem+json');
      expect(res.headers['www-authenticate']).toContain('Bearer');
    });

    it('renvoie le profil avec 200 OK si le token Bearer est valide', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'han@polyshop.fr', password: 'kessel-run-12-parsecs' });

      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'han@polyshop.fr', password: 'kessel-run-12-parsecs' });

      const token = loginRes.body.accessToken;

      const meRes = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.email).toBe('han@polyshop.fr');
      expect(meRes.body.role).toBe('user');
    });
  });
});
