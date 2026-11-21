# Claude-Mem (cmem.ai) — 분석 및 실습 가이드

OpenRouter 순위 1위 서비스. Claude 에이전트에게 세션 간 지속적 기억(long-term memory)을 부여하는 AI 메모리 계층이다.

---

## 1. 개요

| 항목 | 내용 |
|------|------|
| 서비스명 | Claude-Mem (CMEM) |
| 도메인 | cmem.ai |
| 순위 | OpenRouter 1위 |
| 태그 | 0일 (최근 트렌드 / 신규 등록) |
| 핵심 가치 | "Every new session, your agent starts from zero. Claude-Mem remembers for it." |
| 지원 에이전트 | Claude Code, Codex, Cursor, OpenCode + 11종 이상 (Copilot CLI, Goose, Roo Code, Warp, Zed 등은 검색 전용) |
| 메모리 저장소 | 로컬 SQLite + 선택적 Chroma 벡터 인덱스 (`~/.claude-mem`) |
| 클라우드 동기화 | CMEM Pro (선택, 유료) |
| 가격 | 로컬 엔진 무료 / Cloud Sync 월 $12 (30일 체험) / 호스팅 토큰 Pro $30 / Heavy $70 / Max $100 |

---

## 2. 작동 원리

```
Session Start → 이전 10개 세션의 중요 항목 인덱스 주입
    ↓
User Prompts → 세션 생성, 사용자 프롬프트 저장
    ↓
Tool Executions → 도구 호출(Read, Write 등) 관찰 기록
    ↓
Worker Process → Claude Agent SDK로 학습 내용 추출 (관찰 노트 작성)
    ↓
Session Ends → 요약 생성, 다음 세션을 위해 준비
```

1. **에이전트가 작업** — 도구 호출(파일 읽기/쓰기, 실행 등)을 로컬 워커에 전달.
2. **옵저버가 기록** — 두 번째 에이전트가 활동을 짧은 관찰(observation)으로 변환, 세션 종료 시 요약 생성.
3. **다음 세션이 재사용** — 새 세션 시작 시 프로젝트에 필요한 관찰 인덱스를 주입, 필요 시 상세 내용만 조회.

메모리 주입은 해당 프로젝트 두 번째 세션부터 시작. 전체 저장소 사전 학습은 `/learn-codebase` 명령(약 5분, 선택).

---

## 3. 주요 기능

| 기능 | 설명 |
|------|------|
| 영구 메모리 | 세션 간 컨텍스트 유지 |
| 폴더 컨텍스트 파일 | 프로젝트 폴더에 자동 생성된 `CLAUDE.md` (활동 타임라인) |
| 다국어 모드 | 영어 + 29개 언어(스페인어, 중국어, 프랑스어, 일본어 등) |
| 모드 시스템 | Code, Email Investigation, Chill 등 워크플로우 전환 |
| MCP 검색 도구 | 자연어로 프로젝트 히스토리 쿼리 |
| 지식 에이전트 | 관찰 이력에서 질의 가능한 "브레인" 구축 |
| 웹 뷰어 UI | 로컬 워커가 제공하는 실시간 메모리 스트림 시각화 |
| 개인정보 보호 | 태그로 수동 차단 또는 자동 편집(시크릿 정규식 탐지) |
| FTS5 전체 텍스트 검색 | 관찰 전체 텍스트 빠른 검색 |
| 인용 | 과거 관찰에 ID로 참조 |
| 자동 동작 | 수동 개입 불필요 |

---

## 4. MCP 검색 도구 (3단계 토큰 효율 워크플로우)

| 단계 | 도구 | 목적 | 토큰/결과 |
|------|------|------|-----------|
| 1 | `search` | 메모리 인덱스 검색, 타입/날짜/프로젝트 필터 | ~50~100 토큰/결과 |
| 2 | `timeline` | 특정 관찰 또는 쿼리 주변 연대표적 컨텍스트 | — |
| 3 | `get_observations` | 필터링된 ID의 전체 세부 정보만 조회 | ~500~1,000 토큰/결과 |

인덱스 행은 전체 레코드의 약 1/10 크기. 필터링으로 조회할 레코드 수를 결정하므로 비용 절약.

추가 도구: `smart_search`, `smart_outline`, `smart_unfold`(코드 내비게이션), `save_memory`(수동 메모 저장).

