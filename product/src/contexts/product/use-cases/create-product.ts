import type { NewProduct, Product } from '../domain/product.js';
import { DuplicateProduct } from '../domain/product.errors.js';
import type { ProductRepository } from '../domain/product.repository.js';

/**
 * Cas d'usage : Création d'un nouveau produit
 * Vérifie l'unicité du nom de produit avant persistance.
 */
export class CreateProduct {
  constructor(private readonly products: ProductRepository) {}

  async execute(input: NewProduct): Promise<Product> {
    const existing = await this.products.findByName(input.name);
    if (existing) {
      throw new DuplicateProduct(input.name);
    }
    return this.products.create(input);
  }
}
