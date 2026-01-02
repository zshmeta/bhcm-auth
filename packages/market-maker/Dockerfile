FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json turbo.json ./
COPY packages ./packages

RUN npm ci
RUN npm run build --workspace=@repo/market-maker

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/market-maker/dist ./dist
COPY --from=builder /app/packages/market-maker/package.json ./package.json
COPY --from=builder /app/packages/market-maker/src ./src

# MM might rely on tsx in dev mode or node in prod.
# package.json says "dev": "tsx watch src/index.ts", "build": "tsc"
# If built, it should be in dist/index.js (or similar).
# Checking tsconfig, outDir is dist.
# So we run node dist/index.js
CMD ["node", "dist/index.js"]
