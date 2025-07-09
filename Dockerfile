# Gunakan image Node.js yang ringan
FROM node:18-alpine AS base

WORKDIR /app

# Salin file dependency
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Salin semua file project
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js app
RUN npm run build

# Production image
FROM node:18-alpine AS prod
WORKDIR /app

# Salin node_modules dan build dari stage sebelumnya
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/src ./src
COPY --from=base /app/tsconfig.json ./tsconfig.json
COPY --from=base /app/next.config.ts ./next.config.ts
COPY --from=base /app/.env ./.env

# Jalankan Next.js
EXPOSE 3000
CMD ["npm", "start"] 