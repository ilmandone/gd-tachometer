# Stage 1: Build Angular frontend
# Angular outputPath is ../backend/public, so we copy both dirs
FROM node:22-alpine AS frontend-builder
WORKDIR /app
COPY frontend/ ./frontend/
COPY backend/ ./backend/
WORKDIR /app/frontend
RUN npm ci
RUN npm run build
# Output ends up at /app/backend/public/ (per angular.json outputPath)

# Stage 2: Build NestJS backend
FROM node:22-alpine AS backend-builder
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY backend/package*.json ./
RUN npm ci
COPY backend/src ./src
COPY backend/nest-cli.json backend/tsconfig*.json ./
RUN npm run build

# Stage 3: Production image
FROM node:22-alpine AS production
WORKDIR /app

# Install native deps (better-sqlite3 needs compilation), then clean build tools
RUN apk add --no-cache python3 make g++ tzdata
COPY backend/package*.json ./
RUN npm ci --omit=dev && apk del python3 make g++

# NestJS compiled code
COPY --from=backend-builder /app/dist ./dist

# Angular static files served by ServeStaticModule from join(__dirname, '..', 'public')
# At runtime __dirname = /app/dist, so static files must be at /app/public
COPY --from=frontend-builder /app/backend/public ./public

# SQLite database is created at /app/db.sqlite (relative CWD at runtime).
# Persist it with: docker run -v dcmetro_data:/app/db.sqlite dcmetro

ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main"]
