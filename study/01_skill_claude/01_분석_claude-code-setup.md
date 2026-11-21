# Claude Code Setup — 분석 및 실습 가이드

OpenRouter 순위 3위 서비스. Anthropic 공식 마켓플레이스(claude.com/marketplace)에 등록된 Claude Code 설치/설정 플러그인으로, 개발자의 코드베이스를 분석해 맞춤형 Claude Code 자동화(훅, 스킬, MCP 서브에이전트, 슬래시 명령 등)를 추천한다.

---

## 1. 개요

| 항목 | 내용 |
|------|------|
| 서비스명 | Claude Code Setup |
| 도메인 | claude.com/plugins/claude-code-setup (claude.com/marketplace) |
| 순위 | OpenRouter 3위 |
| 태그 | Anthropic verified (인증됨) |
| 설치 수 | 195,067회 이상 |
| 핵심 가치 | "코드베이스를 읽어 프로젝트에 딱 맞는 Claude Code 자동화를 추천한다." |
| 모드 | 읽기 전용(read-only), 파일 수정 없음 |
| 추천 대상 카테고리 | MCP 서버, 스킬, 훅, 서브에이전트, 슬래시 명령 |
| 프로젝트 탐색 | package.json, 언어 파일, 디렉터리 구조 분석 |
| 공식 마켓플레이스 등록 | 예 (높은 신뢰도, Claude 사용자 직접 노출) |

---

## 2. 작동 원리

```
코드베이스 분석 → 프로젝트 유형 감지 → 카테고리별 자동화 추천
    ↓
사용자 프롬프트 ("recommend automations for this project" 등) → 상위 1~2개 추천 노출
    ↓
특정 유형 요청 ("what MCP servers should I use?") → 3~5개 확장 목록 노출
    ↓
사자가 추천을 적용 (MCP 연결, 스킬 설치, 훅 등록 등) → Claude Code 워크플로우 개선
```

1. **코드베이스 스캔** — `package.json`, 언어 파일, 디렉터리 구조를 읽어 프로젝트 유형(React, Node.js, Python 등)과 의존성을 감지한다.
2. **자동화 매칭** — 감지된 기술 스택에 따라 최적의 자동화를 추천. 예: React 프로젝트에는 Playwright MCP, 인증 코드가 있으면 security-reviewer 서브에이전트.
3. **읽기 전용 동작** — 분석만 수행하고 사용자 파일을 수정하지 않음. 적용 여부는 사용자가 결정.
4. **대화형 호출** — "recommend automations for this project", "help me set up Claude Code", "what hooks should I use?" 등 자연어 프롬프트로 호출.
5. **확장 추천** — 특정 카테고리(예: MCP 서버)를 지정하면 해당 카테고리 내 3~5개 옵션을 추가로 제시.

---

## 3. 주요 기능

| 기능 | 설명 |
|------|------|
| 코드베이스 분석 | 프로젝트 구조, 의존성, 언어 파일 검사 |
| 프로젝트 유형 감지 | package.json 및 디렉터리 패턴 기반 기술 스택 판별 |
| 맞춤형 자동화 추천 | MCP 서버, 스킬, 훅, 서브에이전트, 슬래시 명령 |
| 읽기 전용 안전성 | 사용자 파일 미수정, 분석 결과만 제시 |
| 카테고리별 상위 추천 | 카테고리당 상위 1~2개 우선 노출 |
| 확장 추천 | 특정 카테고리 지정 시 3~5개 옵션 제시 |
| 대화형 호출 | 자연어 프롬프트로 추천기 호출 |
| Anthropic 공식 인증 | claude.com/marketplace 등록, 높은 신뢰도 |

---

## 4. MCP / 검색 도구

Claude Code Setup이 추천할 수 있는 자동화 카테고리와 활용 예시:

| 카테고리 | 예시 도구 / 자동화 | 목적 |
|----------|-------------------|------|
| MCP 서버 | Playwright MCP, Context7 MCP, GitHub MCP | 브라우저 자동화, 문서 조회, 저장소 연동 |
| 스킬 | Superpowers, code-review, code-simplifier | TDD, 디버깅, PR 리뷰, 코드 단순화 |
| 훅 | 선행/사후 작업 훅 | 빌드, 테스트, 린트 자동 트리거 |
| 서브에이전트 | security-reviewer, 전문 에이전트 | 인증 코드 보안 검토, 도메인별 작업 |
| 슬래시 명령 | `/setup`, `/review`, `/test` 등 | 반복 작업 단축 명령 |

