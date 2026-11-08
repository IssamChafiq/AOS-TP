import { PrismaClient } from '@prisma/client';
import type { NewProduct, Page, Product, ProductPatch, ProductQuery } from '../domain/product.js';
import type { ProductRepository } from '../domain/product.repository.js';

/**
 * Implémentation du ProductRepository via Prisma ORM.
 * Gère de manière transparente la conversion des tags (chaîne SQLite ou tableau PostgreSQL).
 */
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private parseTags(tags: string | string[] | null | undefined): string[] {
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string') return tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    return [];
  }

  private serializeTags(tags: string[]): string {
    return tags.join(',');
  }

  async findById(id: string): Promise<Product | null> {
    const raw = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!raw) return null;
    return {
      id: raw.id,
      name: raw.name,
      priceCents: raw.priceCents,
      tags: this.parseTags(raw.tags),
      createdAt: raw.createdAt,
    };
  }

  async findByName(name: string): Promise<Product | null> {
    const raw = await this.prisma.product.findFirst({
      where: { name },
    });
    if (!raw) return null;
    return {
      id: raw.id,
      name: raw.name,
      priceCents: raw.priceCents,
      tags: this.parseTags(raw.tags),
      createdAt: raw.createdAt,
    };
  }

  async findPage(query: ProductQuery = {}): Promise<Page<Product>> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.max(1, query.pageSize ?? 10);
    const skip = (page - 1) * pageSize;

    const where: { name?: { contains: string }; tags?: { contains: string } } = {};
    if (query.q) {
      where.name = { contains: query.q };
    }
    if (query.category) {
      where.tags = { contains: query.category };
    }

    const sortField = query.sort ?? 'createdAt';
    const orderBy = {
      [sortField]: sortField === 'createdAt' ? ('desc' as const) : ('asc' as const),
    };

    const [rawItems, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
      }),
      this.prisma.product.count({ where }),
    ]);

    const items: Product[] = rawItems.map((raw) => ({
      id: raw.id,
      name: raw.name,
      priceCents: raw.priceCents,
      tags: this.parseTags(raw.tags),
      createdAt: raw.createdAt,
    }));

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  async create(data: NewProduct): Promise<Product> {
    const raw = await this.prisma.product.create({
      data: {
        name: data.name,
        priceCents: data.priceCents,
        tags: this.serializeTags(data.tags),
      },
    });

    return {
      id: raw.id,
      name: raw.name,
      priceCents: raw.priceCents,
      tags: this.parseTags(raw.tags),
      createdAt: raw.createdAt,
    };
  }

  async update(id: string, patch: ProductPatch): Promise<Product> {
    const updateData: { name?: string; priceCents?: number; tags?: string } = {};
    if (patch.name !== undefined) updateData.name = patch.name;
    if (patch.priceCents !== undefined) updateData.priceCents = patch.priceCents;
    if (patch.tags !== undefined) updateData.tags = this.serializeTags(patch.tags);

    const raw = await this.prisma.product.update({
      where: { id },
      data: updateData,
    });

    return {
      id: raw.id,
      name: raw.name,
      priceCents: raw.priceCents,
      tags: this.parseTags(raw.tags),
      createdAt: raw.createdAt,
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
  }
}
