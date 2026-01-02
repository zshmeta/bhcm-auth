# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root config
COPY package.json package-lock.json turbo.json ./

# Copy all packages (simplest for monorepo build without prune)
COPY packages ./packages
COPY apps/platform ./apps/platform

# Install dependencies (from root to link workspaces)
RUN npm ci

# Build Platform
RUN npm run build --workspace=platform

# Production Stage
FROM nginx:alpine AS runner
COPY --from=builder /app/apps/platform/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
