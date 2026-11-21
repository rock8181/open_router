# 21st.dev MCP — 분석 및 실습 가이드

OpenRouter 순위 5위 서비스. 12,000개 이상의 React 컴포넌트 카탈로그를 에이전트가 검색·생성·반복 생성할 수 있게 해주는 AI 컴포넌트 MCP 서버다.

---

## 1. 개요

| 항목 | 내용 |
|------|------|
| 서비스명 | 21st.dev MCP (구 Magic MCP) |
| 도메인 | 21st.dev/mcp |
| 순위 | OpenRouter 5위 |
| 태그 | MCP 서버 / 컴포넌트 에이전트 |
| 핵심 가치 | "React 컴포넌트 카탈로그를 에이전트 워크플로우에 연결한다." |
| 엔드포인트 | https://21st.dev/api/mcp (HTTP, JSON-RPC 2.0) |
| 인증 | 헤더 `x-api-key` (21st API 키, https://21st.dev/settings/api-keys 발급) |
| CLI | `npm i -g @21st-dev/cli`, `21st login`, `21st init --client claude --write` |
| 지원 클라이언트 | cursor, vscode, devin, claude, codex |
| 설정 파일 | Claude용 `.mcp.json` |
| 무료 도구 | `search`, `search_picker`, `search_logo`, `get_component`, `get_theme` |
| 유료(크레딧) 도구 | `generate`, `iterate_generation` |
| 카탈로그 | 12,000개 이상 React 컴포넌트 |
| 구버전명 | @21st-dev/magic (Magic MCP) |
| 계정 상태 확인 | `21st usage --json` |

---

## 2. 작동 원리

```
사용자 요청 (컴포넌트 검색/생성)
    ↓
MCP 클라이언트(Claude Code 등)가 JSON-RPC 2.0 요청을
https://21st.dev/api/mcp로 전송 (헤더: x-api-key)
    ↓
21st.dev MCP 서버가 React 컴포넌트 카탈로그에서 검색 또는 생성 수행
    ↓
결과(JSON: 컴포넌트 코드, 메타데이터, 미리보기 등)를 에이전트에 반환
    ↓
에이전트가 코드를 프로젝트에 적용 또는 추가 반복(iterate)
```

1. **에이전트가 요청** — "타일윈드 버튼 컴포넌트 검색" 또는 "로그인 폼 컴포넌트 생성"과 같은 자연어 요청.
2. **MCP 서버 처리** — JSON-RPC 2.0으로 컴포넌트 검색/생성/반복 생성 수행. 무료 도구는 크레딧 없이, `generate`/`iterate_generation`는 크레딧 차감.
3. **결과 반환** — 컴포넌트 소스 코드와 메타데이터가 에이전트에 전달됨.
4. **반복 생성(선택)** — `iterate_generation`로 생성된 컴포넌트를 개선 또는 변형.

`21st init --client claude --write`는 로컬 프로젝트 루트에 `.mcp.json`을 생성해 Claude Code가 MCP 서버를 자동으로 인식하도록 한다.

---

## 3. 주요 기능

| 기능 | 설명 | 과금 |
|------|------|------|
| `search` | 키워드/태그로 React 컴포넌트 카탈로그 검색 | 무료 |
| `search_picker` | 인터랙티브 컴포넌트 선택기 검색 | 무료 |
| `search_logo` | 로고/브랜드 컴포넌트 검색 | 무료 |
| `get_component` | 특정 컴포넌트 상세 코드 조회 | 무료 |
| `get_theme` | 테마/디자인 시스템 조회 | 무료 |
| `generate` | 자연어로 새 React 컴포넌트 생성 | 크레딧(유료) |
| `iterate_generation` | 기존 생성 컴포넌트 반복 개선 | 크레딧(유료) |
| 12,000개+ 컴포넌트 카탈로그 | 버튼, 폼, 모달, 내비게이션 등 UI 컴포넌트 모음 | — |
| 다중 클라이언트 지원 | Cursor, VS Code, Devin, Claude, Codex | — |
| 계정 상태 확인 | `21st usage --json`로 크레딧 잔여량/플랜 조회 | — |

---

## 4. MCP/검색 도구

| 도구 | 목적 | 과금 | 비고 |
|------|------|------|------|
| `search` | 컴포넌트 카탈로그 키워드 검색 | 무료 | 자연어 쿼리 지원 |
| `search_picker` | 컴포넌트 선택 UI 검색 | 무료 | 인터랙티브 선택 |
| `search_logo` | 로고/브랜드 마크 검색 | 무료 | 브랜드 자산 |
| `get_component` | 컴포넌트 상세 소스 코드 조회 | 무료 | 컴포넌트 ID 또는 이름 필요 |
| `get_theme` | 테마/디자인 시스템 조회 | 무료 | 스타일 토큰 |
| `generate` | 자연어 기반 React 컴포넌트 생성 | 크레딧 | 유료 도구 |
| `iterate_generation` | 생성 컴포넌트 반복 개선 | 크레딧 | 유료 도구 |

토큰/크레딧 효율: 무료 도구(`search`, `get_component` 등)로 원하는 컴포넌트를 먼저 찾은 뒤, 필요한 경우에만 `generate`/`iterate_generation`를 사용하여 크레딧 소모를 최소화한다.

---

## 5. 설치 및 실습 (이 폴더에서 바로 실행)

### 사전 확인
- Node.js 설치됨 (확인 필요: `node -v`)
- PowerShell 사용 (Windows)

### 5.1 21st CLI 설치

```powershell
# 21st.dev CLI 전역 설치
npm i -g @21st-dev/cli

# 설치 확인
21st --version
```

### 5.2 로그인

```powershell
# 21st.dev 계정 로그인 (브라우저 인증 페이지 열림)
21st login
```

### 5.3 Claude 클라이언트 초기화 (.mcp.json 생성)

```powershell
# 프로젝트 루트에서 실행 (현재 폴더: C:\work\openrouter\study\01_skill_claude)
21st init --client claude --write
```

위 명령은 현재 디렉토리에 `.mcp.json` 파일을 생성한다.

### 5.4 API 키 발급

브라우저에서 https://21st.dev/settings/api-keys 접속해 API 키를 발급받는다. 키는 `x-api-key` 헤더 값으로 사용한다.

### 5.5 .mcp.json에 인증 헤더 추가

생성된 `.mcp.json` 예시 (편집 필요):

```json
{
  "mcpServers": {
    "21st.dev": {
      "command": "npx",
      "args": [
        "-y",
        "@21st-dev/mcp-server"
      ],
      "env": {
        "X_API_KEY": "여기에_21st_API_키_입력"
      }
    }
  }
}
```

또는 HTTP 엔드포인트 직접 설정 형태:

```json
{
  "mcpServers": {
    "21st.dev": {
      "url": "https://21st.dev/api/mcp",
      "headers": {
        "x-api-key": "여기에_21st_API_키_입력"
      }
    }
  }
}
```

PowerShell로 헤더 추가 예시:

```powershell
# API 키 변수 설정 (실제 키로 교체)
$apiKey = "여기에_21st_API_키_입력"

# .mcp.json 읽기 및 헤더 추가/수정
$mcpPath = Join-Path -Path $PWD -ChildPath ".mcp.json"
$config = Get-Content -LiteralPath $mcpPath -Raw | ConvertFrom-Json

# 헤더 추가 (서버가 21st.dev인 경우)
if (-not $config.mcpServers."21st.dev".headers) {
  $config.mcpServers."21st.dev".headers = @{}
}
$config.mcpServers."21st.dev".headers["x-api-key"] = $apiKey

# 저장 (UTF-8, BOM 없음)
$config | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $mcpPath -Encoding utf8

# 확인
Get-Content -LiteralPath $mcpPath
```

### 5.6 검색 도구 테스트

Claude Code에서 새 세션을 시작하고 다음을 시도:

```
"21st.dev에서 로그인 폼 컴포넌트를 검색해줘"
"타일윈드 CSS 버튼 컴포넌트를 보여줘"
"검색 결과에서 get_component로 상세 코드를 가져와줘"
```

MCP 도구 호출 확인: `search` → `get_component` 순서로 자연스럽게 동작해야 한다.

### 5.7 계정 상태 확인 (크레딧 잔여량)

```powershell
# JSON 형식으로 계정/크레딧 상태 조회
21st usage --json
```

---

## 6. 팀 에이전트별 분석

### 6.1 제품팀 (Product)

**포지셔닝**: 에이전트가 React 컴포넌트를 제로에서 작성하지 않고 카탈로그에서 검색·재사용하게 함. UI 개발 속도와 디자인 일관성을 직접적으로 높임.

**타겟 사용자**:
- UI/UX 디자이너와 프론트엔드 개발자 (컴포넌트 재사용 필요)
- 디자인 시스템 구축 팀 (테마/브랜드 컴포넌트 표준화)
- 프로토타이핑이 필요한 제품 기획자

**차별 포인트**:
- 12,000개 이상 React 컴포넌트 카탈로그 (검색 즉시 사용 가능)
- 무료 검색 도구로 진입 장벽 낮음 (`search`, `get_component` 등)
- Claude/Cursor/VS Code 등 주요 에이전트와 MCP로 연동

### 6.2 개발팀 (Engineering)

**아키텍처 구성요소**:
1. **MCP 서버 엔드포인트**: `https://21st.dev/api/mcp` (HTTP, JSON-RPC 2.0)
2. **인증**: `x-api-key` 헤더 (21st.dev/settings/api-keys 발급)
3. **CLI 클라이언트**: `@21st-dev/cli` (`21st login`, `21st init`, `21st usage`)
4. **설정 파일**: 클라이언트별 설정 (Claude는 `.mcp.json`)
5. **도구 세트**: 무료 5종(`search`, `search_picker`, `search_logo`, `get_component`, `get_theme`) + 유료 2종(`generate`, `iterate_generation`)

**연동 포인트**:
- 에이전트: Claude Code, Cursor, VS Code, Devin, Codex
- MCP 전송: HTTP(JSON-RPC 2.0) 또는 stdio 기반 CLI 서버
- 인증 헤더: `x-api-key`

**실패 처리(fail-soft)**:
- API 키 누락/만료 → MCP 도구 호출 실패, 에이전트 세션은 유지됨(도구만不可用)
- 네트워크 장애 → `https://21st.dev/api/mcp` 도달 불가 시 오류 반환, 로컬 작업에 영향 없음
- 크레딧 소진 → `generate`/`iterate_generation`만 제한, 무료 검색 도구는 계속 사용 가능

### 6.3 마케팅팀 (Marketing)

**메시징 포인트**:
- "React 컴포넌트 카탈로그를 에이전트 워크플로우에 연결" — 명확한 가치 제안
- OpenRouter 순위 5위 랭크 노출 (인기 MCP 서버 이미지)
- 무료 검색 도구로 체험 장벽 낮춤 → 유료 생성 도구로 전환 유도

**채널 전략**:
- OpenRouter MCP 순위 5위 노출 활용
- 프론트엔드/React 개발자 커뮤니티 타겟팅
- 에이전트 호스트(Claude Code, Cursor, VS Code) 사용자 공략

**주의사항**: "Magic MCP"에서 "21st.dev MCP"로 재브랜딩됨. 구버전(@21st-dev/magic) 문서와 혼동하지 않도록 버전 표기 명확화.

### 6.4 운영팀 (Operations)

**인프라**:
- MCP 서버는 21st.dev 측이 호스팅 (`https://21st.dev/api/mcp`), 고객 서버 운영 불필요
- 클라이언트 측은 `@21st-dev/cli`만 설치하면 됨

**모니터링**:
- 계정 상태: `21st usage --json` (크레딧 잔여량, 플랜 정보)
- MCP 서버 가용성: `https://21st.dev/api/mcp` 엔드포인트 연결 테스트
- 로그: 에이전트 측 MCP 클라이언트 로그

**백업/마이그레이션**:
- 설정 파일: `.mcp.json` (프로젝트 루트, 버전 관리에 포함 여부 결정 필요 — API 키 포함 시 제외)
- API 키: 21st.dev/settings/api-keys에서 재발급 가능

### 6.5 데이터팀 (Data)

**데이터 모델**:
- 컴포넌트: ID, 이름, 카테고리, 태그, 미리보기, 소스 코드
- 테마: 디자인 시스템 토큰, 스타일 변수
- 검색 로그: 쿼리, 조회 컴포넌트, 타임스탬프
- 생성 이력: `generate`/`iterate_generation` 요청/결과 (유료 사용 시)

**검색 인덱스**:
- 키워드/태그 기반 컴포넌트 검색 (`search`)
- 인터랙티브 선택기 (`search_picker`)
- 로고/브랜드 검색 (`search_logo`)

**분석 가능 항목**:
- 팀별 컴포넌트 사용 패턴 (어떤 카테고리 자주 검색)
- 크레딧 소비 추이 (`generate`/`iterate_generation` 사용량)
- 컴포넌트 재사용률과 신규 생성 비율

### 6.6 파트너십팀 (Partnerships)

**연동 가능 파트너**:
- OpenRouter (MCP 순위 5위, 기존 OpenRouter API 키 컨텍스트와 연계 가능)
- Anthropic (Claude Code, `.mcp.json` 설정 경유)
- Cursor, VS Code, Devin, Codex (에이전트 호스트)

**제휴 기회**:
- OpenRouter MCP 카탈로그에 21st.dev MCP 노출 (순위 5위 유지/상승)
- 에이전트 호스트 플러그인 마켓플레이스 연동 (Claude Code, Cursor 등)
- 디자인 시스템 제공자와의 테마 연동 (`get_theme`)

---

## 7. 요금 및 라이선스

| 항목 | 내용 |
|------|------|
| 무료 도구 | `search`, `search_picker`, `search_logo`, `get_component`, `get_theme` (크레딧 차감 없음) |
| 유료 도구 | `generate`, `iterate_generation` (크레딧 차감) |
| 인증 | 21st API 키 (https://21st.dev/settings/api-keys) |
| 계정 상태 확인 | `21st usage --json` |
| 라이선스 | 컴포넌트 사용 약관은 21st.dev 약관 참조 (상업적 사용 가능 여부 확인 필요) |

> **참고**: OpenRouter API 키(`sk-or-...`)와 21st API 키는 별도 시스템이다. 21st.dev MCP는 21st 자체 API 키(`x-api-key`)를 사용하며, OpenRouter 키로는 인증되지 않는다. OpenRouter 컨텍스트는 순위/랭킹 참조 용도로만 활용.

---

## 8. 실습 체크리스트 (이 폴더에서)

- [ ] `npm i -g @21st-dev/cli` 실행 및 `21st --version` 확인
- [ ] `21st login`로 계정 로그인 완료
- [ ] `21st init --client claude --write`로 `.mcp.json` 생성 확인
- [ ] https://21st.dev/settings/api-keys에서 API 키 발급
- [ ] `.mcp.json`에 `x-api-key` 헤더 추가 (PowerShell 스크립트 또는 수동 편집)
- [ ] `21st usage --json`로 계정/크레딧 상태 조회
- [ ] Claude Code 새 세션에서 `search` 도구 테스트 (컴포넌트 검색)
- [ ] `get_component`로 선택 컴포넌트 상세 코드 조회 테스트
- [ ] (선택) `generate`/`iterate_generation` 유료 도구 테스트 (크레딧 충분 시)
- [ ] `.mcp.json`에 API 키 포함 시 `.gitignore`에 추가 여부 결정

---

## 9. 위험 및 주의사항

1. **API 키 보안**: `.mcp.json`에 `x-api-key`를 직접 저장할 경우 파일이 깃 저장소에 커밋되지 않도록 `.gitignore`에 추가. 환경 변수 사용 권장.
2. **크레딧 과금**: `generate`, `iterate_generation`는 크레딧을 소모한다. 무료 도구(`search`, `get_component` 등)로 먼저 검색한 후 필요한 경우에만 유료 도구 사용.
3. **OpenRouter 키와 혼동 금지**: 21st.dev MCP는 21st 자체 API 키(`x-api-key`)를 사용하며, OpenRouter API 키(`sk-or-...`)로는 인증되지 않는다.
4. **컴포넌트 라이선스**: 카탈로그 컴포넌트의 상업적 사용 가능 여부, 저작권 표기 의무는 21st.dev 약관에서 개별 확인.
5. **서비스 의존성**: MCP 서버(`https://21st.dev/api/mcp`)는 21st.dev 측이 호스팅. 서비스 장애 시 도구 호출 불가 (에이전트 세션 자체는 유지).
6. **구버전 혼동**: Formerly Magic MCP (@21st-dev/magic). 구 문서/패키지와 현재 @21st-dev/cli, @21st-dev/mcp-server가 다를 수 있으므로 최신 문서 참조.

---

## 10. 참고 링크

- 공식 사이트: https://21st.dev/
- MCP 소개: https://21st.dev/mcp
- API 키 발급: https://21st.dev/settings/api-keys
- 계정 상태 확인: `21st usage --json` (CLI)
- OpenRouter 순위: https://openrouter.ai/
- OpenRouter API 키 참고 (별도 시스템): https://openrouter.ai/keys
- CLI 패키지: https://www.npmjs.com/package/@21st-dev/cli
- GitHub: https://github.com/21st-dev
