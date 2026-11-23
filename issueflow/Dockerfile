FROM node:24-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates postgresql-client tar \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

COPY . .

ENV NODE_ENV=production
ENV DATABASE_URL=postgresql://issueflow:issueflow@db:5432/issueflow
ENV BETTER_AUTH_SECRET=build-only-secret-override-at-runtime-32ch
ENV BETTER_AUTH_URL=http://localhost:3000

RUN npx prisma generate && npm run build

EXPOSE 3000

CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "3000"]
