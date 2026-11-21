# Elephant-Goldfish Model (egm.dev) — 분석 및 실습 가이드

OpenRouter 순위 4위 추정 서비스. 설계 중심 AI 소프트웨어 개발 프레임워크로, "Elephant(장기 맥락 유지 설계 세션)"과 "Goldfish(무상태 신규 검토 세션)"의 역할 분담을 통해 설계 문서의 품질을 높이는 오픈소스 플러그인이다.

> **참고**: EGM(Elephant-Goldfish Model)은 AI 모델이 아닌, 에이전트용 오픈소스 플러그인/프레임워크이다. OpenRouter에서 직접 제공하는 "egm" 모델 ID는 확인되지 않았으며(추정), OpenRouter는 EGM 플러그인이 사용하는 에이전트 모델(예: Claude Code 내 Anthropic 모델 등)을 호출하는 경로로 활용될 수 있다. 본 문서는 egm.dev, github.com/google/elephant-goldfish-model, Google Open Source Blog(2026-10-22) 등의 공개 정보를 바탕으로 작성했으며, 명확하지 않은 항목은 추정/예상으로 표시한다.

---

## 1. 개요

| 항목 | 내용 |
|------|------|
| 서비스명 | Elephant-Goldfish Model (EGM) |
| 도메인 | egm.dev |
| 순위 | OpenRouter 4위 추정 (추정) |
| 태그 | 신규/트렌드 (2026-09 생성, 2026-10 오픈소스 발표) |
| 핵심 가치 | "Design with an elephant. Review with a goldfish." — 설계는 맥락을 기억하는 Elephant가, 검토는 아무것도 모르는 Goldfish가 수행 |
| 지원 에이전트 | Claude Code, Codex CLI, Antigravity, Claude Cowork, ChatGPT Work, omp, Muse (Cursor, OpenCode, GitHub Copilot 실험적 어댑터 포함) |
| 메모리 모델 | 세션 기반 컨텍스트 분리 (Elephant=장기 맥락, Goldfish=무상태 신규) |
| 클라우드 동기화 | 없음 (로컬 플러그인, 설계 문서 마크다운 파일 기반) |
| 가격 | 무료 (Apache 2.0 오픈소스) |
| 라이선스 | Apache License 2.0 ("이것은 공식적으로 지원되는 Google 제품이 아님") |
| 저장소 | https://github.com/google/elephant-goldfish-model |
| 버전 | v0.1.1 (2026-11-06 릴리스) |

---

## 2. 작동 원리

```
아이디어/요구사항 → Elephant 세션(장기 맥락) → 설계 초안(마크다운)
                                                        ↓
                                              Goldfish 세션(무상태, 신규)
                                                        ↓
                                              검토 결과(누락/불명확/리스크)
                                                        ↓
                                              Human 결정 → 승인 후 구현
```

1. **Elephant 설계 세션** — 사용자와 함께 배경, 제약, 결정을 탐색. "No Code" 규칙(코드 미작성)으로 설계 의도와 마이크로 결정만 기록. 설계 문서(`design_draft.md`)를 섹션별로 작성.
2. **Goldfish 검토 세션** — 새 대화(ゼ로 컨텍스트)에서 설계 문서와 참조 파일만 읽음. 이전 대화의 사전 지식(블라인드 스팟) 없음. 누락된 가정, 불명확한 요구사항, 구현 리스크를 발견.
3. **Human 검토 및 승인** — 개발자가 검토 결과를 검토하고 설계를 승인하거나 수정. 승인 후 구현 에이전트가 설계 문서대로 코드를 작성.
4. **유지보수** — `/egm-bootstrap`으로 코드베이스 문서화, `/egm-drift-report`로 설계 문서와 실제 코드 간의 이탐 감지.

**역할 표**:

| 역할 | 컨텍스트 | 책임 |
|------|----------|------|
| Elephant | 프로젝트, 요구사항, 이전 결정, 전체 대화 | 문제 탐색, 사양 초안 작성, 코드 미작성 |
| Goldfish | 설계 문서 + 참조 소스 파일만 (이전 대화 없음) | 누락 가정, 불명확 요구사항, 구현 리스크 발견 |
| Human | 목표와 제약 | 트레이드오프 해결, 설계 승인, 구현 결정 |

Goldfish 리뷰는 신규 서브에이전트 컨텍스트를 필요로 함. 에이전트가 신규 컨텍스트를 생성할 수 없으면 EGM은 리뷰를 중단함. 리뷰는 테스트나 인간의 판단을 대체하지 않음.

