# --- Stage 1: Build the app ---
    FROM node:22-alpine AS builder

    WORKDIR /app
    
    # ENV สำหรับ Prisma
    ARG DATABASE_URL
    ENV DATABASE_URL=$DATABASE_URL
    
    COPY package.json package-lock.json ./
    RUN npm install --frozen-lockfile
    
    # Copy all source files
    COPY . .
    
    # Generate Prisma client
    RUN npx prisma generate
    
    # Build Next.js with standalone mode
    RUN npm run build
    
    # --- Stage 2: Production runner ---
    FROM node:22-alpine AS runner
    
    WORKDIR /app
    ENV NODE_ENV=production
    
    # ✅ Copy built standalone app (includes only necessary node_modules)
    COPY --from=builder /app/.next/standalone ./
    COPY --from=builder /app/.next/static ./public/_next/static
    COPY --from=builder /app/public ./public
    
    
    EXPOSE 3000
    
    CMD ["node", "server.js"]