토큰 효율 워크플로우(권장):
1. `recommend automations for this project` — 전체 개요 확인 (낮은 토큰)
2. 특정 카테고리 질문 (`what MCP servers should I use?`) — 상세 목록 (중간 토큰)
3. 필요한 자동화만 선택적 적용 — 불필요한 설치 방지

---

## 5. 설치 및 실습 (이 폴더에서 바로 실행)

### 사전 확인
- Node.js 설치됨 (확인 필요)
- Claude Code 미설치 시 우선 Claude Code 설치 필요
- PowerShell 관리자 권한 (일부 설치 명령용)

### 5.1 Claude Code 설치 (Windows PowerShell)

Claude Code Setup 플러그인을 사용하려면 먼저 Claude Code CLI가 설치되어 있어야 한다.

```powershell
# 방법 1: 공식 설치 스크립트 (권장)
irm https://claude.ai/install.ps1 | iex

# 방법 2: WinGet
winget install Anthropic.ClaudeCode

# 방법 3: npm (Node.js 필요)
npm install -g @anthropic-ai/claude-code

# 버전 확인 (새 터미널 열기 후)
claude --version
```

설치 후 프로젝트 디렉터리에서 실행:
```powershell
cd your-project
claude
```
첫 실행 시 로그인 프롬프트가 표시됨. `ANTHROPIC_API_KEY` 환경 변수가 설정되어 있으면 승인 후 로그인 생략 가능.

### 5.2 인증 (Anthropic 공식 API / 키)

```powershell
# 대화형 로그인
claude auth login

# 또는 환경 변수로 API 키 설정 (영구)
[Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", "sk-ant-...", "User")
# 새 터미널 세션 필요
```

### 5.3 OpenRouter 연동 (게이트웨이 설정)

Claude Code는 OpenRouter의 Anthropic 호환 엔드포인트를 통해 OpenRouter 모델을 사용할 수 있다. OpenRouter 크레딧으로 과금되며, Anthropic 구독이 필요 없다.

```powershell
# OpenRouter API 키 설정 (사용자 키로 교체)
$env:OPENROUTER_API_KEY = "sk-or-v1-..."

# 세션 범위 환경 변수 설정
$env:ANTHROPIC_BASE_URL = "openrouter.ai/api"
$env:ANTHROPIC_AUTH_TOKEN = $env:OPENROUTER_API_KEY
$env:ANTHROPIC_API_KEY = ""   # 반드시 빈 문자열 (Anthropic 직접 인증 방지)
$env:CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY = "1"  # 선택: 게이트웨이 모델 선택기 활성화
```

영구 설정을 위해 PowerShell 프로필에 추가:
```powershell
# 프로필 경로 확인
$PROFILE

# 프로필에 환경 변수 추가 (관리자 권한 필요할 수 있음)
@'
$env:OPENROUTER_API_KEY = "sk-or-v1-..."
$env:ANTHROPIC_BASE_URL = "openrouter.ai/api"
$env:ANTHROPIC_AUTH_TOKEN = $env:OPENROUTER_API_KEY
$env:ANTHROPIC_API_KEY = ""
$env:CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY = "1"
'@ | Add-Content -LiteralPath $PROFILE -Encoding utf8
```

또는 프로젝트별 설정 (`~/.claude/settings.json` 또는 `.claude/settings.local.json`) — 주의: 프로젝트 커밋 금지:
```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "openrouter.ai/api",
    "ANTHROPIC_AUTH_TOKEN": "sk-or-v1-...",
    "ANTHROPIC_API_KEY": ""
  }
}
```

연결 확인:
```powershell
claude
# Claude Code 내부에서
/status
# 예상 출력: Auth token: ANTHROPIC_AUTH_TOKEN, Anthropic base URL: openrouter.ai/api
```

### 5.4 Claude Code Setup 플러그인 설치

claude.com/marketplace (또는 claude.com/plugins/claude-code-setup)에서 "Install in Claude Code" 클릭, 또는 Claude Code 내부에서:

```powershell
claude
# Claude Code 내부에서
/plugin install claude-code-setup@claude-plugins-official
# 또는 마켓플레이스 목록 확인
/plugin marketplace list
```

플러그인 설치 후 사용:
```powershell
claude
# Claude Code 내부에서 프롬프트 실행
recommend automations for this project
help me set up Claude Code
what MCP servers should I use?
what hooks should I use?
```

추천된 자동화를 적용하려면 각 도구의 설치 안내를 따름(예: MCP 서버 연결, 스킬 설치, 훅 등록).

---

## 6. 팀 에이전트별 분석

### 6.1 제품팀 (Product)

**포지셔닝**: "Claude Code 온보딩 및 자동화 추천". 신규 사용자가 Claude Code를 빠르게 세팅하고, 프로젝트에 적합한 MCP/스킬/훅을 선택해 생산성을 높임.

