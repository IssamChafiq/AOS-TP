import { randomUUID } from 'node:crypto';
import type { NewProduct, Page, Product, ProductPatch, ProductQuery } from '../domain/product.js';
import type { ProductRepository } from '../domain/product.repository.js';

/**
 * Implémentation en mémoire (In-Memory) du ProductRepository.
 * Utilisée pour les tests unitaires et le mode démonstration rapide.
 */
export class InMemoryProductRepository implements ProductRepository {
  private readonly products = new Map<string, Product>();

  constructor(initialData?: Product[]) {
    if (initialData) {
      for (const p of initialData) {
        this.products.set(p.id, { ...p });
      }
    }
  }

  async findById(id: string): Promise<Product | null> {
    const product = this.products.get(id);
    return product ? { ...product } : null;
  }

  async findByName(name: string): Promise<Product | null> {
    const normalized = name.trim().toLowerCase();
    for (const p of this.products.values()) {
      if (p.name.trim().toLowerCase() === normalized) {
        return { ...p };
      }
    }
    return null;
  }

  async findPage(query: ProductQuery = {}): Promise<Page<Product>> {
    let list = Array.from(this.products.values());

    // Filtrage par catégorie (tag)
    if (query.category) {
      const cat = query.category.toLowerCase();
      list = list.filter((p) => p.tags.some((t) => t.toLowerCase() === cat));
    }

    // Recherche textuelle (q)
    if (query.q) {
      const q = query.q.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    // Tri (sort)
    const sortField = query.sort ?? 'createdAt';
    list.sort((a, b) => {
      if (sortField === 'name') return a.name.localeCompare(b.name);
      if (sortField === 'priceCents') return a.priceCents - b.priceCents;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    // Pagination
    const total = list.length;
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.max(1, query.pageSize ?? 10);
    const skip = (page - 1) * pageSize;
    const items = list.slice(skip, skip + pageSize).map((p) => ({ ...p }));
    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async create(data: NewProduct): Promise<Product> {
    const product: Product = {
      id: randomUUID(),
      name: data.name,
      priceCents: data.priceCents,
      tags: [...data.tags],
      createdAt: new Date(),
    };
    this.products.set(product.id, product);
    return { ...product };
  }

  async update(id: string, patch: ProductPatch): Promise<Product> {
    const existing = this.products.get(id);
    if (!existing) {
      throw new Error(`Product ${id} not found`);
    }

    const updated: Product = {
      ...existing,
      name: patch.name ?? existing.name,
      priceCents: patch.priceCents ?? existing.priceCents,
      tags: patch.tags ? [...patch.tags] : existing.tags,
    };

    this.products.set(id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<void> {
    this.products.delete(id);
  }

  clear(): void {
    this.products.clear();
  }
}
