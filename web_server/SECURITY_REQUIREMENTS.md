# OpenRouter 학습 문서 뷰어 보안 요구사항 문서

본 문서는 `C:\work\openrouter\web_server` (Express 백엔드 + 프론트엔드 뷰어) 애플리케이션의 보안 요구사항과 구현 가이드를 정의한다. 적용 대상 경로는 `open_router/doc` 및 `study` 두 루트 디렉토리만 허용한다.

## 1. API 보안

### 1.1 경로 traversal 보호 (`..` / `../` 차단)

사용자 제공 경로 파라미터(`dir`, `file`, `path`, `q` 등)에 포함된 `..`, 절대 경로, 심볼릭 링크, URL 인코딩된 traversal 시도를 모두 차단한다. 허용된 루트 디렉토리 하위 경로만 접근 가능해야 한다.

**구현 단계:**
1. 모든 경로 파라미터를 `decodeURIComponent`로 디코딩한 후 `path.resolve()`로 정규화한다.
2. 정규화된 경로가 허용 루트(`ROOTS.open_router`, `ROOTS.study`)로 시작하는지 `startsWith`로 검증한다.
3. `..` 세그먼트, NULL 바이트(`%00`), 백슬래시 조작 등이 포함된 요청은 HTTP 403 Forbidden으로 거부한다.
4. `fs.realpathSync`로 심볼릭 링크를 실제 경로로 변환한 후 루트 범위 내에 있는지 다시 확인한다.

**코드 예시 (src/server.js 미들웨어):**

```js
const path = require('path');
const fs = require('fs');

const ROOTS = {
  open_router: path.resolve('C:/work/openrouter/open_router/doc'),
  study: path.resolve('C:/work/openrouter/study/01_skill_claude')
};

const FORBIDDEN_PATTERNS = [/\.\./, /%00/i, /null/i];

function validateRoot(root) {
  if (!ROOTS[root]) throw new Error('invalid_root');
  return ROOTS[root];
}

function safePath(rootKey, userPath) {
  const rootPath = validateRoot(rootKey);
  const decoded = decodeURIComponent(userPath || '');
  if (FORBIDDEN_PATTERNS.some(re => re.test(decoded))) {
    throw new Error('forbidden_path');
  }
  const resolved = path.resolve(rootPath, decoded);
  const real = fs.existsSync(resolved) ? fs.realpathSync(resolved) : resolved;
  if (real !== rootPath && !real.startsWith(rootPath + path.sep)) {
    throw new Error('forbidden_path');
  }
  return real;
}
```

### 1.2 API 엔드포인트 레이트 리미팅

모든 API 엔드포인트(`/api/*`)에 레이트 리미트를 적용하여 DoS/브루트포스 공격을 방지한다. 검색 엔드포인트(`/api/search`)는 특히 비용이 높으므로 더 엄격한 제한을 적용한다.

**구현 단계:**
1. `express-rate-limit` 패키지를 설치한다.
2. 전역 기본 리밋: IP당 1분당 100회 요청.
3. `/api/search`: IP당 1분당 20회 요청으로 강화.
4. 레이트 초과 시 HTTP 429 Too Many Requests와 함께 Retry-After 헤더를 반환한다.
5. 신뢰할 수 있는 프록시 뒤 배포 시 `app.set('trust proxy', 1)`를 설정하여 실제 클라이언트 IP를 식별한다.

**코드 예시:**

```js
const rateLimit = require('express-rate-limit');

app.set('trust proxy', 1);

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'too_many_requests', message: '요청 횟수를 초과했습니다.' },
  standardHeaders: true,
  legacyHeaders: false
});

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'too_many_requests', message: '검색 요청 횟수를 초과했습니다.' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', apiLimiter);
app.use('/api/search', searchLimiter);
```

### 1.3 CORS 구성

동일 출처 정책을 준수하고, 불필요한 교차 출처 요청을 차단한다. 뷰어가 동일 도메인에서 호스팅되는 경우 CORS를 가장 제한적으로 구성한다.

**구현 단계:**
1. `cors` 미들웨어를 설치한다.
2. `origin` 허용 목록에 프론트엔드 도메인만 등록한다 (기본값: `http://localhost:3000`).
3. `credentials: false`로 설정(세션/쿠키 인증 미사용 시).
4. 허용 메서드를 `GET`으로 제한한다(뷰어는 읽기 전용).
5. `allowedHeaders`를 필요한 헤더만 허용한다.

**코드 예시:**

```js
const cors = require('cors');

const corsOptions = {
  origin: ['http://localhost:3000'],
  methods: ['GET'],
  allowedHeaders: ['Content-Type', 'Accept'],
  credentials: false,
  maxAge: 86400
};

app.use('/api/', cors(corsOptions));
```

