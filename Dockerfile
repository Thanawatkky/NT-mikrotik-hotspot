# Stage 1: Build Next.js application
FROM node:22-alpine AS builder

WORKDIR /app

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
# Copy package.json and lock files to install dependencies
COPY package.json yarn.lock* package-lock.json* ./

# Install dependencies, including Prisma Client
RUN npm install --frozen-lockfile

# Copy the entire project
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js project
RUN npm run build

# Stage 2: Production image
FROM node:22-alpine AS runner

ENV NODE_ENV=production

WORKDIR /app

# Copy necessary files for production from the 'builder' stage
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/socket.js ./

# Make sure to copy any custom server files for Socket.IO if they're outside .next
# For example, if you have a 'server' directory with your Socket.IO server file:
# COPY --from=builder /app/server ./server

# Expose ports for Next.js (3000) and Socket.IO (4000)
EXPOSE 3000
EXPOSE 4000

# Command to run the Next.js application in production mode
CMD ["npm", "start"]