FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json turbo.json ./
COPY packages ./packages

# Install
RUN npm ci

# Build Backend
RUN npm run build --workspace=@repo/backend

# Runner
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=builder /app/packages/backend/package.json ./package.json

EXPOSE 8080
CMD ["node", "dist/index.js"]
