import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { buildApp } from '../src/app.js';

const app = buildApp();

describe('Microservice Product - TP1', () => {
  describe('GET /health', () => {
    it('renvoie 200 et le statut de santé du service', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('product');
      expect(typeof res.body.uptime).toBe('number');
    });
  });

  describe('GET /products', () => {
    it('renvoie la liste complète des 5 produits', async () => {
      const res = await request(app).get('/products');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(5);
    });

    it('permet de filtrer les produits par tag', async () => {
      const res = await request(app).get('/products?tag=bluetooth');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.every((p: { tags: string[] }) => p.tags.includes('bluetooth'))).toBe(true);
    });
  });

  describe('GET /products/:id', () => {
    it('renvoie 200 et le produit correspondant si présent', async () => {
      const res = await request(app).get('/products/2');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('2');
      expect(res.body.name).toBe('Souris sans fil');
      expect(res.body.priceCents).toBe(3490);
    });

    it('renvoie 404 en application/problem+json si le produit est absent', async () => {
      const res = await request(app).get('/products/999');
      expect(res.status).toBe(404);
      expect(res.headers['content-type']).toContain('application/problem+json');
      expect(res.body.type).toBe('https://polyshop.fr/problems/product-not-found');
      expect(res.body.title).toBe('Product not found');
      expect(res.body.detail).toBe('No product with id 999');
    });

    it("renvoie 400 si l'id n'est pas un entier valide", async () => {
      const res = await request(app).get('/products/abc');
      expect(res.status).toBe(400);
      expect(res.headers['content-type']).toContain('application/problem+json');
      expect(res.body.type).toBe('https://polyshop.fr/problems/validation');
      expect(res.body.title).toBe('Validation failed');
      expect(res.body.errors).toBeDefined();
    });
  });
});