### 1.4 입력 검증 및 사니타이징

모든 쿼리 파라미터와 요청 본문을 검증한다. 허용 문자 집합 외 입력은 거부한다.

**구현 단계:**
1. `root` 파라미터: `open_router` 또는 `study` 중 하나여야 함.
2. `dir`/`file`/`path`: 허용된 문자만 포함(`a-zA-Z0-9._/-`), 공백 제한, 최대 길이 512자.
3. `q` (검색어): 최대 200자, NULL 바이트 제거.
4. 파일 확장자: `.md`, `.markdown`만 허용.
5. 검증 실패 시 HTTP 400 Bad Request 반환, 상세 시스템 경로 노출 금지.

**코드 예시:**

```js
const ALLOWED_EXTENSIONS = ['.md', '.markdown'];
const MAX_PATH_LENGTH = 512;
const MAX_QUERY_LENGTH = 200;
const SAFE_PATH_REGEX = /^[a-zA-Z0-9_.\-/\\]+$/;

function validateRootParam(root) {
  if (!root || !ROOTS[root]) throw new Error('invalid_root');
}

function validatePathParam(p, maxLen = MAX_PATH_LENGTH) {
  if (!p || typeof p !== 'string') throw new Error('invalid_path');
  if (p.length > maxLen) throw new Error('path_too_long');
  if (!SAFE_PATH_REGEX.test(p)) throw new Error('invalid_path_characters');
  return p;
}

function validateExtension(file) {
  const ext = path.extname(file).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) throw new Error('invalid_extension');
}

function validateQuery(q) {
  if (!q || typeof q !== 'string') throw new Error('query_required');
  if (q.length > MAX_QUERY_LENGTH) throw new Error('query_too_long');
  return q.replace(/\0/g, '');
}
```

## 2. 콘텐츠 보안

### 2.1 마크다운 XSS 방지 (HTML 출력 사니타이징)

`marked`로 변환된 HTML은 신뢰할 수 없는 사용자 생성 콘텐츠이므로, 브라우저에 삽입하기 전에 DOMPurify 등으로 사니타이즈해야 한다. `<script>`, `javascript:`, `on*` 이벤트 속성, `iframe`, `object`, `embed` 등을 제거한다.

**구현 단계:**
1. `dompurify` 패키지를 설치한다.
2. 서버 측에서 `marked.parse()` 후 DOMPurify로 정화하거나, 클라이언트 측에서 `innerHTML` 삽입 전에 사니타이즈한다.
3. `viewerContent`에는 사니타이즈된 HTML만 주입하며, `textContent` 사용도 고려한다(현재 코드는 `textContent` 사용 중이므로 유지).
4. 마크다운 내 링크는 `rel="noopener noreferrer"` 및 `target="_blank"`를 적용한다.

**코드 예시:**

```js
// 서버 측 (서버에서 HTML 사니타이즈)
const { JSDOM } = require('jsdom');
const DOMPurify = require('dompurify');
const window = new JSDOM('').window;
const purify = DOMPurify(window);

function renderMarkdownSafe(markdown) {
  const html = marked.parse(markdown || '');
  return purify.sanitize(html, {
    ADD_ATTR: ['target', 'rel'],
    ADD_TAGS: [],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'on*']
  });
}

// 클라이언트 측 (public/app.v2.js)
async function renderViewer(html) {
  const purified = DOMPurify.sanitize(html, {
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['on*', 'javascript:']
  });
  viewerContent.innerHTML = purified;
}
```

### 2.2 렌더링 마크다운 내 인라인 스크립트 금지

마크다운 소스 내에 작성된 `<script>` 태그, `javascript:` URL, 이벤트 핸들러 속성이 실행되지 않도록 한다.

**구현 단계:**
1. `marked` 옵션에서 `sanitize: true` 사용(구버전) 또는 커스텀 renderer로 `<script>` 차단.
2. DOMPurify의 `FORBID_TAGS`에 `script` 포함.
3. CSP `script-src 'self'`로 인라인 스크립트 실행 자체를 브라우저 차단.
4. 클라이언트 측에서 마크다운을 `textContent`로만 삽입하는 경우 HTML 주입 자체를 원천 차단(현재 `viewerContent.textContent = data.content` 사용 중).

### 2.3 CSP 헤더 (Content-Security-Policy)

모든 응답에 CSP 헤더를 추가하여 XSS 및 데이터 주입 공격을 방지한다.