**타겟 사용자**:
- Claude Code 신규 도입 팀
- 프로젝트별 최적 에이전트 구성이 필요한 개발 조직
- Anthropic 공식 플러그인을 선호하는 기업 (신뢰성 중시)

**차별 포인트**:
- Anthropic 공식 마켓플레이스 등록 (높은 신뢰도, 직접 노출)
- 읽기 전용 분석 (사용자 파일 무결성 보장)
- 기술 스택 기반 맞춤 추천 (제너릭 추천과 차별화)

### 6.2 개발팀 (Engineering)

**설치 의존성**: Node.js (npm 방식), 또는 공식 설치 스크립트/WinGet. Windows에서는 `irm claude.ai/install.ps1 | iex`가 가장 간편.

**연동 포인트**:
- Claude Code CLI / IDE 확장 (VS Code, JetBrains)
- MCP 서버 연결 (Playwright, Context7, GitHub 등)
- 스킬 및 서브에이전트 등록
- 슬래시 명령 단축

**OpenRouter 연동 포인트**:
- `ANTHROPIC_BASE_URL=openrouter.ai/api`로 게이트웨이 라우팅
- `ANTHROPIC_AUTH_TOKEN`에 OpenRouter 키, `ANTHROPIC_API_KEY=""`로 Anthropic 직접 인증 방지
- `/status`로 연결 확인, OpenRouter 활동 대시보드에서 실시간 비용 확인

**실패 처리(fail-soft)**:
- OpenRouter 키 없음 → Anthropic 기본 인증으로 폴백 (또는 인증 오류)
- `ANTHROPIC_API_KEY`가 빈 문자열이 아니면 Anthropic 직접 인증 우선 (혼란 방지 위해 반드시 빈 문자열 설정)
- 캐시된 Anthropic 로그인이 있으면 `/logout` 후 재실행 필요

### 6.3 마케팅팀 (Marketing)

**메시징 포인트**:
- "Anthropic 공식 마켓플레이스 3위" — 신뢰도 및 인기 강조
- "읽기 전용 안전 분석" — 보안 우려 완화
- "프로젝트 맞춤 자동화 추천" — 온보딩 시간 단축

**채널 전략**:
- OpenRouter 순위 3위 노출 활용 (트렌드/인기 서비스 이미지)
- Claude Code 사용자 커뮤니티 타겟팅
- claude.com/marketplace 직접 노출 = 마케팅 채널 의존도 낮음

**주의사항**: "Claude" 브랜드명은 Anthropic 상표. 공식 마켓플레이스 내에서는 문제 없으나, 외부 홍보 시 상표 사용 가이드라인 확인 필요.

### 6.4 운영팀 (Operations)

**인프라**:
- 로컬 설치 (사용자 머신에서 Claude Code 실행) — 서버 운영 불필요
- OpenRouter 사용 시 OpenRouter 인프라 의존 ( Anthropic 인프라 미사용)

**모니터링**:
- `/status`로 인증 및 베이스 URL 확인
- OpenRouter 활동 대시보드에서 실시간 요청/비용 확인
- 로그: Claude Code 터미널 출력

**백업/마이그레이션**:
- Claude Code 설정: `~/.claude/` 폴더
- 환경 변수: PowerShell 프로필 또는 `.claude/settings.local.json`
- 다른 머신 이전 시 해당 폴더 및 환경 변수 재설정

### 6.5 데이터팀 (Data)

**데이터 모델**:
- 추천 로그: 프로젝트 유형, 감지된 기술 스택, 추천 카테고리
- 사용 패턴: 호출된 프롬프트, 적용된 자동화 유형
- 비용 데이터: OpenRouter 활동 대시보드 (토큰 수, 제공자, 모델, 비용)

**분석 가능 항목**:
- 팀별 Claude Code 도입률 및 자동화 적용 현황
- 프로젝트 유형별 선호 MCP/스킬 분포
- OpenRouter를 통한 모델 사용량 및 비용 추이
- 인증 방식 분포 (Anthropic 계정 vs API 키 vs OpenRouter)

### 6.6 파트너십팀 (Partnerships)

**연동 가능 파트너**:
- Anthropic (Claude Code, 공식 마켓플레이스, claude-plugins-official)
- OpenRouter (게이트웨이 라우팅, 크레딧 과금, Anthropic Skin)
- MCP 서버 제공자 (Playwright, Context7, GitHub 등)
- IDE 제공자 (VS Code, JetBrains 등 Claude Code 확장 지원)

