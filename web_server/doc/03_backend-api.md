# 백엔드 API 설계 문서

## 1. 개요

본 문서는 오픈 라우터 문서 서버의 백엔드 API 설계를 정의한다.  
클라이언트는 HTTP API를 통해 문서 트리 탐색, 마크다운 파일 조회, 문서 내용 검색, 서버 상태 확인을 수행할 수 있다.  
모든 응답은 JSON 형태를 따르며, 보안을 위해 허용된 루트 디렉토리 외 경로 접근을 차단한다.

## 2. 서버

| 항목 | 내용 |
|------|------|
| 런타임 | Node.js |
| 웹 프레임워크 | Express (또는 Node.js 내장 http 모듈) |
| 리슨 포트 | 3000 |
| 호스트 | localhost (127.0.0.1) |
| 실행 스크립트 | `node server.js` |
| 데이터 포맷 | JSON |

서버는 정적 파일 서빙 없이 순수 API 서버로 동작하며, 모든 경로 접근은 화이트리스트에 등록된 루트 디렉토리로만 제한한다.

## 3. API 엔드포인트

### 3.1 GET /api/documents

허용된 루트 디렉토리 하위의 문서 트리 또는 파일 목록을 조회한다.

#### 요청 파라미터

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `root` | string | 예 | 조회할 루트 키 (`open_router` 또는 `study`) |
| `path` | string | 아니오 | 루트 기준 하위 경로 (기본값: 루트 자체) |
| `recursive` | string | 아니오 | `true` 시 하위 디렉토리를 재귀 탐색하여 전체 트리 반환 |

#### 응답 (Document 트리)

```json
{
  "root": "open_router",
  "path": "",
  "document": {
    "path": "open_router/doc",
    "name": "doc",
    "type": "directory",
    "size": null,
    "modifiedAt": "2026-11-20T10:00:00Z",
    "children": [
      {
        "path": "open_router/doc/01_intro.md",
        "name": "01_intro.md",
        "type": "file",
        "size": 2048,
        "modifiedAt": "2026-11-19T14:30:00Z",
        "children": null
      }
    ]
  }
}
```

`recursive=false` (또는 생략) 시 `children`에는 즉시 하위 항목만 포함된다.  
`recursive=true` 시 전체 하위 트리를 재귀적으로 포함한다.

### 3.2 GET /api/view

절대 경로로 지정된 마크다운 파일의 내용을 반환한다.

#### 요청 파라미터

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `file` | string | 예 | 조회할 파일의 절대 경로 |

#### 응답

```json
{
  "content": "# 문서 제목\n\n본문 내용...",
  "html": "<h1>문서 제목</h1>\n\n<p>본문 내용...</p>",
  "meta": {
    "path": "C:\\work\\openrouter\\doc\\01_intro.md",
    "name": "01_intro.md",
    "size": 2048,
    "modifiedAt": "2026-11-19T14:30:00Z",
    "root": "open_router"
  }
}
```

- `content`: 원본 마크다운 텍스트
- `html`: 마크다운을 HTML로 변환한 내용 (클라이언트에서 렌더링 용도로 사용)
- `meta`: 파일 메타데이터

지원하지 않는 파일 확장자 또는 허용되지 않은 경로인 경우 에러를 반환한다.

### 3.3 GET /api/search

문서 내용에서 키워드를 검색한다. 제목과 내용에 대한 간단한 문자열 매칭을 수행한다.

#### 요청 파라미터

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `q` | string | 예 | 검색 키워드 |
| `root` | string | 아니오 | 검색 범위를 제한할 루트 키 (생략 시 모든 허용 루트) |

#### 응답

```json
{
  "query": "claude",
  "root": "open_router",
  "results": [
    {
      "file": "open_router/doc/01_intro.md",
      "title": "소개",
      "snippet": "이 문서는 Claude Code를 활용한 ...",
      "score": 0.95
    }
  ],
  "total": 1
}
```

- `file`: 검색된 파일의 상대 경로
- `title`: 문서 내 첫 번째 헤딩 또는 파일명
- `snippet`: 검색어 주변 문맥을 포함한 짧은 요약
- `score`: 매칭 점수 (높을수록 관련성 높음)

대소문자 구분 없이 부분 일치를 수행하며, 결과는 점수 내림차순으로 정렬된다.

### 3.4 GET /api/health

서버 상태를 확인한다.

#### 응답

```json
{
  "status": "ok",
  "timestamp": "2026-11-21T14:32:45Z",
  "uptime": 3600.5,
  "port": 3000
}
```

서버가 정상 동작 중이면 HTTP 200과 함께 `status: "ok"`를 반환한다.

## 4. 데이터 모델

### 4.1 Document

단일 파일 또는 디렉토리를 나타낸다.

| 필드 | 타입 | 설명 |
|------|------|------|
| `path` | string | 파일 또는 디렉토리의 절대 경로 |
| `name` | string | 파일명 또는 디렉토리명 |
| `type` | string | `"file"` 또는 `"directory"` |
| `size` | number\|null | 바이트 단위 크기 (디렉토리는 null) |
| `modifiedAt` | string\|null | 최종 수정 시각 (ISO 8601) |
| `children` | Document[]\|null | 하위 항목 목록 (파일은 null) |

