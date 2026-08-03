# Next.js — build + run แบบ standalone
# หมายเหตุ: NEXT_PUBLIC_API_URL ถูกฝังตอน build — ต้องส่งเป็น build arg
# ให้ชี้ URL ของ backend ที่เครื่อง client เข้าถึงได้ (เช่น http://192.168.200.58:3001/api)

FROM node:22-alpine AS builder
RUN corepack enable
WORKDIR /app

# เน็ตองค์กรช้า — ยืด timeout + retry ให้ pnpm ไม่ล้มกลางทาง
ENV npm_config_fetch_timeout=600000 \
    npm_config_fetch_retries=5 \
    npm_config_fetch_retry_maxtimeout=120000 \
    npm_config_network_concurrency=4

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# cache store ของ pnpm ข้ามรอบ build — ล้มแล้ว build ใหม่ไม่ต้องโหลดซ้ำทั้งหมด
RUN --mount=type=cache,id=pnpm-store,target=/pnpm-store \
    pnpm config set store-dir /pnpm-store && \
    pnpm install --frozen-lockfile --prefer-offline

COPY . .
ARG NEXT_PUBLIC_API_URL=http://localhost:3001/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
