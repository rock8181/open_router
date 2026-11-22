# OpenRouter 문서 뷰어 API 문서

OpenRouter 학습 문서 뷰어의 백엔드 API 엔드포인트 명세입니다. 모든 응답은 JSON 형태이며, base URL은 `http://localhost:3000`입니다.

## base URL

```
http://localhost:3000
```

## 인증

현재 인증/인가 미들웨어는 없습니다. 모든 엔드포인트는 공개되어 있으며, 허용된 루트 디렉토리(`open_router`, `study`) 하위의 경로만 접근 가능합니다.

## 엔드포인트 목록

| 메서드 | 엔드포인트 | 설명 |
|--------|------------|------|
| GET | `/api/health` | 서버 상태 확인 |
| GET | `/api/documents` | 문서 트리 / 폴더 내용 조회 |
| GET | `/api/view` | 마크다운 파일 내용 조회 |
| GET | `/api/search` | 문서 내용 키워드 검색 |

---

## 1. GET /api/health

서버가 정상 동작 중인지 확인합니다.

### 요청

```
GET /api/health
```

### 응답 예시 (200 OK)

```json
{
  "status": "ok",
  "timestamp": "2026-11-22T00:45:18.000Z"
}
```

### 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| `status` | string | 서버 상태 (`ok`) |
| `timestamp` | string | 현재 시각 (ISO 8601) |

---

## 2. GET /api/documents

허용된 루트 디렉토리 하위의 폴더 내용 또는 파일 목록을 조회합니다. 디렉토리와 파일이 구분되어 반환되며, 디렉토리가 먼저 정렬됩니다.

### 요청

```
GET /api/documents?root={root}&dir={dir}
```

#### 쿼리 파라미터

| 파라미터 | 타입 | 필수 | 설명 | 예 |
|----------|------|------|------|----|
| `root` | string | 예 | 조회할 루트 키 | `open_router`, `study` |
| `dir` | string | 아니오 | 루트 기준 하위 디렉토리 상대 경로 (기본값: 루트 자체) | `subfolder`, `` |

### 응답 예시 (200 OK)

```json
{
  "root": "open_router",
  "dir": "",
  "items": [
    {
      "name": "doc",
      "type": "directory",
      "path": "doc",
      "size": 0,
      "modifiedAt": "2026-11-20T10:00:00Z",
      "extension": ""
    },
    {
      "name": "01_intro.md",
      "type": "file",
      "path": "01_intro.md",
      "size": 2048,
      "modifiedAt": "2026-11-19T14:30:00Z",
      "extension": ".md"
    }
  ]
}
```

#### 필드 (items 배열 각 항목)

| 필드 | 타입 | 설명 |
|------|------|------|
| `name` | string | 파일명 또는 디렉토리명 |
| `type` | string | `"directory"` 또는 `"file"` |
| `path` | string | 루트 기준 상대 경로 (역슬래시는 슬래시로 변환) |
| `size` | number | 바이트 단위 크기 (디렉토리는 0) |
| `modifiedAt` | string | 최종 수정 시각 (ISO 8601) |
| `extension` | string | 파일 확장자 (디렉토리는 빈 문자열) |

### 에러 응답

| 상태 코드 | 원인 | 예시 |
|-----------|------|------|
| 400 | `root` 파라미터 누락 또는 잘못된 루트 키 | `{"error": "Invalid root"}` |
| 403 | 접근 금지 경로 (루트 밖 경로 시도) | `{"error": "Access denied"}` |
| 404 | 디렉토리가 존재하지 않음 | `{"error": "Directory not found"}` |

### curl 예시 (PowerShell)

```powershell
# 루트 문서 목록 조회
curl "http://localhost:3000/api/documents?root=open_router"

# 하위 디렉토리 조회
curl "http://localhost:3000/api/documents?root=study&dir=01_skill_claude"
```

---

## 3. GET /api/view

지정한 마크다운 파일의 원본 내용과 HTML 변환 내용을 반환합니다. 지원되는 확장자는 `.md`, `.markdown`입니다.

### 요청

```
GET /api/view?root={root}&file={file}
```

#### 쿼리 파라미터

| 파라미터 | 타입 | 필수 | 설명 | 예 |
|----------|------|------|------|----|
| `root` | string | 예 | 루트 키 | `open_router`, `study` |
| `file` | string | 예 | 조회할 파일의 상대 경로 | `doc/01_intro.md` |

### 응답 예시 (200 OK)

