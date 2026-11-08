/**
 * Domaine Métier - Entité Produit et structures associées
 */

export interface Product {
  id: string;
  name: string;
  priceCents: number;
  tags: string[];
  createdAt: Date;
}

export type NewProduct = Omit<Product, 'id' | 'createdAt'>;

export type ProductPatch = Partial<NewProduct>;

export interface ProductQuery {
  page?: number;
  pageSize?: number;
  sort?: 'name' | 'priceCents' | 'createdAt';
  category?: string;
  q?: string;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
