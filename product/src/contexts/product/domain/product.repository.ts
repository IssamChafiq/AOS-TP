import type { NewProduct, Page, Product, ProductPatch, ProductQuery } from './product.js';

/**
 * Port secondaire (Interface du Repository Produit) :
 * Définit les méthodes d'accès et de persistance des produits.
 */
export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findByName(name: string): Promise<Product | null>;
  findPage(query: ProductQuery): Promise<Page<Product>>;
  create(product: NewProduct): Promise<Product>;
  update(id: string, patch: ProductPatch): Promise<Product>;
  delete(id: string): Promise<void>;
}