**구현 단계:**
1. Helmet 미들웨어 또는 수동으로 `Content-Security-Policy` 헤더 설정.
2. 권장 정책: `default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';`
3. 인라인 스크립트가 필요한 경우 nonce 또는 hash 기반 허용 목록 사용(`'unsafe-inline'` 지양).
4. 이미지, 스타일, 연결 출처를 `'self'` 및 신뢰할 수 있는 도메인으로 제한.
5. 정적 에셋(`public/`) 응답에도 동일 헤더 적용.

**코드 예시:**

```js
const helmet = require('helmet');

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:'],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    frameAncestors: ["'none'"]
  }
}));
```

또는 수동 미들웨어:

```js
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';");
  next();
});
```

## 3. 파일 시스템 보안

### 3.1 허용된 디렉토리만 접근 (`open_router/doc`, `study`)

서버가 노출하는 파일은 두 대상 폴더 내 마크다운 파일로 한정한다. 시스템 파일, 환경 변수 파일, 소스 코드 등은 직접 접근할 수 없다.

**구현 단계:**
1. `ROOTS` 객체에 두 루트만 등록하고, 등록되지 않은 루트 키는 403 거부.
2. 모든 파일 시스템 접근 전 `safePath()`로 루트 범위 내 검증.
3. 디렉토리 목록 표출은 허용된 루트 하위만 허용, 그 외는 403/404.
4. 정적 에셋(`public/`)만 별도로 제공하며, 그 외 디렉토리 탐색은 금지.

### 3.2 민감 파일 접근 금지 (`.env`, `.git`, `node_modules`, 시스템 파일)

`.env`, `.git/*`, `node_modules/*`, `/etc/*`, `C:\Windows\*` 등 민감 경로에 대한 접근을 원천 차단한다.

**구현 단계:**
1. 차단 패턴 목록 정의: `.env`, `.git`, `node_modules`, `etc`, `windows`, `system32` 등.
2. 경로에 차단 패턴이 포함되면 HTTP 403 Forbidden 반환.
3. 심볼릭 링크 따르기를 제한하여 루트 외 파일 우회 접근 방지 (`fs.realpathSync` 사용).

**코드 예시:**

```js
const FORBIDDEN_SEGMENTS = ['.env', '.git', 'node_modules', 'etc', 'windows', 'system32', 'config', 'secrets'];

function isForbiddenSegment(relPath) {
  const parts = relPath.split(path.sep).filter(Boolean);
  return parts.some(p => FORBIDDEN_SEGMENTS.includes(p.toLowerCase()));
}
```

### 3.3 뷰어 파일 크기 제한

대용량 파일 읽기로 인한 메모리 과다 사용 및 DoS를 방지하기 위해 파일 크기 상한을 설정한다.

**구현 단계:**
1. 최대 파일 크기 상한 정의 (예: 5MB).
2. `/api/view` 및 `/api/search`에서 `fs.statSync().size`로 크기 확인 후 초과 시 HTTP 413 Payload Too Large 반환.
3. 스트리밍 읽기 대신 크기 제한 후 `readFileSync` 사용, 또는 스트림으로 제한 크기까지만 읽기.

**코드 예시:**

```js
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function checkFileSize(filePath) {
  const stat = fs.statSync(filePath);
  if (stat.size > MAX_FILE_SIZE) {
    throw new Error('file_too_large');
  }
  return stat;
}
```

## 4. 인증/인가

### 4.1 민감 운영에 대한 API 키 검증

현재 뷰어는 읽기 전용이지만, 향후 문서 추가/수정/삭제 등 쓰기 작업을 지원할 경우 API 키 기반 인증을 적용한다.

**구현 단계:**
1. `X-API-Key` 헤더 또는 쿼리 파라미터 `api_key`로 API 키 전달.
2. 서버 측 환경 변수 `API_KEY`와 비교 (타임िंग 공격 방지를 위한 상수 시간 비교).
3. 쓰기 엔드포인트(`POST`, `PUT`, `DELETE`)에만 인증 미들웨어 적용, 읽기 엔드포인트는 선택적.
4. 유효하지 않거나 누락된 키는 HTTP 401 Unauthorized 반환.
5. API 키는 `.env`에 저장하고 `.gitignore`로 커밋 금지, 배포 환경의 시크릿 매니저로 주입.

**코드 예시:**

```js
const crypto = require('crypto');

const API_KEY = process.env.API_KEY;

function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'] || req.query.api_key;
  if (!key) return res.status(401).json({ error: 'unauthorized', message: 'API 키가 필요합니다.' });
  if (!crypto.timingSafeEqual(Buffer.from(key), Buffer.from(API_KEY || ''))) {
    return res.status(401).json({ error: 'unauthorized', message: '유효하지 않은 API 키입니다.' });
  }
  next();
}

// 쓰기 전용 라우트에 적용
app.post('/api/documents', requireApiKey, (req, res) => { ... });
```

