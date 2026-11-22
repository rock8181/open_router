# Glass Folder Cards 배포 가이드

OpenRouter 프로젝트의 두 애플리케이션(정적 사이트 Vanilla JS / Express, Next.js React)을 배포하는 방법에 대한 문서입니다.

| 애플리케이션 | 경로 | 기술 스택 | 배포 형태 |
|-------------|------|----------|----------|
| 문서 뷰어 | `web_server/` | Vanilla HTML/CSS/JS + Express | 정적 사이트 또는 Node.js 서버 |
| 데모 앱 | `study/01_분석_21st-mcp/` | Next.js 14 + React 18 + Tailwind CSS | Next.js 정적 export 또는 서버 배포 |

디자인 시스템(`web_server/DESIGN_SYSTEM.md`)의 모든 토큰은 배포 환경에서도 동일하게 적용되어야 합니다.

---

## 1. 전제 조건 (Prerequisites)

### 공통

| 항목 | 요구사항 |
|------|---------|
| Node.js | v18 이상 (권장 v24.20.0) |
| npm | Node.js 기본 포함 |
| 디자인 토큰 | `--color-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--glass-*` CSS 변수 |
| 환경 변수 | `.env`, `.mcp.json` 등 비밀 파일을 `.gitignore`에 등록 (보안팀 체크리스트) |

### 정적 사이트 (web_server) 전용

| 항목 | 요구사항 |
|------|---------|
| Express | `npm install express marked` |
| 정적 에셋 | `public/` 디렉토리 (HTML, CSS, JS) |
| 포트 | 기본 3000번 (`src/server.js`) |

### Next.js (study/01_분석_21st-mcp) 전용

| 항목 | 버전 |
|------|------|
| Next.js | 14.2.x |
| React | 18.2.x |
| Tailwind CSS | 3.4.x |
| TypeScript | 5.x |

---

## 2. 방법 A — 정적 사이트 배포 (web_server)

### 2.1 로컬 실행

```powershell
# 프로젝트 디렉토리로 이동
Set-Location -LiteralPath "C:\work\openrouter\web_server"

# 의존성 설치
npm install

# 서버 시작
node src/server.js

# 브라우저에서 http://localhost:3000 접속
```

서버는 3000번 포트에서 실행됩니다. 헬스체크: `http://localhost:3000/api/health`

### 2.2 정적 파일만 배포 (서버리스 / 정적 호스팅)

Express 서버 없이 정적 파일(`public/index.html`, `public/style.css`, `public/app.js`)만 배포할 경우:

1. `public/` 디렉토리 전체를 정적 호스팅 서비스에 업로드
2. `index.html`에서 `style.css`, `app.js` 상대 경로 확인
3. `/api/documents`, `/api/view`, `/api/search` 엔드포인트는 Express 서버가 필요하므로, 정적 호스팅 시 별도 백엔드 API가 필요함 (또는 `serverless functions`로 구현)

### 2.3 Vercel 배포 (정적 사이트)

`web_server/doc/02_vercel_deploy_guide.md`를 참조하거나, 다음 설정으로 `vercel.json`을 추가:

```json
{
  "version": 2,
  "builds": [
    { "src": "public/**", "use": "@vercel/static" },
    { "src": "src/server.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/(.*\\.css)", "dest": "/public/$1" },
    { "src": "/(.*\\.js)", "dest": "/public/$1" },
    { "src": "/api/(.*)", "dest": "/src/server.js" },
    { "src": "/(.*)", "dest": "/public/index.html" }
  ]
}
```

배포 명령:

```powershell
npx vercel --prod
```

### 2.4 Docker 배포 (선택사항)

Docker가 설치된 환경에서는 `Dockerfile` 작성 후 빌드:

```dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "src/server.js"]
```

---

## 3. 방법 B — Next.js 배포 (study/01_분석_21st-mcp)

### 3.1 Vercel 배포 (권장)

Next.js는 Vercel에 최적화되어 있습니다.

```powershell
# 프로젝트 디렉토리로 이동
Set-Location -LiteralPath "C:\work\openrouter\study\01_분석_21st-mcp"

# 의존성 설치
npm install

# Vercel 로그인
npx vercel login

# 배포
npx vercel --prod
```

Vercel은 `next.config.js` 설정을 자동으로 감지하고 Next.js 런타임을 적용합니다.

### 3.2 정적 export 배포 (Static HTML)

