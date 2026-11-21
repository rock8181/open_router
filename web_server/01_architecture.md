# 웹 서버 아키텍처 설계 문서

## 1. 개요

본 문서는 `C:\work\openrouter\open_router\doc` 과 `C:\work\openrouter\study\01_skill_claude` 폴더에 저장된 마크다운 문서들을 웹 브라우저에서 쉽고 직관적으로 탐색 및 열람할 수 있는 정적/동적 웹 서버의 아키텍처를 정의한다.

사용자는 웹 인터페이스를 통해 폴더별 문서 목록을 대시보드 형태로 조회하고, 특정 마크다운 파일을 HTML로 렌더링하여 읽을 수 있으며, 전체 문서에 대한 키워드 검색도 수행할 수 있다. Docker는 설치되어 있지 않으므로, 사용자 환경에 이미 설치된 Node.js(v24.20.0)를 기반으로 로컬에서 실행하는 것을 전제로 설계한다.

## 2. 기술 스택

| 항목 | 기술 | 버전 및 비고 |
|------|------|-------------|
| 런타임 | Node.js | v24.20.0 (사용자 환경에 이미 설치됨) |
| 웹 프레임워크 | Express | 단순하고 가벼운 HTTP 서버 구축 |
| 마크다운 렌더링 | marked | 마크다운을 HTML로 변환 |
| 템플릿 엔진 | EJS | 대시보드 및 뷰 페이지 렌더링 |
| 정적 파일 제공 | Express.static | CSS, JS, 이미지 등 정적 에셋 제공 |
| 패키지 관리자 | npm | Node.js 기본 포함 |
| 실행 환경 | 로컬 Node.js | Docker 미설치로 미사용 |
| 포트 | 3000 | 로컬 개발 서버 전용 |

### 선택 rationale

- **Express**: 경로 라우팅, 미들웨어, 정적 파일 제공이 단순하며 Node.js 생태계에서 가장 널리 사용되는 웹 프레임워크이다.
- **marked**: 마크다운 파싱 및 HTML 변환에 특화된 경량 라이브러리로, GitHub Flavored Markdown을 잘 지원한다.
- **EJS**: HTML 템플릿에 JavaScript 변수를 쉽게 삽입할 수 있어 대시보드 카드 구성 등에 적합하다.

## 3. 디렉토리 구조

웹 서버 프로젝트 루트는 `C:\work\openrouter\web_server`이며, 아래와 같이 구성한다.

```
web_server/
├── doc/                          # 아키텍처 설계 문서 (본 문서)
│   └── 01_architecture.md
├── public/                       # 정적 에셋 (CSS, 클라이언트 JS)
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── src/                          # 서버 소스 코드
│   ├── server.js                 # Express 앱 진입점 및 라우팅
│   ├── routes/
│   │   ├── index.js              # GET / 대시보드
│   │   ├── documents.js          # GET /documents
│   │   ├── view.js               # GET /view
│   │   ├── search.js             # GET /api/search
│   │   └── health.js             # GET /health
│   ├── services/
│   │   ├── fileService.js        # 파일 시스템 읽기, 경로 검증
│   │   ├── markdownService.js    # marked 기반 마크다운→HTML 변환
│   │   └── searchService.js      # 전체 문서 텍스트 검색
│   └── utils/
│       └── pathUtils.js          # 경로 traversal 방지 유틸리티
├── package.json                  # npm 의존성 및 스크립트
└── node_modules/                 # 설치된 패키지 (npm install 생성)
```

### 서브 문서 대상 경로

웹 서버가 제공(serve)하는 대상 문서 디렉토리는 다음과 같다.

1. `C:\work\openrouter\open_router\doc` — OpenRouter 관련 설계/설정 문서
2. `C:\work\openrouter\study\01_skill_claude` — Claude 스킬 학습 문서

이 두 폴더를 루트 문서 폴더로 등록하며, 하위 폴더와 마크다운 파일(`.md`)만 접근 대상으로 한다.

## 4. 엔드포인트 설계

### 4.1 GET / — 문서 목록 대시보드

- **설명**: 등록된 두 문서 폴더의 하위 구조를 폴더별로 그룹화하여 카드 형태의 대시보드로 보여준다.
- **응답**: HTML (EJS 템플릿 렌더링)
- **구성 요소**:
  - 폴더별 문서 카드 (폴더명, 문서 수, 대표 파일 목록)
  - 각 카드 클릭 시 해당 폴더의 문서 목록 페이지(`/documents?path=...`)로 이동
  - 상단에 검색 입력 필드 (`/api/search` 연동)

### 4.2 GET /documents?path=... — 특정 폴더의 문서 목록 JSON

- **설명**: 쿼리 파라미터 `path`로 지정된 폴더 내의 마크다운 파일 목록과 하위 폴더 목록을 JSON으로 반환한다.
- **요청 예시**: `GET /documents?path=/open_router/doc`
- **응답 예시**:

```json
{
  "currentPath": "/open_router/doc",
  "folders": [],
  "files": [
    { "name": "01_apikey.md", "path": "/open_router/doc/01_apikey.md" },
    { "name": "02_aistudiokey.md", "path": "/open_router/doc/02_aistudiokey.md" }
  ]
}
```

