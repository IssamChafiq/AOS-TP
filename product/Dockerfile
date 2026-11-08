# Étape 1 : Installation des dépendances complètes
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Étape 2 : Compilation TypeScript et génération Prisma
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV DATABASE_URL="file:./dev.db"
RUN npx prisma generate
RUN npm run build

# Étape 3 : Dépendances de production uniquement
FROM node:22-alpine AS prod-deps
WORKDIR /app
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
RUN npm prune --omit=dev

# Étape 4 : Image d'exécution finale, légère et sécurisée
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Utilisation de l'utilisateur non privilégié node
USER node

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/docs ./docs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