---

## 3. 주요 기능

| 기능 | 설명 |
|------|------|
| Elephant 설계 세션 | 장기 맥락 보유, 설계 문서 초안 작성, 코드 미작성 |
| Goldfish 검토 세션 | 무상태 신규 세션, 설계 문서만 읽어 독립적 검토 |
| 3단계 Goldfish 프로토콜 | 이해도 확인 → 적대적 검토 → 구현 준비 상태 확인 |
| 기술 설계 워크플로우 | `/egm-brainstorm` → `/egm-draft` → `/egm-review` |
| 맞춤 검토 | `/egm-review-loop`로 검토자 및 표준 선택(비소프트웨어 문서용) |
| 코드베이스 문서화 | `/egm-bootstrap`로 기존 코드 문서 생성/업데이트 |
| 드리프트 보고 | `/egm-drift-report`로 설계 문서와 실제 코드 비교 |
| 라이트 모드 | `/egm-lite`로 소규모 반복, 사양 수정, 리팩터링, 버그 수정 가속 |
| 서브에이전트 페르소나 | `agents/` 디렉터리의 검토자 프롬프트, 커스텀 가능 |
| 문서 표준 | `resources/document_standards/`에 설계 문서 템플릿/표준 |
| Apache 2.0 | 상업적 사용 가능, 공식 Google 제품 아님 |

지원 스킬(명령):

| 스킬 | 목적 |
|------|------|
| `/egm-brainstorm` | 아이디어 탐색, 개념 브리프(`concepts_brief.md`) 생성 |
| `/egm-draft` | 설계 초안(`design_draft.md`) 섹션별 작성 |
| `/egm-review` | Goldfish 다단계 설계 검토 |
| `/egm-resolve` | 검토 결과 확인 및 변경 사항 합의 |
| `/egm-review-loop` | 맞춤 검토자/표준 선택 |
| `/egm-lite` | 소규모 반복/리팩터링/버그 수정 |
| `/egm-bootstrap` | 코드베이스 문서 생성/업데이트 |
| `/egm-drift-report` | 설계 문서와 코드 이탈 감지 |

---

## 4. MCP/검색 도구

EGM은 전통적 의미의 MCP 검색 도구(자연어 메모리 쿼리 등)를 내장하지 않음. 대신 설계 문서 기반 검토 프레임워크를 제공함.

| 항목 | 내용 |
|------|------|
| 검색 대상 | 설계 문서(`design_draft.md`), 참조 소스 파일, 검토자 페르소나, 문서 표준 |
| 검색 메커니즘 | Goldfish 서브에이전트가 설계 문서와 링크된 파일을 직접 읽음 |
| Claude Code 연동 | 검토자 파일에 읽기 전용 도구(`Read`, `Grep`, `Glob`)만 부여, `omitClaudeMd: true`로 `CLAUDE.md` 제외(Claude Code 2.1.271+) |
| 격리 수준 | 컨텍스트 및 도구 격리, 파일 시스템 격리 아님 |
| 외부 MCP 연동 | 필요 시 설계 문서를 OpenRouter 기반 모델로 요약/검토하는 커스텀 MCP 서버를 별도 구축 가능(추정) |

> EGM의 "검색"은 메모리 인덱스 검색이 아니라, 설계 문서의 **완전성 및 자가 포함성 검증**에 초점이 있음. Claude-Mem의 3단계 토큰 효율 검색(`search`→`timeline`→`get_observations`)과는 근본적으로 다름.

---

## 5. 설치 및 실습 (이 폴더에서 바로 실행)

### 사전 확인
- Node.js, Bun, uv 설치 권장 (Windows에서는 npx 기반 설치가 가장 쉬움, Docker 불필요)
- Claude Code, Codex CLI, Antigravity 등 지원 에이전트 중 하나 설치 필요

### 5.1 Claude Code 설치

```powershell
# EGM 플러그인 마켓플레이스 추가 및 설치
claude plugin marketplace add google/elephant-goldfish-model
claude plugin install egm@egm

# 플러그인 활성화
claude plugin enable egm@egm

# 새 세션 시작 후 스킬 사용
claude
```

새 세션 시작 후 `/egm:egm-brainstorm`, `/egm:egm-draft`, `/egm:egm-review` 스킬 사용 가능.

### 5.2 Codex CLI 설치

```powershell
# EGM 플러그인 마켓플레이스 추가 및 설치
codex plugin marketplace add google/elephant-goldfish-model
codex plugin add egm@egm

# 새 세션 시작 후 스킬 사용
codex
```