**제휴 기회**:
- OpenRouter와 번들링: OpenRouter 키로 Claude Code 실행 (Anthropic 구독 대안)
- MCP 서버 제공자와의 플러그인 마켓플레이스 연동
- 에이전트 호스트(IDE, 데스크톱 앱)와의 통합

---

## 7. 요금 및 라이선스

| 항목 | 내용 |
|------|------|
| Claude Code Setup 플러그인 | 무료 (클라우드 마켓플레이스 등록) |
| Claude Code 사용 | Claude 구독(Pro/Max/Ultra/Team/Enterprise) 또는 Anthropic Console API 키 필요 |
| OpenRouter 경유 사용 | OpenRouter 크레딧 과금 (Anthropic 구독 불필요, Claude 모델 우선 보장) |
| 라이선스 | Anthropic verified 플러그인, 공식 마켓플레이스 이용 약관 적용 |

OpenRouter 비용 구조: 제공자 토큰 가격에 마크업 없음, 크레딧 구매 시 5.5% 수수료(최소 $0.80). OpenRouter는 프롬프트를 저장하지 않음(옵트인 제외). 요청 메타데이터(토큰 수, 지연 시간 등)는 저장됨.

---

## 8. 실습 체크리스트 (이 폴더에서)

- [ ] `irm https://claude.ai/install.ps1 \| iex`로 Claude Code 설치 (Windows PowerShell)
- [ ] `claude --version`으로 설치 확인
- [ ] `claude auth login`으로 Anthropic 로그인 또는 `ANTHROPIC_API_KEY` 설정
- [ ] OpenRouter 환경 변수 설정 (`ANTHROPIC_BASE_URL`, `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_API_KEY=""`)
- [ ] `/status`로 OpenRouter 연결 확인 (`Anthropic base URL: openrouter.ai/api`)
- [ ] `/plugin install claude-code-setup@claude-plugins-official`로 플러그인 설치
- [ ] `recommend automations for this project`로 추천 확인
- [ ] `what MCP servers should I use?`로 카테고리별 추천 확인
- [ ] 추천된 자동화 중 1개 이상 적용 (MCP 연결 또는 스킬 설치 등)
- [ ] (선택) OpenRouter 활동 대시보드에서 실시간 비용 확인

---

## 9. 위험 및 주의사항

1. **인증 충돌**: `ANTHROPIC_API_KEY`가 비어 있지 않으면 Anthropic 직접 인증으로 폴백. 반드시 `""`로 설정. 캐시된 Anthropic 로그인이 있으면 `/logout` 후 재실행.
2. **환경 변수 순서**: PowerShell 프로필에서 `OPENROUTER_API_KEY`를 `ANTHROPIC_AUTH_TOKEN`보다 먼저 정의해야 함(순서가 틀리면 토큰이 빈 문자열로 확장되어 인증 실패).
3. **키 노출**: `~/.claude/settings.json` 또는 PowerShell 프로필에 OpenRouter 키가 포함되므로 파일 권한 제한(읽기 전용 소유자만), git 커밋 금지(`.gitignore` 추가).
4. **모델 호환성**: OpenRouter는 Anthropic 퍼스트 파티 제공자(클로드 모델)에 대해서만 호환성을 보장. 비-Anthropic 모델은 동작이 보장되지 않음.
5. **플러그인 읽기 전용**: Claude Code Setup은 분석만 수행하고 파일을 수정하지 않음. 실제 자동화 적용은 사용자가 별도로 수행.
6. **Windows 전용 고려사항**: Git for Windows 미설치 시 PowerShell을 쉘 도구로 사용. WSL 사용 시 Git for Windows 불필요.
7. **공식 마켓플레이스 의존**: 플러그인 가용성은 Anthropic의 마켓플레이스 정책에 따름.

---

## 10. 참고 링크

- Claude Code Setup (마켓플레이스): https://claude.com/plugins/claude-code-setup
- Claude 마켓플레이스: https://claude.com/marketplace
- Claude Code 설치 가이드: https://code.claude.com/docs/en/overview
- Claude Code 빠른 시작: https://code.claude.com/docs/en/quickstart.md
- Claude Code 플러그인 개요: https://docs.anthropic.com/en/docs/claude-code/plugins
- Anthropic 마켓플레이스: https://code.claude.com/docs/en/plugins/anthropic-marketplaces
- OpenRouter Claude Code 연동: https://openrouter.ai/docs/guides/guides/coding-agents/claude-code-integration
- OpenRouter 블로그 (Claude Code + OpenRouter): https://openrouter.ai/blog/tutorials/claude-code-openrouter/
- Claude Code GitHub Action: https://github.com/anthropics/claude-code-action
