import type { Product, ProductPatch } from '../domain/product.js';
import { ProductNotFound } from '../domain/product.errors.js';
import type { ProductRepository } from '../domain/product.repository.js';

/**
 * Cas d'usage : Mise à jour partielle d'un produit existant
 */
export class UpdateProduct {
  constructor(private readonly products: ProductRepository) {}

  async execute(id: string, patch: ProductPatch): Promise<Product> {
    const existing = await this.products.findById(id);
    if (!existing) {
      throw new ProductNotFound(id);
    }
    return this.products.update(id, patch);
  }
}