### 5.3 Antigravity CLI 설치

```powershell
# EGM 플러그인 설치
agy plugin install https://github.com/google/elephant-goldfish-model

# Antigravity 앱 또는 IDE에서는 /plugin 명령 또는 설치 가이드 참조
```

### 5.4 실습 예시 (Claude Code 기준)

```powershell
# 1. 새 Claude Code 세션 시작
claude

# 2. 아이디어 브레인스토밍 (Elephant 역할)
/egm:egm-brainstorm 웹훅 배송 기능 추가를 이 프로젝트에 적용하라

# 3. 개념 브리프 확인 (concepts_brief.md 생성됨)
Get-Content concepts_brief.md

# 4. 설계 초안 작성 (Elephant 역할)
/egm:egm-draft

# 5. 설계 문서 확인
Get-Content design_draft.md

# 6. Goldfish 검토 실행 (무상태 신규 세션)
/egm:egm-review design_draft.md

# 7. 검토 결과 확인 및 수정 합의
/egm:egm-resolve

# 8. 설계 승인 후 구현
# 설계 문서에 따라 AI가 코드 작성
```

### 5.5 OpenRouter 연동 예시 (추정)

EGM 자체가 OpenRouter 모델은 아니지만, Elephant/Goldfish 세션을 구동하는 에이전트 모델을 OpenRouter 경로로 호출할 수 있음(추정).

```powershell
# OpenRouter API 키 환경 변수 설정
$env:OPENROUTER_API_KEY = "sk-or-v1-..."

# OpenRouter 베이스 URL로 모델 호출 예시 (Python)
@'
import openai

client = openai.OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="$env:OPENROUTER_API_KEY"
)

response = client.chat.completions.create(
    model="anthropic/claude-sonnet-4",
    messages=[{"role": "user", "content": "설계 문서를 검토해 주세요."}]
)
print(response.choices[0].message.content)
'@ | Set-Content -LiteralPath "./test_openrouter.py" -Encoding utf8

python test_openrouter.py
```

---

## 6. 팀 에이전트별 분석

### 6.1 제품팀 (Product)

**포지셔닝**: "설계 우선" 개발 방법론 도입. 설계 문서가 코드보다 먼저 작성되고 승인받음으로써, 구현 후 재작업과 설계 미스매치를 줄임.

**타겟 사용자**:
- 설계 문서의 중요도가 높은 소프트웨어 팀
- 장기 프로젝트 (설계 문서가 세션 간 살아남아야 함)
- 다중 에이전트 협업 팀 (설계 문서가 공유 기준이 됨)

**차별 포인트**:
- Elephant/Goldfish 역할 분담으로 설계의 블라인드 스팟 제거
- Apache 2.0 오픈소스, 벤더 종속 없음
- 설계 문서가 구현의 단일 진실 소스(Single Source of Truth)

### 6.2 개발팀 (Engineering)

**아키텍처 구성요소**:
1. **Elephant 세션**: 장기 맥락, 설계 초안 작성, 코드 미작성
2. **Goldfish 세션**: 무상태 신규 서브에이전트, 설계 문서만 읽음
3. **설계 문서**: `design_draft.md`, `concepts_brief.md`, `docs/designs/` 하위 승인 문서
4. **스킬 및 페르소나**: `skills/`, `agents/` 디렉터리의 마크다운 규칙
5. **문서 표준**: `resources/document_standards/`
6. **드리프트 감지**: 설계 문서와 실제 코드 비교

**설치 의존성**: Node.js, Bun, uv. Windows에서는 npx 기반 설치가 가장 쉬움(Docker 불필요).

**연동 포인트**:
- 에이전트 플러그인: Claude Code, Codex CLI, Antigravity, Claude Cowork, ChatGPT Work
- 설계 문서: 마크다운 파일, 버전 관리 가능
- 검토자: 서브에이전트 컨텍스트 필요

**실패 처리(fail-soft)**:
- 신규 컨텍스트 생성 불가 → Goldfish 리뷰 중단, Elephant 세션은 계속 진행 가능
- 설계 문서 불충분 → Goldfish가 이해도 확인 실패, 문서 보완 후 재검토
- 리뷰는 테스트 대체 불가, 추가 검증 필요

### 6.3 마케팅팀 (Marketing)

**메시징 포인트**:
- "Design is the new code" — 설계가 코드보다 중요하다는 강렬한 메시지
- Google 엔지니어 내부 사용 실적 (수천 명의 Googler가 매일 사용)
- 오픈소스 Apache 2.0, 벤더 종속 없음
- 설계 품질 향상 → 버그 감소 → 개발 속도 향상

