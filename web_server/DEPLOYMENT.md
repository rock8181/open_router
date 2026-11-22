# OpenRouter 문서 뷰어 배포 가이드

OpenRouter 학습 문서 뷰어를 Docker, GitHub Pages, Vercel 등에 배포하는 방법을 안내합니다.

---

## 1. Docker 배포

### Dockerfile

프로젝트 루트에 `Dockerfile`을 생성합니다.

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --omit=dev

COPY src ./src
COPY public ./public

ENV PORT=3000
EXPOSE 3000

CMD ["node", "src/server.js"]
```

### .dockerignore

```
node_modules
npm-debug.log
.DS_Store
.git
```

### 빌드 및 실행

```bash
# 이미지 빌드
docker build -t openrouter-doc-viewer .

# 컨테이너 실행
docker run -p 3000:3000 openrouter-doc-viewer
```

브라우저에서 `http://localhost:3000`에 접속합니다.

### 환경 변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `PORT` | `3000` | 서버 리슨 포트 |

```bash
docker run -p 8080:3000 -e PORT=3000 openrouter-doc-viewer
```

---

## 2. GitHub Pages 배포

GitHub Pages는 정적 사이트 호스팅 서비스로, Node.js 서버를 직접 실행할 수 없습니다. 따라서 프론트엔드 정적 파일만 배포하고, 백엔드 API는 별도로 호스팅해야 합니다.

### 배포 전략

1. `public/` 디렉토리(`index.html`, `app.v2.js`, `style.css`)를 GitHub Pages에 정적으로 배포합니다.
2. 백엔드 API(`src/server.js`)는 별도 서버(Docker, Vercel, Render 등)에 배포합니다.
3. 프론트엔드의 `BASE` 변수를 프로덕션 API URL로 설정합니다.

### GitHub Actions 워크플로우 예시

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy public folder to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./web_server/public
```

### 프론트엔드 API 주소 연결

`public/app.v2.js`의 상단에 있는 `BASE` 변수를 수정합니다.

```js
// 로컬 개발
const BASE = '';

// 프로덕션 (API 서버 별도 호스팅 시)
const BASE = 'https://api.openrouter.example.com';
```

---

## 3. Vercel 배포

Vercel은 서버리스 함수와 정적 호스팅을 모두 지원합니다. Express 서버를 Vercel Serverless Functions로 배포할 수 있습니다.

### 프로젝트 구조 조정

Vercel은 `api/` 디렉토리 아래의 파일을 서버리스 함수로 인식합니다. Express 앱을 하나의 핸들러로 내보내야 합니다.

`api/server.js` (또는 vercel.json 설정):

```js
// api/server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const marked = require('marked');

const app = express();

const ROOTS = {
  open_router: path.resolve(process.env.ROOT_OPEN_ROUTER || 'C:/work/openrouter/open_router'),
  study: path.resolve(process.env.ROOT_STUDY || 'C:/work/openrouter/study')
};

// ... (기존 server.js의 미들웨어와 라우트 동일)

module.exports = app;
```

### vercel.json

```json
{
  "version": 2,
  "builds": [
    { "src": "public/**", "use": "@vercel/static" },
    { "src": "api/server.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/server.js" },
    { "src": "/(.*)", "dest": "/public/$1" }
  ]
}
```

### 배포 명령

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

### 환경 변수 (Vercel 대시보드)

| 변수 | 설명 |
|------|------|
| `ROOT_OPEN_ROUTER` | open_router 루트 절대 경로 |
| `ROOT_STUDY` | study 루트 절대 경로 |
| `PORT` | 서버 포트 (Vercel은 자동 할당) |

> Vercel 서버리스 환경은 파일 시스템에 영구 쓰기가 불가능하므로, 문서 조회(읽기 전용)만 가능합니다.

---

## 4. 프로덕션 체크리스트

배포 전 다음 항목을 확인합니다.

- [ ] `NODE_ENV=production` 설정
- [ ] 포트 방화벽 규칙 확인 (3000 또는 지정된 포트)
- [ ] 허용된 루트 디렉토리(`open_router`, `study`) 존재 여부 확인
- [ ] 정적 파일(`public/`) 배포 경로 확인
- [ ] HTTPS 적용 (클립보드 API는 보안 문맥 필요)
- [ ] 로그 모니터링 설정
- [ ] 백업 정책 수립 (문서 원본 저장소)

---

## 5. 관련 문서

- [README.md](./README.md) - 프로젝트 개요 및 빠른 시작
- [API_DOCS.md](./API_DOCS.md) - API 엔드포인트 상세 명세
- [USER_GUIDE.md](./USER_GUIDE.md) - 사용자 가이드
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - 디자인 시스템
- [CONTRIBUTING.md](./CONTRIBUTING.md) - 기여 가이드
