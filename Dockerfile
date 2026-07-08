FROM node:22 AS base
WORKDIR /app

# Déclaration de l'argument
ARG VITE_REST_BASE_URL=https://monitoring-suspicious-discussions-on-online-plat-production.up.railway.app

# --- ÉTAPE 1 : DÉPENDANCES ---
# Correction du warning : "as" -> "AS"
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

# Création de l'utilisateur non-root (le nom "nitro" est juste une convention)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nitro

# OPTIMISATION NITRO :
# Au lieu de copier tout "/app", on copie uniquement le dossier de production ".output"
# (Si votre build génère un autre dossier comme "dist", adaptez le chemin)
COPY --from=builder /app/.output ./.output

# On donne les droits à l'utilisateur nitro sur le dossier
RUN chown -R nitro:nodejs ./.output

USER nitro

EXPOSE 3000
# Correction du warning : ajout du "="
ENV PORT=3000
ENV HOST=0.0.0.0

# Démarrage du serveur Nitro (le point d'entrée standard de Nitro)
CMD ["node", ".output/server/index.mjs"]