**채널 전략**:
- egm.dev 웹사이트, Google Open Source Blog 발표 활용
- 에이전트 커뮤니티(Claude Code, Codex, Antigravity 사용자) 타겟팅
- GitHub 저장소(star 21,000 이상)를 사회적 증거로 활용

**주의사항**: "Model"이라는 명칭이 AI 모델과 혼동될 수 있음. 실제로는 플러그인/프레임워크임을 명확히 전달 필요.

### 6.4 운영팀 (Operations)

**인프라**:
- 로컬 설치 시 서버 운영 불필요 (사용자 머신에서 플러그인 실행)
- 설계 문서는 버전 관리 시스템(Git)에 커밋 가능
- 클라우드 의존성 없음(에이전트 모델 호출 시에만 외부 API 필요)

**모니터링**:
- 설계 문서 생성/승인 현황 추적
- Goldfish 검토 통과/실패율
- 드리프트 보고 결과(설계-코드 이탐)

**백업/마이그레이션**:
- 설계 문서: `docs/designs/`, `concepts_brief.md`, `design_draft.md` (Git 관리)
- 플러그인 설정: 에이전트별 플러그인 설정 파일
- 다른 머신으로 이전 시 설계 문서 및 플러그인 재설치

### 6.5 데이터팀 (Data)

**데이터 모델**:
- 개념 브리프(`concepts_brief.md`): 합의된 방향의 간략 메모
- 설계 초안(`design_draft.md`): 공식 마크다운 설계 문서
- 승인 설계 문서(`docs/designs/`): 사람이 승인한 최종 설계
- 검토 결과: Goldfish가 발견한 누락/불명확/리스크 목록
- 드리프트 보고: 설계 문서와 코드 간의 이탈 항목

**분석 가능 항목**:
- 설계 검토 통과율 및 재검토 횟수
- 설계 문서 섹션별 완성도
- 설계-코드 이탐 빈도 및 유형
- Elephant 세션 길이와 설계 품질 상관관계(추정)

### 6.6 파트너십팀 (Partnerships)

**연동 가능 파트너**:
- Anthropic (Claude Code 내 모델)
- Google (Gemini 모델, EGM 방법론 원 출처)
- Antigravity (주요 통합 대상)
- OpenAI (Codex CLI 내 모델)
- Claude Cowork, ChatGPT Work, omp, Muse

**제휴 기회**:
- 에이전트 호스트와의 플러그인 마켓플레이스 연동
- 설계 검토 워크플로우를 CI/CD 파이프라인에 통합
- OpenRouter를 통한 에이전트 모델 호출 경로 제공(추정)

---

## 7. 요금 및 라이선스

| 항목 | 내용 |
|------|------|
| 플러그인 사용료 | 무료 (Apache 2.0 오픈소스) |
| 라이선스 | Apache License 2.0 |
| 공식 지원 | 없음 ("이것은 공식적으로 지원되는 Google 제품이 아님") |
| 에이전트 모델 비용 | 별도 (사용 에이전트의 모델 요금제 적용) |
| OpenRouter 경로 이용 시 | OpenRouter 크레딧 사용(추정, 모델별 과금) |

상업적 사용 가능, 수정 및 재배포 가능. 특허 양수 조항 포함(Apache 2.0 표준).

---

## 8. 실습 체크리스트 (이 폴더에서)

- [ ] 지원 에이전트 설치 확인 (Claude Code / Codex CLI / Antigravity 중 하나)
- [ ] `claude plugin marketplace add google/elephant-goldfish-model` 실행
- [ ] `claude plugin install egm@egm` 실행
- [ ] `claude plugin enable egm@egm` 실행
- [ ] 새 세션 시작 후 `/egm:egm-brainstorm`로 아이디어 탐색
- [ ] `/egm:egm-draft`로 설계 초안 작성 (`design_draft.md` 생성 확인)
- [ ] `/egm:egm-review design_draft.md`로 Goldfish 검토 실행
- [ ] 검토 결과 확인 및 `/egm:egm-resolve`로 수정 합의
- [ ] 설계 승인 후 구현 에이전트로 코드 작성
- [ ] (선택) `/egm:egm-bootstrap`로 기존 코드베이스 문서화
- [ ] (선택) `/egm:egm-drift-report`로 설계-코드 이탐 확인
- [ ] (선택) OpenRouter API 키로 에이전트 모델 호출 테스트(추정)

---

## 9. 위험 및 주의사항