---

## 5. 설치 및 실습 (이 폴더에서 바로 실행)

### 사전 확인
- Node.js v24.20.0 설치됨 (확인 완료)
- Docker 미설치 → 로컬 설치(npx) 방식 사용

### 5.1 claude-mem 설치

```powershell
# 대화형 설치 (권장)
npx claude-mem install
```

설치 흐름:
1. 터미널에서 시작. 작업 이메일 입력(선택, 제품 업데이트 수신) 또는 Enter로 건너뛰기.
2. Bun과 uv 확인, 플러그인 파일 복사, 의존성 설치, `claude-mem` 후크 런처를 PATH에 추가.
3. 에이전트/통합/스킬 선택. GUI에서 지원 에이전트 목록 제공, 감지된 것들은 사전 선택.
4. 메모리 사용 방식 선택:
   - **Local memory**: 기존 Anthropic 플랜 사용, cmem.ai 로그인 불필요 (무료)
   - **On The Go**: CMEM Pro 로그인 및 결제 (브라우저, 30일 무료 체험 후 월 $12)
5. 마무리. 연결 안내 및 선택적 히스토리 가져오기 후 완료.

### 5.2 수동 설정 (설정 파일 직접 편집)

```powershell
# 설정 디렉토리 생성
mkdir -Force ~/.claude-mem -ErrorAction SilentlyContinue

# OpenRouter 제공자 설정 예시 (기존 OpenRouter 키 활용)
@'
{
  "CLAUDE_MEM_PROVIDER": "openrouter",
  "CLAUDE_MEM_OPENROUTER_API_KEY": "sk-or-v1-[REDACTED]",
  "CLAUDE_MEM_OPENROUTER_MODEL": "cohere/north-mini-code:free"
}
'@ | Set-Content -LiteralPath "$HOME\.claude-mem\settings.json" -Encoding utf8

# 권한 제한 (보안)
icacls "$HOME\.claude-mem\settings.json" /grant "$env:USERNAME:(F)" /inheritance:r
```

> **중요**: 개인 OpenRouter 키(`sk-or-...`)는 절대 `https://cmem.ai/api/inference`에 전송하지 말 것. OpenRouter 제공자 사용 시 베이스 URL은 비워두거나 `https://openrouter.ai/api/v1`로 설정.

### 5.3 워커 시작 및 확인

```powershell
# 워커 시작
npx claude-mem restart

# 헬스체크 (포트은 ~/.claude-mem\.worker.port 또는 CLAUDE_MEM_WORKER_PORT 참조)
$port = Get-Content "$HOME\.claude-mem\.worker.port" -ErrorAction SilentlyContinue
if ($port) { curl -s "http://127.0.0.1:$port/api/health" }
```

헬스 응답 예시: 제공자 `openrouter`, 동기화 `configured: true` 등.

### 5.4 에이전트 연동

#### Claude Code
```powershell
# Claude Code에서 후크 자동 등록됨 (설치 시)
claude  # Claude Code 시작
```

세션 시작 시 이전 세션의 메모리가 자동 주입됨.

#### Cursor
```powershell
npx claude-mem install  # 설치 시 Cursor 선택
# Cursor 재시작 후 후크 로드
```

#### 웹/데스크톱 Claude (커스텀 커넥터)
1. Claude → Customize → Connectors → + Add → Add custom connector
2. 이름: `Claude Mem connector`, URL: `https://cmem.ai/api/mcp`
3. Sign in with cmem.ai 계정 (OAuth, 키/토큰 입력 불필요)
4. 채팅에서 커넥터 켜고 사용: "Search my Claude Mem memory for ..."

#### 플러그인 (자동 메모리, 유료 Claude 플랜 필요)
CMEM Connect에서 Claude 선택 → 플러그인 다운로드 (`claude-mem-cowork.zip`) → Claude에서 Customize → Plugins → Add → Upload plugin.

---

## 6. 팀 에이전트별 분석

### 6.1 제품팀 (Product)

**포지셔닝**: "에이전트의 망각" 문제 해결. Claude Code 등 코딩 에이전트는 새 세션마다 파일 재읽기, 질문 반복, 이미 고친 실수 반복. Claude-Mem은 이를 방지해 개발자 생산성을 직접적으로 높임.

