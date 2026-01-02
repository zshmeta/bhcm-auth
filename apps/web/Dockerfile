# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root config
COPY package.json package-lock.json turbo.json ./

# Copy all packages (required for monorepo npm ci)
COPY packages ./packages
COPY apps/web ./apps/web

# Install dependencies
RUN npm ci

# Build Web (Vitrine)
RUN npm run build --workspace=web

# Production Stage
FROM nginx:alpine AS runner
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
