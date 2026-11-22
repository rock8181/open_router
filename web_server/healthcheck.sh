#!/usr/bin/env bash
# /api/health 엔드포인트의 헬스 상태를 확인하는 스크립트

URL="${HEALTH_URL:-http://localhost:3000/api/health}"

if curl -sf "$URL" > /dev/null 2>&1; then
  echo "healthy"
  exit 0
else
  echo "unhealthy"
  exit 1
fi