1. **모델 아님**: EGM은 AI 모델이 아닌 플러그인/프레임워크임. OpenRouter에서 "egm" 모델 ID를 직접 호출할 수 없음(추정). 에이전트 모델은 별도 계약 필요.
2. **공식 미지원 제품**: Google에서 내부 사용 후 오픈소스화했지만, 공식적으로 지원되는 Google 제품이 아님. 엔터프라이즈 지원 보증 없음.
3. **신규 컨텍스트 의존성**: Goldfish 리뷰는 에이전트가 신규 서브에이전트 컨텍스트를 생성할 수 있어야 함. 불가능하면 리뷰 중단.
4. **검토 불완전성**: Goldfish는 설계 문서와 참조 파일만 읽음. 문서 외의 암묵적 지식은 검토 불가. 테스트나 인간 판단을 대체하지 않음.
5. **컨텍스트 격리 한계**: Claude Code 2.1.271+에서는 `CLAUDE.md` 제외 검증됨. Codex/Antigravity에서는 `AGENTS.md` 등 프로젝트 명령 파일이 검토자에 전달될 수 있음(이슈 #237).
6. **설계 문서 품질 의존**: Goldfish의 검토 품질은 설계 문서의 완성도에 좌우됨. 불충분한 문서는 부정확한 검토 결과 초래.
7. **버전 관리**: 설계 문서를 Git에 커밋하지 않으면 세션 간 설계 지식 유실 위험.
8. **OpenRouter 연동 미확인**: EGM과 OpenRouter의 직접 연동 공식 문서 없음. 에이전트 모델을 OpenRouter로 호출하는 경로는 추정임.

---

## 10. 참고 링크

- 공식 사이트: https://egm.dev/
- EGM 소개 가이드: https://egm.dev/guide/
- 스킬 문서: https://egm.dev/skills/
- GitHub 저장소: https://github.com/google/elephant-goldfish-model
- 릴리스 페이지: https://github.com/google/elephant-goldfish-model/releases
- Google Open Source Blog 발표: https://opensource.googleblog.com/2026/10/introducing-elephant-goldfish-model-plugin.html
- Dave Rensin 원문 에세이: https://research.google/pubs/elephants-goldfish-and-the-new-golden-age-of-software-engineering/
- Claude Code 연동 문서: https://raw.githubusercontent.com/google/elephant-goldfish-model/main/docs/claude.md
- 하네스(설치) 문서: https://github.com/google/elephant-goldfish-model/blob/main/docs/harnesses.md
- 시작 가이드: https://github.com/google/elephant-goldfish-model/blob/main/docs/getting_started.md
- OpenRouter 모델 목록 API: https://openrouter.ai/docs/api/api-reference/models/list-all-models-and-their-properties
- OpenRouter 무료 모델: https://openrouter.ai/collections/free-models

---

## 부록: Claude-Mem vs Elephant-Goldfish 비교 (메모리 주제)

| 비교 항목 | Claude-Mem (cmem.ai) | Elephant-Goldfish Model (egm.dev) |
|-----------|----------------------|-----------------------------------|
| 성격 | 에이전트 장기 메모리 계층 | 설계 중심 개발 프레임워크 (플러그인) |
| OpenRouter 순위 | 1위 | 4위 추정 |
| 메모리 저장 위치 | 로컬 SQLite + Chroma (`~/.claude-mem`) | 설계 문서 마크다운 파일 (`docs/designs/`) |
| 세션 간 메모리 | 이전 세션 관찰 자동 주입 | Elephant 세션이 설계 문서에 기록, Goldfish는 무상태 |
| "망각" 해소 방식 | 세션 간 관찰 요약 주입 | 설계 문서가 지식의 단일 진실 소스 |
| 검색 도구 | 3단계 MCP 검색 (`search`/`timeline`/`get_observations`) | 설계 문서 기반 Goldfish 검토 |
| 설치 | `npx claude-mem install` | 에이전트별 플러그인 설치 (`claude plugin install egm@egm` 등) |
| 가격 | 로컬 무료 / Cloud Sync $12/월 등 | 무료 (Apache 2.0) |
| 라이선스 | 비공개(추정) + 오픈소스 코드 | Apache License 2.0 |

**공통점**: 둘 다 AI 에이전트의 맥락 유실(망각) 문제를 해결하려 함. 차이는 Claude-Mem이 **세션 간 연속적 메모리**를 제공하는 반면, EGM은 **설계 문서를 통한 지식 연속성**과 **무상태 검토**에 초점을 둔다는 점.