### 4.2 세션 관리

현재는 인증이 필요 없는 공개 뷰어이지만, 향후 사용자별 접근 제어 도입 시 세션 관리를 적용한다.

**구현 단계:**
1. `express-session` 사용, 세션 쿠키에 `HttpOnly`, `Secure`, `SameSite=Strict` 플래그 적용.
2. 세션 비밀키는 환경 변수 `SESSION_SECRET`에서 주입.
3. 세션 만료 시간 설정 (예: 30분 비활성 시 만료).
4. 로그인/로그아웃 엔드포인트 추가, 민감 운영 전 세션 유효성 검사.
5. 세션 고정 공격 방지를 위해 인증 후 세션 ID 재생성(`req.session.regenerate`).

**코드 예시:**

```js
const session = require('express-session');

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 60 * 1000 // 30분
  }
}));
```

## 5. 데이터 보호

### 5.1 파일 내용 로깅 금지

서버 콘솔이나 로그 파일에 조회 중인 파일 내용, 검색어 스니펫, 사용자 문서 내용을 기록하지 않는다. 메타데이터(파일명, 경로, 크기, 수정 시각)만 최소한으로 로깅할 수 있다.

**구현 단계:**
1. `console.log`, `console.error`, winston/morgan 로거 등에 `content`, `html`, `snippet` 등을 포함하지 않도록 구현.
2. 에러 로깅 시 파일 내용 대신 파일명과 에러 코드만 기록.
3. 액세스 로그에서 쿼리 파라미터 `file`, `dir`, `q`의 전체 값은 마스킹하거나 축약하여 기록.

**코드 예시 (잘못된 예 → 올바른 예):**

```js
// ❌ 금지: 파일 내용을 로그에 기록
console.log('파일 내용:', content);

// ✅ 허용: 메타데이터만 기록
console.log('파일 조회', { root, file: path.basename(filePath), size: stat.size });
```

### 5.2 에러 메시지에서 시스템 경로 누출 방지

클라이언트에 반환하는 에러 메시지에서 절대 경로, 서버 내부 경로, 스택 트레이스, 파일 시스템 구조 등을 노출하지 않는다.

**구현 단계:**
1. 모든 에러 응답은 일반화된 메시지 사용 (예: "파일을 찾을 수 없습니다.", "접근이 금지된 경로입니다.").
2. `path`, `detail` 필드에 실제 시스템 경로를 포함하지 않음 (또는 개발 환경에서만).
3. Express 오류 처리 미들웨어에서 프로덕션 환경 시 스택 트레이스 제거.
4. 404/403 응답에서 요청된 경로를 그대로 반환하지 않음.

**코드 예시:**

```js
// 전역 오류 처리 미들웨어 (마지막에 등록)
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const isDev = process.env.NODE_ENV === 'development';

  const response = {
    error: err.code || 'internal_server_error',
    message: isDev ? err.message : '서버 오류가 발생했습니다.'
  };

  if (isDev && err.stack) {
    response.stack = err.stack; // 개발 환경에서만
  }

  res.status(status).json(response);
});

// 라우트별 예시
app.get('/api/view', (req, res) => {
  try {
    const realPath = safePath(root, file);
    // ...
  } catch (e) {
    if (e.message === 'forbidden_path') {
      return res.status(403).json({ error: 'forbidden', message: '접근이 금지된 경로입니다.' });
    }
    if (e.message === 'invalid_root') {
      return res.status(400).json({ error: 'invalid_root', message: '유효하지 않은 루트입니다.' });
    }
    return res.status(404).json({ error: 'not_found', message: '파일을 찾을 수 없습니다.' });
  }
});
```

## 6. 추가 보안 권장 사항

| 항목 | 권장 사항 |
|------|-----------|
| 의존성 취약점 스캔 | `npm audit` 정기 실행, `marked`/`express` 최신 안정 버전 유지, CI에 스캔 단계 추가 |
| 헤더 보안 | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer` |
| 호스트 바인딩 | 프로덕션 시 `127.0.0.1`만 바인딩 (로컬 전용) |
| `.env` 보호 | `.env`를 `.gitignore`에 추가, 실제 값은 커밋 금지 |
| 로그 로테이션 | 접근 로그 및 에러 로그 정기 로테이션, 민감 정보 미포함 |

이 문서는 `SECURITY.md`와 함께 유지보수하며, 새로운 엔드포인트 추가 시 본 요구사항을 재검토한다.
