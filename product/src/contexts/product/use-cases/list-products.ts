import type { Page, Product, ProductQuery } from '../domain/product.js';
import type { ProductRepository } from '../domain/product.repository.js';

/**
 * Cas d'usage : Liste paginée et filtrée des produits
 */
export class ListProducts {
  constructor(private readonly products: ProductRepository) {}

  async execute(query: ProductQuery = {}): Promise<Page<Product>> {
    return this.products.findPage(query);
  }
}