**타겟 사용자**:
- 장기 프로젝트 개발자 (세션 간 맥락 유지 필요)
- 연구/분석 작업자 (이전 발견 사항 재사용)
- 다중 에이전트 협업 팀 (에이전트 간 메모리 전달)

**차별 포인트**:
- 로컬 우선(privacy-first): 기본 메모리는 로컬 SQLite, 클라우드 동기화는 선택
- 에이전트 불문(agnostic): Claude Code, Cursor, Codex, OpenCode 등 다수 지원
- 3단계 토큰 효율 검색: 인덱스 → 연대표 → 상세 조회로 불필요한 토큰 소모 최소화

### 6.2 개발팀 (Engineering)

**아키텍처 구성요소**:
1. **5개 라이프사이클 후크**: SessionStart, UserPromptSubmit, PostToolUse, Summary(Stop), SessionEnd
2. **워커 서비스**: Express HTTP API, Bun 관리, 사용자별 포트(`37700 + (uid % 100)`)
3. **SQLite DB**: 세션, 관찰, 요약 저장 + FTS5 전체 텍스트 검색
4. **Chroma 벡터 인덱스**: 선택적 의미 검색
5. **MCP / 스킬 검색 도구**: 자연어 쿼리로 과거 컨텍스트 조회
6. **웹 뷰어 UI**: SSE + 무한 스크롤 실시간 메모리 시각화

**설치 의존성**: Node.js, Bun, uv. Windows에서는 npx 기반 설치가 가장 쉬움(Docker 불필요).

**연동 포인트**:
- 에이전트 후크: 도구 호출 가로채서 관찰 기록
- MCP 서버: `https://cmem.ai/api/mcp` (클라우드 커넥터)
- 로컬 워커 API: `http://127.0.0.1:<port>/api/*`

**실패 처리(fail-soft)**:
- API 키 없음 → 모든 후크 silent no-op, 세션 절대 깨지지 않음
- cmem.ai 불통 → capture 이벤트 `~/.claude-mem/cowork-spool.jsonl`에 스풀, 후크 재발화 시 플러시
- ingest 엔드포인트 미배포 → 컨텍스트 주입은 라이브 `/api/mcp memory_search`로 폴백, 404는 드롭

### 6.3 마케팅팀 (Marketing)

**메시징 포인트**:
- "Your agents, with memory." — 간결하고 강력한 가치 제안
- 무료 진입 장벽 낮음: 로컬 엔진 무료, 신용카드 없이 가입 가능
- 30일 무료 체험(CMEM Pro) → 유료 전환 유도

**채널 전략**:
- OpenRouter 1위 랭크 노출 활용 (신규/트렌드 서비스 이미지)
- 에이전트 커뮤니티(Claude Code, Cursor, Codex 사용자) 타겟팅
- "0일" 태그 = 조기 adopter 확보 기회

**주의사항**: "Claude" 브랜드명 사용으로 상표권 이슈 가능성 확인 필요. cmem.ai라는 별도 브랜드로 차별화 유지.

### 6.4 운영팀 (Operations)

**인프라**:
- 로컬 설치 시 서버 운영 불필요 (사용자 머신에서 워커 실행)
- CMEM Pro/클라우드 동기화 사용 시 cmem.ai 인프라 의존

**모니터링**:
- 워커 헬스체크: `/api/health`
- 동기화 상태: `/api/sync/status` (`configured: true`, `hub.reachable: true`)
- 로그: 로컬 워커 출력

**백업/마이그레이션**:
- 메모리 데이터: `~/.claude-mem` 폴더 (SQLite DB 등)
- 설정: `~/.claude-mem/settings.json` (권한 0600 권장)
- 다른 머신으로 이전 시 해당 폴더 복사

### 6.5 데이터팀 (Data)

**데이터 모델**:
- 세션(Session): 시작/종료 시간, 프롬프트, 에이전트 정보
- 관찰(Observation): 도구 호출 기록, 학습 내용, 타입/날짜/프로젝트 필터 가능
- 요약(Summary): 세션 종료 시 생성된 압축 컨텍스트
- 프로젝트(Project): 다중 세션을 묶는 단위

**검색 인덱스**:
- FTS5 전체 텍스트 검색 (SQLite 내장)
- 선택적 Chroma 벡터 인덱스 (의미 기반 검색)