- **경로 검증**: `path`가 등록된 두 서브 폴더 내에 있는지 확인하며, `..` 등 경로 traversal 시도는 차단한다.

### 4.3 GET /view?file=... — 마크다운 파일 HTML 렌더링 뷰

- **설명**: 쿼리 파라미터 `file`로 지정된 마크다운 파일을 읽어 `marked` 라이브러리로 HTML로 변환 후 뷰 페이지에 렌더링하여 보여준다.
- **요청 예시**: `GET /view?file=C:/work/openrouter/open_router/doc/01_apikey.md`
- **응답**: HTML (EJS 템플릿, 변환된 본문 삽입)
- **동작**:
  1. `file` 파라미터 존재 및 확장자 `.md` 확인
  2. 경로 traversal 방지 및 허용 디렉토리 내 파일인지 검증
  3. 파일 읽기 (UTF-8 인코딩)
  4. `marked.parse()`로 HTML 변환
  5. 뷰 템플릿에 주입하여 렌더링

### 4.4 GET /api/search?q=... — 문서 내용 full-text 검색

- **설명**: 쿼리 파라미터 `q`에 입력된 키워드로 두 대상 폴더 내 모든 마크다운 파일의 내용을 간단히 검색한다.
- **요청 예시**: `GET /api/search?q=API 키`
- **응답 예시**:

```json
{
  "query": "API 키",
  "results": [
    {
      "file": "01_apikey.md",
      "path": "C:/work/openrouter/open_router/doc/01_apikey.md",
      "snippet": "...API 키를 발급받아..."
    }
  ],
  "total": 1
}
```

- **구현 방식**: 대상 디렉토리 내 모든 `.md` 파일을 순회하며 파일 내용을 메모리에 읽고, 키워드 포함 여부를 확인한 후 매칭된 구간을 스니펫으로 추출한다. 대소문자 구분 없이 검색한다. 문서 수가 많을 경우 인덱스 기반 검색으로 확장 가능하다.

### 4.5 GET /health — 헬스체크

- **설명**: 서버가 정상적으로 동작 중인지 확인하는 헬스체크 엔드포인트다.
- **응답 예시**:

```json
{
  "status": "ok",
  "timestamp": "2026-11-21T14:32:38Z",
  "uptime": 123.456
}
```

- **용도**: 로드 밸런서, 모니터링 도구, 또는 수동 접속 테스트용.

## 5. 보안 고려 사항

### 5.1 경로 traversal 방지

사용자 입력(`path`, `file` 파라미터)에 포함된 `..`(상위 디렉토리 이동), 절대 경로 조작, 심볼릭 링크 등을 통해 서버 파일 시스템의 임의 경로에 접근하는 것을 차단한다.

- 입력 경로를 정규화(`path.normalize`)한 후, `..` 세그먼트가 포함되어 있는지 검사한다.
- 허용된 루트 디렉토리(`open_router/doc`, `study/01_skill_claude`) 하위에 있는지 `path.resolve` 및 `startsWith`로 확인한다.
- 허용되지 않은 경로 접근 시 HTTP 403 Forbidden 또는 400 Bad Request를 반환한다.

### 5.2 서브폴더만 접근 허용

웹 서버가 노출하는 파일은 두 대상 폴더 내 마크다운 파일로 한정한다. 시스템 파일, 환경 변수 파일, 소스 코드 등은 직접 접근할 수 없다. 정적 에셋(`public/`)만 별도로 제공하며, 그 외 디렉토리 목록 표출은 금지한다.

### 5.3 기타

- XSS 방지: `marked` 렌더링 시 sanitize 옵션 사용 또는 DOMPurify 연동 검토.
- 대용량 파일 읽기 제한: 메모리 과다 사용 방지를 위해 파일 크기 상한 설정.

## 6. 실행 방법

아래 PowerShell 명령어를 순차적으로 실행한다.

### 6.1 프로젝트 초기화 및 의존성 설치

```powershell
# 웹 서버 프로젝트 디렉토리로 이동
Set-Location -LiteralPath "C:\work\openrouter\web_server"

# npm 프로젝트 초기화
npm init -y

# Express 및 marked 설치
npm install express marked

# (선택) EJS 템플릿 엔진 설치
npm install ejs
```

### 6.2 서버 실행

```powershell
# 서버 시작
node src/server.js
```

정상 시작 시 콘솔에 다음과 같이 출력된다.

```
Server running at http://localhost:3000
```

### 6.3 접속

웹 브라우저에서 다음 URL로 접속한다.

- 대시보드: `http://localhost:3000/`
- 헬스체크: `http://localhost:3000/health`

### 6.4 종료

콘솔에서 `Ctrl + C`를 누르면 서버가 종료된다.

## 7. 포트

서버는 **3000번 포트**에서 실행된다. Docker는 설치되어 있지 않으므로 로컬 Node.js 프로세스로 직접 실행하며, 포트 충돌 시 `src/server.js`의 포트 설정을 변경하여 사용한다.

## 8. 향후 확장 계획

- 정적 사이트 생성기(SSG) 방식으로 마크다운을 미리 HTML로 빌드하여 배포
- 인증/인가 기능 추가 (특정 문서 접근 제한)
- 검색 엔진 대체 (Lunr.js 등 클라이언트 측 검색 도입)
- 다크 모드 지원 및 반응형 UI 개선