import express from 'express';
import { z } from 'zod';
import { products } from './products.js';

/**
 * Schéma Zod pour valider le paramètre :id dans l'URL.
 * Doit être un entier positif (chaîne composée uniquement de chiffres).
 */
const IdParam = z.object({
  id: z.string().regex(/^\d+$/, 'id must be a positive integer'),
});

/**
 * Schéma pour la requête de recherche optionnelle par tag.
 */
const QuerySchema = z.object({
  tag: z.string().optional(),
});

/**
 * Fabrique de l'application Express.
 * Sépare la création de l'application du démarrage réseau (listen)
 * afin de permettre des tests unitaires et d'intégration fiables sans port ouvert.
 */
export function buildApp() {
  const app = express();
  app.use(express.json());

  // Point de contrôle de santé (Health Check)
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'product',
      uptime: process.uptime(),
    });
  });

  // Liste de tous les produits (avec filtrage optionnel par ?tag=...)
  app.get('/products', (req, res) => {
    const parsedQuery = QuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      res.status(400).type('application/problem+json').json({
        type: 'https://polyshop.fr/problems/validation',
        title: 'Validation failed',
        status: 400,
        errors: parsedQuery.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      });
      return;
    }

    const tag = parsedQuery.data.tag;
    if (tag) {
      const filtered = products.filter((p) => p.tags.includes(tag));
      res.json(filtered);
      return;
    }

    res.json(products);
  });

  // Récupération d'un produit par son identifiant
  app.get('/products/:id', (req, res) => {
    const parsed = IdParam.safeParse(req.params);
    if (!parsed.success) {
      // Format RFC 7807 Problem Details en cas d'erreur de validation (400)
      res.status(400).type('application/problem+json').json({
        type: 'https://polyshop.fr/problems/validation',
        title: 'Validation failed',
        status: 400,
        errors: parsed.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      });
      return;
    }

    const product = products.find((p) => p.id === parsed.data.id);
    if (!product) {
      // Format RFC 7807 Problem Details en cas de produit introuvable (404)
      res.status(404).type('application/problem+json').json({
        type: 'https://polyshop.fr/problems/product-not-found',
        title: 'Product not found',
        status: 404,
        detail: `No product with id ${req.params.id}`,
        instance: req.originalUrl,
      });
      return;
    }

    res.json(product);
  });

  return app;
}
