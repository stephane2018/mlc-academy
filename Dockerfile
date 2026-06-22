# =============================================================================
# Frontend MLC Academy (TanStack Start + Nitro, preset node-server).
# `vite build` produit une app Node autonome dans .output/ (node_modules tracé
# inclus) ; on la sert avec `node .output/server/index.mjs` (port via $PORT).
#
# ⚠️ Les variables VITE_* sont INLINÉES au build (bundle client) → elles doivent
# être passées en build-args, PAS au runtime :
#   docker build \
#     --build-arg VITE_API_URL=https://api.mlc-academy.be \
#     --build-arg VITE_SUPABASE_URL=https://xxxx.supabase.co \
#     --build-arg VITE_SUPABASE_ANON_KEY=eyJ... \
#     -t mlc-academy-front .
# =============================================================================

# ---- Build ------------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# pnpm via corepack (même major que la CI : pnpm 9).
RUN corepack enable && corepack prepare pnpm@9 --activate

# Dépendances (couche cachée tant que le lockfile ne change pas).
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Sources + build.
COPY . .
ARG VITE_API_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_API_URL=$VITE_API_URL \
    VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
RUN pnpm build

# ---- Runtime ----------------------------------------------------------------
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

# Sortie Nitro autonome (aucune dépendance externe à réinstaller).
COPY --from=build /app/.output ./.output

USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
