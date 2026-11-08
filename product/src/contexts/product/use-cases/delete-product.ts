import { ProductNotFound } from '../domain/product.errors.js';
import type { ProductRepository } from '../domain/product.repository.js';

/**
 * Cas d'usage : Suppression d'un produit par son identifiant
 */
export class DeleteProduct {
  constructor(private readonly products: ProductRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.products.findById(id);
    if (!existing) {
      throw new ProductNotFound(id);
    }
    await this.products.delete(id);
  }
}