### 4.2 SearchResult

검색 결과 한 건을 나타낸다.

| 필드 | 타입 | 설명 |
|------|------|------|
| `file` | string | 검색된 파일의 상대 경로 |
| `title` | string | 문서 제목 또는 파일명 |
| `snippet` | string | 검색어 주변 문맥 요약 |
| `score` | number | 관련성 점수 |

## 5. 보안

### 5.1 경로 traversal 방지

사용자 입력 경로에 대해 다음과 같은 검증을 수행한다.

1. `path.normalize()`로 경로를 정규화한다.
2. `..` 세그먼트가 포함된 경로를 차단한다.
3. 심볼릭 링크 따르기를 제한하여 루트 외 파일 접근을 막는다.
4. 절대 경로 입력 시 허용된 루트 디렉토리 하위에 속하는지 검증한다.

차단 예시:
- `../../etc/passwd`
- `..\\..\\windows\\win.ini`
- 정규화 후 루트 디렉토리 범위를 벗어나는 모든 경로

### 5.2 허용된 루트 디렉토리

접근이 허용된 루트 디렉토리 목록은 다음과 같다.

| 루트 키 | 실제 경로 | 설명 |
|---------|-----------|------|
| `open_router` | `C:\work\openrouter\doc` | 프로젝트 문서 루트 |
| `study` | `C:\work\openrouter\study\01_skill_claude` | 스터디 문서 루트 |

등록되지 않은 루트 키를 요청하면 HTTP 403을 반환한다.

## 6. 에러 처리

모든 에러 응답은 JSON 형태를 따르며, 적절한 HTTP 상태 코드를 사용한다.

### 6.1 404 Not Found

요청한 파일이 존재하지 않거나, 지원하지 않는 리소스인 경우.

```json
{
  "error": "not_found",
  "message": "파일을 찾을 수 없습니다.",
  "path": "C:\\work\\openrouter\\doc\\missing.md"
}
```

### 6.2 403 Forbidden

경로 traversal 시도, 허용되지 않은 루트 접근 등 보안 위반인 경우.

```json
{
  "error": "forbidden",
  "message": "접근이 금지된 경로입니다.",
  "path": "C:\\work\\openrouter\\..\\secret"
}
```

### 6.3 500 Internal Server Error

서버 내부 오류 (파일 읽기 실패, 디렉토리 목록 조회 실패 등) 발생 시.

```json
{
  "error": "internal_server_error",
  "message": "서버 오류가 발생했습니다.",
  "detail": "EACCES: permission denied, open '...'"
}
```

### 6.4 공통 에러 형식

모든 에러는 다음 필드를 포함한다.

| 필드 | 타입 | 설명 |
|------|------|------|
| `error` | string | 에러 코드 (`not_found`, `forbidden`, `internal_server_error`) |
| `message` | string | 사람이 읽을 수 있는 에러 메시지 |
| `path` | string\|optional | 관련된 파일 경로 (해당 시) |
| `detail` | string\|optional | 상세 오류 정보 (개발용) |

## 7. 실행 예시

### 7.1 서버 실행

PowerShell에서 서버를 시작한다.

```powershell
# 프로젝트 디렉토리로 이동
cd C:\work\openrouter\web_server

# 서버 실행
node server.js
```

서버 시작 시 콘솔에 다음과 같이 출력된다.

```
Server running at http://localhost:3000
```

### 7.2 curl로 API 테스트

PowerShell의 `curl` (또는 `Invoke-RestMethod`)로 각 엔드포인트를 테스트할 수 있다.

#### 문서 트리 조회 (재귀)

```powershell
curl http://localhost:3000/api/documents?root=open_router&recursive=true
```

#### 특정 디렉토리 목록 조회

```powershell
curl "http://localhost:3000/api/documents?root=study&path=01_skill_claude"
```

#### 파일 내용 조회

```powershell
curl "http://localhost:3000/api/view?file=C:\work\openrouter\doc\01_intro.md"
```

#### 문서 검색

```powershell
curl "http://localhost:3000/api/search?q=claude&root=open_router"
```

#### 서버 상태 확인

```powershell
curl http://localhost:3000/api/health
```

#### Invoke-RestMethod 예시 (PowerShell 네이티브)

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/documents?root=open_router&recursive=true" | ConvertTo-Json -Depth 10
```

## 8. 부가 사항

- 모든 경로 입력은 URL 인코딩되어 전달되며, 서버 측에서 디코딩 후 검증한다.
- 마크다운 → HTML 변환은 서버 측에서 수행하며, 변환 실패 시 원본 텍스트만 반환할 수 있다.
- 대용량 파일은 메모리 부담을 고려하여 스트리밍 또는 크기 제한을 두는 것이 권장된다.
- 향후 인증/인가 미들웨어를 추가하여 사용자별 접근 제어를 확장할 수 있다.