```json
{
  "path": "doc/01_intro.md",
  "name": "01_intro.md",
  "content": "# 소개\n\n이 문서는 OpenRouter 학습 자료를 소개합니다.\n\n## 주요 내용\n- 설치 방법\n- 사용법\n- 예제",
  "html": "<h1>소개</h1>\n<p>이 문서는 OpenRouter 학습 자료를 소개합니다.</p>\n<h2>주요 내용</h2>\n<ul>\n<li>설치 방법</li>\n<li>사용법</li>\n<li>예제</li>\n</ul>",
  "size": 312,
  "modifiedAt": "2026-11-19T14:30:00Z"
}
```

#### 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| `path` | string | 루트 기준 상대 경로 |
| `name` | string | 파일명 |
| `content` | string | 원본 마크다운 텍스트 |
| `html` | string | 서버 측에서 marked로 변환한 HTML |
| `size` | number | UTF-8 바이트 크기 |
| `modifiedAt` | string | 최종 수정 시각 (ISO 8601) |

### 에러 응답

| 상태 코드 | 원인 | 예시 |
|-----------|------|------|
| 400 | 파라미터 누락 | `{"error": "Invalid parameters"}` |
| 404 | 파일이 없거나 디렉토리인 경우 | `{"error": "File not found"}` |

### curl 예시 (PowerShell)

```powershell
curl "http://localhost:3000/api/view?root=open_router&file=doc/01_intro.md"
```

---

## 4. GET /api/search

문서 제목과 내용에서 키워드로 검색합니다. 대소문자 구분 없는 부분 일치를 수행하며, 결과는 관련성 점수 내림차순으로 정렬되고 최대 20건까지 반환됩니다.

### 요청

```
GET /api/search?q={q}&root={root}
```

#### 쿼리 파라미터

| 파라미터 | 타입 | 필수 | 설명 | 예 |
|----------|------|------|------|----|
| `q` | string | 예 | 검색 키워드 | `claude` |
| `root` | string | 아니오 | 검색 범위를 제한할 루트 키 (생략 시 모든 루트) | `open_router` |

### 응답 예시 (200 OK)

```json
{
  "query": "claude",
  "results": [
    {
      "file": "open_router/doc/01_intro.md",
      "name": "01_intro.md",
      "score": 15,
      "snippet": "이 문서는 Claude Code를 활용한 학습 가이드입니다...",
      "root": "open_router"
    },
    {
      "file": "study/01_skill_claude/notes.md",
      "name": "notes.md",
      "score": 10,
      "snippet": "Claude 프롬프트 엔지니어링 팁...",
      "root": "study"
    }
  ]
}
```

#### 필드 (results 배열 각 항목)

| 필드 | 타입 | 설명 |
|------|------|------|
| `file` | string | 루트 기준 상대 경로 |
| `name` | string | 파일명 |
| `score` | number | 관련성 점수 (높을수록 관련성 높음) |
| `snippet` | string | 검색어 주변 문맥 요약 |
| `root` | string | 속한 루트 키 |

### 에러 응답

| 상태 코드 | 원인 | 예시 |
|-----------|------|------|
| 400 | `q` 파라미터 누락 | `{"error": "Query required"}` |

### curl 예시 (PowerShell)

```powershell
# 모든 루트에서 검색
curl "http://localhost:3000/api/search?q=claude"

# 특정 루트에서만 검색
curl "http://localhost:3000/api/search?q=claude&root=open_router"
```

---

## 5. 보안

### 경로 traversal 방지

사용자 입력 경로는 `path.resolve`로 정규화된 후, 허용된 루트 디렉토리 하위에 속하는지 검증됩니다. `..` 세그먼트나 심볼릭 링크를 통한 루트 밖 파일 접근은 차단됩니다.

차단 예시:
- `../../etc/passwd`
- `..\..\windows\win.ini`

### 허용된 루트 디렉토리

| 루트 키 | 실제 경로 | 설명 |
|---------|-----------|------|
| `open_router` | `C:\work\openrouter\open_router` | OpenRouter 문서 루트 |
| `study` | `C:\work\openrouter\study` | 학습 문서 루트 |

등록되지 않은 루트 키를 요청하면 HTTP 400을 반환합니다.

---

## 6. 공통 에러 형식

모든 에러는 JSON 형태로 반환됩니다.

```json
{
  "error": "에러 코드 문자열"
}
```

| 상태 코드 | 에러 코드 | 의미 |
|-----------|-----------|------|
| 400 | `Invalid root` / `Invalid parameters` / `Query required` | 잘못된 요청 파라미터 |
| 403 | `Access denied` | 접근 금지 |
| 404 | `Directory not found` / `File not found` | 리소스 없음 |
