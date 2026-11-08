export * from './get-product.js';
export * from './list-products.js';
export * from './create-product.js';
export * from './update-product.js';
export * from './delete-product.js';

import { GetProduct } from './get-product.js';
import { ListProducts } from './list-products.js';
import { CreateProduct } from './create-product.js';
import { UpdateProduct } from './update-product.js';
import { DeleteProduct } from './delete-product.js';

export interface ProductUseCases {
  getProduct: GetProduct;
  listProducts: ListProducts;
  createProduct: CreateProduct;
  updateProduct: UpdateProduct;
  deleteProduct: DeleteProduct;
}
