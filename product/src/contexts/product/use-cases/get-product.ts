import type { Product } from '../domain/product.js';
import { ProductNotFound } from '../domain/product.errors.js';
import type { ProductRepository } from '../domain/product.repository.js';

/**
 * Cas d'usage : Récupération d'un produit par son identifiant
 */
export class GetProduct {
  constructor(private readonly products: ProductRepository) {}

  async execute(id: string): Promise<Product> {
    const product = await this.products.findById(id);
    if (!product) {
      throw new ProductNotFound(id);
    }
    return product;
  }
}