정적 호스팅(Netlify, GitHub Pages, S3 등)에 배포하려면 `next.config.js`에 `output: "export"`를 추가:

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
```

빌드 및 내보내기:

```powershell
npm run build
```

결과물은 `out/` 디렉토리에 생성됩니다. 이 디렉토리 내용을 정적 호스팅에 업로드합니다.

> **주의**: `output: "export"` 사용 시 서버 사이드 렌더링(SSR), API Routes, 미들웨어는 사용할 수 없습니다. `GlassFolder`는 클라이언트 컴포넌트(`"use client"`)이므로 정적 export에도 문제없이 동작합니다.

### 3.3 Node.js 서버 배포

SSR이 필요한 경우:

```powershell
npm run build
npm start
```

`next start`는 프로덕션 서버를 3000번 포트에서 실행합니다. 포트 변경은 `PORT` 환경 변수로 제어.

---

## 4. 환경 변수 구성

| 변수 | 설명 | 예시 |
|------|------|------|
| `PORT` | 서버 포트 (web_server/Next.js) | `3000` |
| `NODE_ENV` | 실행 환경 | `production` |
| `API_KEY_21ST` | 21st.dev MCP API 키 (선택사항) | 보안 파일, 커밋 금지 |

`.env.example` 파일을 만들어 실제 값은 `.env`에 두고 `.gitignore`에 `.env`를 등록합니다.

```
# .env.example (템플릿만 커밋)
PORT=3000
NODE_ENV=production
API_KEY_21ST=your-api-key-here
```

```powershell
# .gitignore 예시
node_modules/
.env
.env.local
*.log
.next/
out/
```

---

## 5. 배포 전 체크리스트

### 디자인 시스템 준수 (DESIGN_SYSTEM.md)

- [ ] 모든 색상이 `--color-*` CSS 변수를 사용하고 원시 헥스 값이 없음
- [ ] 타이포그래피가 섹션 2 모듈러 스케일을 따름
- [ ] 간격이 4px 배수(`--space-*`)를 따름
- [ ] 반경이 `--radius-*` 토큰을 사용하고 동일한 반경이 배제됨
- [ ] `transition: all 0.2s`가 아닌 개별 속성 트랜지션 사용
- [ ] `prefers-reduced-motion` 처리됨
- [ ] 포커스 링이 `outline: none` 없이 존재함
- [ ] 터치 대상 최소 44×44px (`MOBILE_RESPONSIVE.md` 섹션 3)

### 접근성 (섹션 9)

- [ ] 대비 4.5:1 이상
- [ ] 키보드 내비게이션 가능 (Tab, Enter, Space, Escape)
- [ ] ARIA 속성(`role`, `aria-label`, `aria-expanded`, `aria-hidden`) 올바르게 설정
- [ ] 건너뛰기 링크(Skip Link) 존재 (`web_server/public/index.html` 라인 10)
- [ ] 포커스 트랩 구현 (뷰어 오버레이 등)

### 성능

- [ ] 아트워크 캔버스 캐싱 동작 확인 (동일 recipe+seed 재사용)
- [ ] 이미지 최적화 (Next.js `next/image` 또는 `unoptimized: true`)
- [ ] 번들 크기 확인 (`next build` 출력)
- [ ] 정적 에셋 캐싱 헤더 설정

### 보안

- [ ] `.env`, `.mcp.json` 등 API 키 파일 `.gitignore` 등록
- [ ] Express 경로 traversal 방지 (`web_server/src/server.js` `isWithinRoot`)
- [ ] XSS 방지 (marked sanitize 또는 DOMPurify 검토, `web_server/01_architecture.md` 섹션 5.3)

---

## 6. 플랫폼별 배포 요약

| 플랫폼 | 대상 애플리케이션 | 설정 | 명령 |
|--------|------------------|------|------|
| Vercel | Next.js | 기본 (Auto-detect) | `npx vercel --prod` |
| Vercel | 정적 사이트 | `vercel.json` 라우팅 | `npx vercel --prod` |
| Netlify | 정적 사이트 | `_redirects` 또는 `netlify.toml` | 대시보드 연결 후 배포 |
| GitHub Pages | 정적 사이트 (export) | `out/` 디렉토리 | `npm run build` 후 배포 |
| AWS S3 + CloudFront | 정적 사이트 | 정적 웹사이트 호스팅 | `aws s3 sync public/ s3://bucket` |
| Docker (Node.js) | 둘 다 | `Dockerfile` 작성 | `docker build -t app .` |
| 자체 서버 (Express) | 정적 사이트 | `node src/server.js` | `npm start` |
| 자체 서버 (Next.js) | Next.js | `npm run build && npm start` | `npm start` |

---

## 7. 문제 해결 (Troubleshooting)

| 증상 | 원인 | 해결 |
|------|------|------|
| 빌드 실패 | TypeScript 타입 오류 | `npx tsc --noEmit`로 타입 확인 후 수정 |
| 이미지 깨짐 | Next.js 이미지 최적화 | `next.config.js`에 `images.unoptimized: true` 추가 |
| CSS 토큰 적용 안 됨 | `globals.css`에 토큰 누락 | shadcn/ui CSS 변수(`--ring`, `--foreground` 등) 추가 |
| 배포 후 유리 효과 안 보임 | 브라우저 `backdrop-filter` 미지원 | 최신 브라우저 요구; 폴백 배경색 준비 |
| API 엔드포인트 404 | 정적 호스팅에서 API 미지원 | Vercel/Netlify 함수로 API 구현 또는 별도 백엔드 연동 |
| 포트 충돌 | 3000번 포트 사용 중 | `PORT` 환경 변수 변경 또는 `src/server.js` 포트 수정 |

---

## 8. 관련 문서

- `INTEGRATION_GUIDE.md` — 모든 프로젝트에 Glass Folder Cards 통합 가이드
- `QUICKSTART.md` — 5분 설정 가이드
- `COMPONENT_API.md` — GlassFolder 전체 Props API 레퍼런스
- `web_server/DESIGN_SYSTEM.md` — 디자인 시스템 단일 진실 공급원
- `web_server/MOBILE_RESPONSIVE.md` — 모바일 우선 반응형 디자인
- `web_server/01_architecture.md` — 웹 서버 아키텍처 (엔드포인트, 보안, 실행 방법)
- `web_server/02_vercel_deploy_guide.md` — Vercel 배포 가이드 (별도 문서)