**분석 가능 항목**:
- 개발자별 작업 패턴 (어떤 파일 자주 수정, 어떤 버그 반복)
- 프로젝트별 활동 타임라인
- 에이전트 사용량 및 토큰 소비 (OpenRouter 제공자 시)

### 6.6 파트너십팀 (Partnerships)

**연동 가능 파트너**:
- Anthropic (Claude 플랜 공유, `--provider claude`)
- OpenRouter (메모리 추출을 오픈라우터 크레딧으로 실행, 기존 `sk-or-v1` 키 재활용 가능)
- Google Gemini (제공자 옵션)
- Cursor, Codex, OpenCode, Warp, Roo Code, Goose, Zed 등 에이전트 호스트

**제휴 기회**:
- OpenRouter와 번들링: OpenRouter 키로 Claude-Mem 메모리 실행 (오프-플랜)
- 에이전트 호스트와의 플러그인 마켓플레이스 연동 (Claude Code, Cursor 등)

---

## 7. 요금 및 라이선스

| 플랜 | 가격 | 내용 |
|------|------|------|
| claude-mem (로컬) | 무료 | 영구 메모리, 로컬 SQLite, 검색 가능, 번들 스킬, 오픈소스 코드 |
| Cloud Sync | $12/월 | 디바이스 간 메모리 동기화, 개인 MCP 리콜, 기존 모델 제공자 유지 (30일 체험 후) |
| CMEM Pro | $30/월 | 호스팅 토큰 $30 상당 월 생성 허용량 |
| Heavy | $70/월 | 호스팅 토큰 $49 상당 |
| CMEM Max | $100/월 | 호스팅 토큰 $70 상당, 초과 시 제공자 비용 ÷ 0.7 |

Cloud Sync와 호스팅 토큰은 별도 구독. 토큰 구매/사용/해지는 Cloud Sync 체험이나 갱신에 영향 없음. Max 초과 사용은 제공자 비용 ÷ 0.7, 안전 천장 적용.

---

## 8. 실습 체크리스트 (이 폴더에서)

- [ ] `npx claude-mem install` 실행 및 설치 완료
- [ ] `~/.claude-mem/settings.json` 생성 (OpenRouter 키 또는 Anthropic 플랜 선택)
- [ ] `npx claude-mem restart`로 워커 시작
- [ ] `curl http://127.0.0.1:<port>/api/health`로 헬스 확인
- [ ] Claude Code/Cursor에서 새 세션 시작, 이전 메모리 주입 확인
- [ ] MCP 검색 도구 테스트: `search` → `timeline` → `get_observations`
- [ ] (선택) CMEM Pro 가입 및 클라우드 동기화 연결
- [ ] (선택) 웹 뷰어 URL에서 실시간 메모리 스트림 확인

---

## 9. 위험 및 주의사항

1. **프로덕션 검증 필요**: 무료/오픈소스 메모리 엔진. 중요 업무 도입 전 안정성, 백업, 복구 절차 검증.
2. **API 키 보안**: `~/.claude-mem/settings.json` 권한 0600 유지, 커밋 금지(.gitignore 추가).
3. **시크릿 노출**: 에이전트 활동이 메모리에 저장되므로 API 키, 비밀번호가 관찰에 들어가지 않도록 태그(` `)로 감추거나 자동 편집 활성화.
4. **토큰 비용**: OpenRouter 제공자 사용 시 관찰 추출에 별도 토큰 소비. 무료 모델(`:free`) 사용 권장.
5. **플랜 의존**: CMEM Pro 체험 종료 후 폴백 이벤트 기반. `CLAUDE_MEM_PRO_FALLBACK_AT` 타임스탬프 모니터링.

---

## 10. 참고 링크

- 공식 사이트: https://cmem.ai/
- 설치 가이드: https://docs.claude-mem.ai/installation
- 소개: https://docs.claude-mem.ai/introduction
- OpenRouter 제공자 설정: https://docs.claude-mem.ai/usage/openrouter-provider
- CMEM Pro 헤드리스: https://docs.claude-mem.ai/cmem-pro-headless
- Claude 커넥터 설정: https://cmem.ai/docs/claude
- 가격: https://cmem.ai/pricing
- 통합 목록: https://cmem.ai/integrations
- GitHub: https://github.com/thedotmack/claude-mem
