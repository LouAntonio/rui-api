FROM node:22-alpine AS base

WORKDIR /app

# Prisma generate runs on postinstall, so schema/config must exist before npm ci.
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci --omit=dev

RUN npx prisma generate

COPY src ./src

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
