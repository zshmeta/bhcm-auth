# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root config
COPY package.json package-lock.json turbo.json ./

# Copy all packages
COPY packages ./packages
COPY apps/admin ./apps/admin

# Install dependencies
RUN npm ci

# Build Admin
RUN npm run build --workspace=apps/admin

# Production Stage
FROM nginx:alpine AS runner
COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
