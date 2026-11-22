# 단계 1: 의존성 설치 및 애플리케이션 빌드
FROM node:18-alpine AS base

WORKDIR /app

# 프로덕션 의존성 설치 (레이어 캐싱 최적화)
COPY package.json package-lock.json ./
RUN npm ci --only=production

# 단계 2: 런타임 이미지
FROM node:18-alpine

WORKDIR /app

# 프로덕션 의존성만 복사
COPY --from=base /app/node_modules ./node_modules

# 애플리케이션 소스 및 정적 파일 복사
COPY src ./src
COPY public ./public

# 애플리케이션 포트 노출
EXPOSE 3000

# 헬스체크: /api/health 엔드포인트 확인
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# 서버 시작
CMD ["node", "src/server.js"]
