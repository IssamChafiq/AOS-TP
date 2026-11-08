# TP AOS - Architecture Orientée Services

Ce dépôt contient l'implémentation des microservices pour les **TP1, TP2 et TP3** du module Architecture Orientée Services (AOS).

## Structure du projet

- **`tp1-product/`** : Premier microservice Express monolithique (TP1) avec validation Zod, Vitest et format RFC 7807 (`application/problem+json`).
- **`product/`** : Microservice Product refactorisé en Architecture Hexagonale (TP2 & TP3) avec ports et adaptateurs, pagination, Swagger OpenAPI (`/docs`), et sécurisation JWT par rôles (`admin`).
- **`auth/`** : Microservice d'authentification autonome (TP3) avec hachage Argon2id, émission de jetons JWT HS256, gestion des rôles (`user`, `admin`), et endpoints `/register`, `/login`, `/me`.
- **`compose.yml`** : Orchestration multi-conteneurs Docker Compose pour les services `product`, `auth`, et leurs bases PostgreSQL respectives.

## Démarrage rapide

### 1. Tests unitaires et d'intégration
```bash
# TP1 Product
cd tp1-product && npm test

# TP2 & TP3 Product
cd ../product && npm test

# TP3 Auth Service
cd ../auth && npm test
```

### 2. Lancement en développement local
```bash
# Dans le dossier auth (port 3002)
cd auth && npm run dev

# Dans le dossier product (port 3001)
cd product && npm run dev
```

### 3. Lancement avec Docker Compose
```bash
docker compose up -d --build
```
