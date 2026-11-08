import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InMemoryProductRepository } from '../../src/contexts/product/infrastructure/in-memory-product.repository.js';
import { GetProduct } from '../../src/contexts/product/use-cases/get-product.js';
import { CreateProduct } from '../../src/contexts/product/use-cases/create-product.js';
import { ListProducts } from '../../src/contexts/product/use-cases/list-products.js';
import { UpdateProduct } from '../../src/contexts/product/use-cases/update-product.js';
import { DeleteProduct } from '../../src/contexts/product/use-cases/delete-product.js';
import { DuplicateProduct, ProductNotFound } from '../../src/contexts/product/domain/product.errors.js';
import type { ProductRepository } from '../../src/contexts/product/domain/product.repository.js';

describe('Product Use Cases (Tests Unitaires - TP2)', () => {
  let repo: InMemoryProductRepository;

  beforeEach(() => {
    repo = new InMemoryProductRepository();
  });

  describe('GetProduct', () => {
    it('lève ProductNotFound si le produit est absent (test du workbook)', async () => {
      const mockRepo = { findById: vi.fn(async () => null) } as unknown as ProductRepository;
      await expect(new GetProduct(mockRepo).execute('42')).rejects.toBeInstanceOf(ProductNotFound);
    });

    it('retourne le produit correspondant s’il existe', async () => {
      const created = await repo.create({
        name: 'Souris sans fil',
        priceCents: 3490,
        tags: ['peripherique'],
      });

      const getProduct = new GetProduct(repo);
      const result = await getProduct.execute(created.id);
      expect(result.id).toBe(created.id);
      expect(result.name).toBe('Souris sans fil');
    });
  });

  describe('CreateProduct', () => {
    it('crée un produit avec succès', async () => {
      const createProduct = new CreateProduct(repo);
      const product = await createProduct.execute({
        name: 'Clavier mécanique',
        priceCents: 8990,
        tags: ['usb'],
      });

      expect(product.id).toBeDefined();
      expect(product.name).toBe('Clavier mécanique');
      expect(product.priceCents).toBe(8990);
    });

    it('rejette la création si un produit portant le même nom existe déjà (DuplicateProduct)', async () => {
      const createProduct = new CreateProduct(repo);
      await createProduct.execute({
        name: 'Clavier mécanique',
        priceCents: 8990,
        tags: ['usb'],
      });

      await expect(
        createProduct.execute({
          name: 'Clavier mécanique',
          priceCents: 9990,
          tags: [],
        })
      ).rejects.toBeInstanceOf(DuplicateProduct);
    });
  });

  describe('ListProducts', () => {
    it('renvoie une page de produits avec filtres et pagination', async () => {
      await repo.create({ name: 'Prod A', priceCents: 1000, tags: ['usb'] });
      await repo.create({ name: 'Prod B', priceCents: 2000, tags: ['bluetooth'] });
      await repo.create({ name: 'Prod C', priceCents: 3000, tags: ['usb'] });

      const listProducts = new ListProducts(repo);
      const page = await listProducts.execute({ category: 'usb', pageSize: 1 });

      expect(page.total).toBe(2);
      expect(page.items.length).toBe(1);
      expect(page.totalPages).toBe(2);
    });
  });

  describe('UpdateProduct', () => {
    it('met à jour les champs demandés d’un produit existant', async () => {
      const created = await repo.create({ name: 'Ecran', priceCents: 30000, tags: [] });
      const updateProduct = new UpdateProduct(repo);

      const updated = await updateProduct.execute(created.id, { priceCents: 25000 });
      expect(updated.priceCents).toBe(25000);
      expect(updated.name).toBe('Ecran');
    });

    it('lève ProductNotFound si le produit à modifier n’existe pas', async () => {
      const updateProduct = new UpdateProduct(repo);
      await expect(updateProduct.execute('inexistant', { priceCents: 100 })).rejects.toBeInstanceOf(
        ProductNotFound
      );
    });
  });

  describe('DeleteProduct', () => {
    it('supprime un produit existant', async () => {
      const created = await repo.create({ name: 'Casque', priceCents: 5000, tags: [] });
      const deleteProduct = new DeleteProduct(repo);

      await deleteProduct.execute(created.id);
      const found = await repo.findById(created.id);
      expect(found).toBeNull();
    });

    it('lève ProductNotFound si le produit à supprimer n’existe pas', async () => {
      const deleteProduct = new DeleteProduct(repo);
      await expect(deleteProduct.execute('non-existant')).rejects.toBeInstanceOf(ProductNotFound);
    });
  });
});
