import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { buildApp } from '../src/app.js';
import { InMemoryProductRepository } from '../src/contexts/product/infrastructure/in-memory-product.repository.js';
import { GetProduct } from '../src/contexts/product/use-cases/get-product.js';
import { ListProducts } from '../src/contexts/product/use-cases/list-products.js';
import { CreateProduct } from '../src/contexts/product/use-cases/create-product.js';
import { UpdateProduct } from '../src/contexts/product/use-cases/update-product.js';
import { DeleteProduct } from '../src/contexts/product/use-cases/delete-product.js';
import { generateTestToken } from './helpers.js';

describe('Product Service - API HTTP (TP2 & TP3)', () => {
  const secret = 'super-secret-test-key-at-least-32-chars';
  const issuer = 'polyshop-auth-test';
  let app: ReturnType<typeof buildApp>;
  let repo: InMemoryProductRepository;

  beforeEach(() => {
    repo = new InMemoryProductRepository();
    const useCases = {
      getProduct: new GetProduct(repo),
      listProducts: new ListProducts(repo),
      createProduct: new CreateProduct(repo),
      updateProduct: new UpdateProduct(repo),
      deleteProduct: new DeleteProduct(repo),
    };

    app = buildApp({
      useCases,
      jwtSecret: secret,
      jwtIssuer: issuer,
    });
  });

  describe('GET /health', () => {
    it('renvoie 200 et les métriques de base', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.service).toBe('product');
      expect(res.body.status).toBe('ok');
    });
  });

  describe('GET /api/v1/products', () => {
    it('renvoie une page vide initialement', async () => {
      const res = await request(app).get('/api/v1/products');
      expect(res.status).toBe(200);
      expect(res.body.items).toEqual([]);
      expect(res.body.total).toBe(0);
    });

    it('renvoie la pagination et supporte le filtrage', async () => {
      await repo.create({ name: 'Webcam', priceCents: 5990, tags: ['usb'] });
      await repo.create({ name: 'Microphone', priceCents: 8900, tags: ['audio'] });

      const res = await request(app).get('/api/v1/products?category=usb');
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(1);
      expect(res.body.items[0].name).toBe('Webcam');
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('renvoie 200, le produit et l’en-tête ETag', async () => {
      const created = await repo.create({ name: 'Hub USB', priceCents: 2990, tags: ['usb'] });

      const res = await request(app).get(`/api/v1/products/${created.id}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Hub USB');
      expect(res.headers.etag).toBeDefined();
    });

    it('renvoie 404 RFC 7807 si le produit est absent', async () => {
      const res = await request(app).get('/api/v1/products/inexistant-404');
      expect(res.status).toBe(404);
      expect(res.headers['content-type']).toContain('application/problem+json');
      expect(res.body.type).toBe('https://polyshop.fr/problems/product-not-found');
    });
  });

  describe('Sécurité & Rôles (TP3) sur POST /api/v1/products', () => {
    it('rejette la requête sans jeton avec 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .send({ name: 'Hub', priceCents: 2990 });

      expect(res.status).toBe(401);
      expect(res.headers['content-type']).toContain('application/problem+json');
    });

    it('rejette la requête d’un utilisateur standard (rôle "user") avec 403 Forbidden', async () => {
      const userToken = generateTestToken({ secret, issuer, role: 'user' });

      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Hub', priceCents: 2990 });

      expect(res.status).toBe(403);
      expect(res.headers['content-type']).toContain('application/problem+json');
      expect(res.body.title).toBe('Forbidden');
    });

    it('autorise la création par un administrateur (rôle "admin") avec 201 Created', async () => {
      const adminToken = generateTestToken({ secret, issuer, role: 'admin' });

      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Tapis de souris', priceCents: 1290, tags: ['peripherique'] });

      expect(res.status).toBe(201);
      expect(res.headers.location).toContain('/api/v1/products/');
      expect(res.body.name).toBe('Tapis de souris');
      expect(res.body.priceCents).toBe(1290);
    });
  });

  describe('Sécurité & Rôles sur PATCH et DELETE /api/v1/products/:id', () => {
    it('permet à l’administrateur de modifier puis supprimer un produit', async () => {
      const adminToken = generateTestToken({ secret, issuer, role: 'admin' });
      const created = await repo.create({ name: 'Câble HDMI', priceCents: 990, tags: ['video'] });

      // Modification
      const patchRes = await request(app)
        .patch(`/api/v1/products/${created.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ priceCents: 1190 });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.priceCents).toBe(1190);

      // Suppression
      const deleteRes = await request(app)
        .delete(`/api/v1/products/${created.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(204);
    });
  });
});
