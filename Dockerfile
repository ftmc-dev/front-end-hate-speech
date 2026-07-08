FROM node:22 AS base
WORKDIR /app

# Déclaration de l'argument
ARG VITE_REST_BASE_URL=https://monitoring-suspicious-discussions-on-online-plat-production.up.railway.app

# --- ÉTAPE 1 : DÉPENDANCES ---
FROM base AS deps
COPY package.json vite.config.ts ./
COPY . .
RUN npm install

# --- ÉTAPE 2 : BUILD ---
FROM base AS builder
# On réinjecte l'argument
ARG VITE_REST_BASE_URL=https://monitoring-suspicious-discussions-on-online-plat-production.up.railway.app
# CRUCIAL POUR VITE : Transformer l'ARG en variable d'environnement
ENV VITE_REST_BASE_URL=$VITE_REST_BASE_URL

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- ÉTAPE 3 : SERVEUR DE PRODUCTION (RUNNER) ---
FROM base AS runner
WORKDIR /app

# Création de l'utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nitro

# On copie le build Nitro ET le package.json
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json

# On donne les droits à l'utilisateur nitro sur les deux éléments
RUN chown -R nitro:nodejs ./.output ./package.json

USER nitro

EXPOSE 3000
ENV PORT=3000
ENV HOST=0.0.0.0

# Démarrage du serveur Nitro
CMD ["node", ".output/server/index.mjs"]
