import { DomainError } from '../../../shared/domain-error.js';

/**
 * Erreur levée lorsqu'un produit n'existe pas en base.
 * Code HTTP : 404 Not Found
 */
export class ProductNotFound extends DomainError {
  constructor(id: string) {
    super(
      `No product with id '${id}'`,
      404,
      'https://polyshop.fr/problems/product-not-found',
      'Product not found'
    );
  }
}

/**
 * Erreur levée lorsqu'un produit avec le même nom existe déjà.
 * Code HTTP : 409 Conflict
 */
export class DuplicateProduct extends DomainError {
  constructor(name: string) {
    super(
      `A product with name '${name}' already exists`,
      409,
      'https://polyshop.fr/problems/duplicate-product',
      'Duplicate product'
    );
  }
}
