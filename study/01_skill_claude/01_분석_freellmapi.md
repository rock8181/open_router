# FreeLLAMAPI (freellmapi.co) — 분석 및 실습 가이드

OpenRouter 순위 2위 서비스. 87개 무료 LLM 제공자, 1,313개 무료 모델 엔드포인트를 단일 OpenAI 호환 `/v1` 엔드포인트로 통합하는 무료 LLM API 프록시/라우터이다.

---

## 1. 개요

| 항목 | 내용 |
|------|------|
| 서비스명 | FreeLLAMAPI |
| 도메인 | freellmapi.co |
| 순위 | OpenRouter 2위 |
| 태그 | 무료 LLM API / 오픈 소스 / 로컬 서버 |
| 핵심 가치 | "87개 무료 제공자, 1,313개 무료 모델 엔드포인트. 한 개의 OpenAI 호환 엔드포인트로 전체를 경유한다." |
| 월 처리 토큰 | 약 101억 토큰/월 |
| 무료 제공자 수 | 87개 |
| 무료 모델 엔드포인트 | 1,313개 |
| 엔드포인트 구조 | 단일 OpenAI 호환 `/v1` 엔드포인트 |
| 라우팅 | 스마트 라우팅, 자동 페일오버 |
| 키 관리 | 암호화된 API 키 저장 |
| 사용 목적 | 개인 실험 전용 (프로덕션 비권장) |
| 공식 설치 한 줄 (리눅스/맥) | `curl -fsSL https://freellmapi.co/install.sh \| bash` |
| Windows 설치 | Microsoft Store 데스크톱 앱 또는 Releases의 `.exe` |
| 로컬 개발 | Node.js 20+, npm, `git clone`, `ENCRYPTION_KEY`, `docker compose` |
| 기본 URL | `http://localhost:3001/v1` |
| 통합 API 키 | 대시보드 Keys 페이지의 통일된 API 키 |
| OpenAI SDK 호환 | `base_url`을 `http://localhost:3001/v1`로 설정 |
| 사용량 조회 | `GET /v1/usage`, 월간 상한, 429 `quota_exceeded` |

> **참고**: 기존 OpenRouter API 키는 `C:\work\openrouter\open_router\doc\01_apikey.md` (`sk-or-v1-...`)에 보관되어 있다. FreeLLAMAPI는 자체 키(대시보드 Keys 페이지)를 사용하므로 OpenRouter 키를 그대로 덮어쓰지 않도록 주의한다.

---

## 2. 작동 원리

```
Client(OpenAI SDK) → http://localhost:3001/v1/chat/completions
                             ↓
                    FreeLLAMAPI 서버 (단일 /v1 엔드포인트)
                             ↓
              스마트 라우팅 → 87개 무료 제공자 중 최적 엔드포인트 선택
                             ↓
              자동 페일오버 (제공자 장애 시 다음 제공자로 전환)
                             ↓
              대상 LLM 제공자 API 호출 → 응답 반환
```

1. **클라이언트 요청** — OpenAI 호환 SDK가 `http://localhost:3001/v1`로 요청을 보낸다. 통합 API 키를 `Authorization: Bearer <키>` 헤더에 포함.
2. **라우팅 및 페일오버** — FreeLLAMAPI가 스마트 라우팅으로 사용 가능한 무료 제공자/모델 엔드포인트를 선택한다. 대상 제공자가 응답 없음이나 오류를 반환하면 자동으로 다음 제공자로 페일오버.
3. **키 암호화** — 제공자별 API 키는 암호화되어 저장되며, 요청 시에만 복호화되어 전달된다.
4. **응답 반환** — OpenAI 호환 형식으로 클라이언트에 반환된다. 클라이언트는 제공자 개수를 신경 쓰지 않고 단일 엔드포인트만 사용하면 된다.

로컬 서버 모드에서는 Docker Compose로 FreeLLAMAPI 컨테이너를 기동하고, 클라이언트는 `http://localhost:3001/v1`을 base_url로 지정한다.

---

## 3. 주요 기능

| 기능 | 설명 |
|------|------|
| 단일 OpenAI 호환 엔드포인트 | `http://localhost:3001/v1` 하나로 모든 제공자 경유 |
| 87개 무료 제공자 연동 | 월 약 101억 토큰 처리 규모의 무료 제공자 풀 |
| 1,313개 무료 모델 엔드포인트 | 무료 모델을 통한 광범위한 모델 선택지 |
| 스마트 라우팅 | 요청 특성/가용성에 따른 최적 제공자 자동 선택 |
| 자동 페일오버 | 제공자 장애/속도 제한 시 대체 제공자로 자동 전환 |
| 암호화된 키 저장 | 제공자 API 키를 암호화하여 로컬 저장 |
| 개인 실험 전용 | 프로덕션 환경 사용 비권장 (개인 학습/프로토타이핑용) |
| 사용량 모니터링 | `GET /v1/usage`로 사용량 조회, 월간 상한 관리 |
| 할당량 초과 처리 | 429 `quota_exceeded` 응답 반환 |
| OpenAI SDK 완전 호환 | `base_url`만 변경하면 기존 OpenAI 코드 재사용 가능 |
| 대시보드 키 관리 | Keys 페이지에서 통일 API 키 발급/관리 |

---

## 4. MCP/검색 도구

FreeLLAMAPI 자체는 LLM API 프록시이므로 Claude-Mem처럼 전용 MCP 메모리 검색 도구를 내장하지는 않는다. 다만 OpenAI 호환 엔드포인트이므로, MCP 클라이언트(예: Claude Code, Cursor 등)가 `http://localhost:3001/v1`를 LLM 제공자로 설정하면 자연어 기반 도구 호출과 검색 워크플로우를 간접적으로 구성할 수 있다.

| 단계 | 도구/방식 | 목적 | 토큰/결과 |
|------|-----------|------|-----------|
| 1 | `GET /v1/usage` | 현재 월 사용량과 잔여 할당량 확인 | 소수 토큰(API 호출 자체) |
| 2 | OpenAI SDK (`base_url` 지정) | 단일 엔드포인트로 채팅/완성 요청 | 모델별 토큰 소비 |
| 3 | 자동 페일오버 | 제공자 장애 시 연속 동작 보장 | 추가 토큰 발생 가능 |

참고: 검색/메모리 기능이 필요한 경우 Claude-Mem (`01_분석_claude-mem.md`)의 MCP 검색 도구(`search`, `timeline`, `get_observations`)와 병행 사용을 고려한다.

---

## 5. 설치 및 실습 (이 폴더에서 바로 실행)

### 사전 확인

- **Docker 필수**: 서버 설치(도커 원클릭 또는 docker compose)에는 Docker가 반드시 설치되어 있어야 함.
- Node.js 20+ 및 npm (로컬 개발/소스 빌드 시)
- git (소스 클론 시)
- PowerShell (Windows 터미널)

### 5.1 Windows 설치 (데스크톱 앱 / .exe)

Windows 사용자는 도커 원클릭 쉘 스크립트를 직접 실행할 수 없으므로, 다음 두 경로 중 하나를 선택한다.

**경로 A: Microsoft Store 데스크톱 앱**
1. Microsoft Store에서 "FreeLLAMAPI" 검색 후 설치.
2. 앱 실행 후 대시보드 Keys 페이지에서 통합 API 키 발급.
3. 클라이언트(base_url)는 로컬 서버 포트(기본 3001)로 지정.

**경로 B: Releases에서 `.exe` 다운로드**
```powershell
# GitHub Releases 페이지에서 최신 Windows .exe 다운로드
# 예: https://github.com/tashfeenahmed/freellmapi/releases
start "https://github.com/tashfeenahmed/freellmapi/releases"
```

다운로드 후 `.exe` 실행 → 대시보드에서 API 키 확인 → 클라이언트 연동.

### 5.2 로컬 서버 설치 (Docker 원클릭, 리눅스/맥 또는 WSL2)

Docker가 설치된 환경(WSL2 포함)에서만 실행 가능.

```powershell
# FreeLLAMAPI 서버 원클릭 설치 (리눅스/맥 전용, Windows는 WSL2 필요)
curl -fsSL https://freellmapi.co/install.sh | bash
```

> **중요**: 위 명령은 Bash 기반 설치 스크립트이므로 Windows PowerShell에서는 직접 실행할 수 없다. Windows에서는 Microsoft Store 앱 또는 `.exe`를 사용하거나, WSL2 내에서 Docker와 함께 위 명령을 실행한다.

### 5.3 로컬 개발 (소스 빌드, docker compose)

소스 코드를 직접 빌드해 기동하려는 경우:

```powershell
# 저장소 클론
git clone https://github.com/tashfeenahmed/freellmapi.git
cd freellmapi

# 의존성 설치 (Node.js 20+, npm)
npm install

# 암호화 키 생성 및 환경 변수 설정
# ENCRYPTION_KEY는 제공자 키 암호화에 사용됨 (반드시 안전하게 보관)
$env:ENCRYPTION_KEY = [Convert]::ToBase64String(([System.Security.Cryptography.RandomNumberGenerator]::Create()).GetBytes(32))

# .env 파일 생성 예시
@'
PORT=3001
ENCRYPTION_KEY=<생성된_키_값>
'@ | Set-Content -LiteralPath ".env" -Encoding utf8

# Docker Compose로 서버 기동
docker compose up -d

# 헬스체크
curl -s http://localhost:3001/v1/models | ConvertFrom-Json | Select-Object -First 5
```

도커 없이 Node.js로 직접 기동하려면 저장소의 시작 스크립트(`package.json`의 `start`/`dev`)를 참조한다.

### 5.4 API 키 발급 및 클라이언트 연동

서버 기동 후 대시보드(보통 `http://localhost:3001` 또는 별도 대시보드 경로)의 **Keys 페이지**에서 통합 API 키를 발급받는다.

```powershell
# 환경 변수에 API 키 저장 (현재 세션)
$env:FREELLM_API_KEY = "<대시보드 Keys 페이지에서 발급받은 키>"

# OpenAI SDK 연동 예시 (Node.js)
# base_url을 http://localhost:3001/v1로 지정
```

Python OpenAI SDK 예시:

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:3001/v1",
    api_key="<대시보드 Keys 페이지에서 발급받은 키>",
)

response = client.chat.completions.create(
    model="free-model",  # 라우팅에 의해 자동 할당
    messages=[{"role": "user", "content": "안녕하세요"}],
)
print(response.choices[0].message.content)
```

> **중요**: Docker는 서버 설치에 필수 조건이다. Docker가 없다면 Windows용 Microsoft Store 앱/`.exe`를 사용하거나 WSL2 + Docker 환경을 먼저 구축해야 한다.

---

## 6. 팀 에이전트별 분석

### 6.1 제품팀 (Product)

**포지셔닝**: "무료 LLM API의 단일 창구". 87개 제공자, 1,313개 엔드포인트를 일일이 관리할 필요 없이 하나의 OpenAI 호환 `/v1` 엔드포인트로 모든 무료 모델에 접근할 수 있게 해준다. 개인 개발자와 학습자에게 진입 장벽을 크게 낮춘다.

**타겟 사용자**:
- 개인 개발자 / 학습자 (프로덕션 غير 지원)
- 프로토타이핑 및 PoC 제작자
- 여러 무료 모델을 비교·실험하려는 사용자

**차별 포인트**:
- 87개 무료 제공자 / 1,313개 무료 엔드포인트 풀
- 단일 OpenAI 호환 엔드포인트 (`/v1`)
- 스마트 라우팅 + 자동 페일오버
- 암호화된 키 관리
- 로컬 서버로 실행 가능 (데이터 로컬 잔류)

### 6.2 개발팀 (Engineering)

**아키텍처 구성요소**:
1. **단일 `/v1` 엔드포인트**: OpenAI 호환 API 입구 (`http://localhost:3001/v1`)
2. **스마트 라우터**: 87개 제공자 중 최적 엔드포인트 선택 로직
3. **자동 페일오버**: 제공자 장애/속도 제한 시 대체 제공자 전환
4. **암호화 키 저장소**: `ENCRYPTION_KEY` 기반 제공자 키 암호화/복호화
5. **Docker Compose**: 로컬 서버 기동 및 오케스트레이션
6. **사용량 API**: `GET /v1/usage`로 월 사용량/할당량 조회

**설치 의존성**: Docker(필수), Node.js 20+ 및 npm(소스 빌드), git.

**연동 포인트**:
- 클라이언트: OpenAI SDK, `base_url = http://localhost:3001/v1`
- 인증: 대시보드 Keys 페이지의 통합 API 키 (`Authorization: Bearer`)
- 사용량 모니터링: `GET /v1/usage`
- 서버 기동: Docker 원클릭 또는 `docker compose up -d`

**실패 처리(fail-soft)**:
- 제공자 장애 → 자동 페일오버로 다음 제공자 시도
- 할당량 초과 → 429 `quota_exceeded` 반환, 클라이언트는 재시도 간격 조정 필요
- 라우터 오류 → 요청 실패, 단일 엔드포인트 장애 시 전체 영향 (로컬 서버 재기동 필요)

### 6.3 마케팅팀 (Marketing)

**메시징 포인트**:
- "87개 무료 제공자, 1,313개 무료 모델 엔드포인트. 하나의 엔드포인트로 모두 이용."
- OpenRouter 순위 2위 랭크 노출 (무료 LLM API 부문)
- 무료 진입 장벽 낮음 (가입/키 발급만으로 즉시 사용 가능)
- OpenAI SDK 호환으로 기존 코드 재사용 용이

**채널 전략**:
- OpenRouter 2위 랭크 활용 (신규/트렌드 서비스 이미지)
- 개인 개발자, 학생, 학습자 커뮤니티 타겟팅
- "무료 LLM API" 키워드로 검색 유입 확보

**주의사항**: "개인 실험 전용, 프로덕션 비권장" 문구를 명확히 명시하여 상업적 사용 기대를 관리해야 한다. 프로덕션 도입 시 OpenRouter 등 유료 제공자로 마이그레이션 경로를 안내.

### 6.4 운영팀 (Operations)

**인프라**:
- 로컬 서버: Docker 컨테이너(`docker compose up -d`)로 사용자 머신에서 기동
- Windows: Microsoft Store 앱 또는 `.exe` (도커 원클릭 스크립트 비적용)
- 서버 설치 시 Docker 필수

**모니터링**:
- 헬스체크: `curl http://localhost:3001/v1/models` (또는 제공 엔드포인트)
- 사용량: `GET /v1/usage` (월 사용량, 할당량)
- 오류: 429 `quota_exceeded`, 제공자 페일오버 로그

**백업/마이그레이션**:
- 서버 데이터/설정: Docker 볼륨 또는 설치 디렉터리
- `ENCRYPTION_KEY`: 분실 시 암호화된 제공자 키 복구 불가 → 안전하게 백업(비밀번호 관리자 등)
- API 키: 대시보드 Keys 페이지에서 재발급 가능, 유출 시 즉시 교체

### 6.5 데이터팀 (Data)

**데이터 모델**:
- 사용량 기록: 요청 수, 토큰 소비, 제공자별 분배, 타임스탬프
- 할당량: 월 상한, 잔여량, 429 발생 이력
- 제공자 상태: 가용성, 응답 시간, 페일오버 회수

**분석 가능 항목**:
- 월간 토큰 소비 추이 (101억 토큰/월 규모 전체 트렌드 참고)
- 제공자별 성공률 및 지연 시간
- 할당량 초과 패턴과 최적 모델 선택
- 무료 모델 간 품질/비용 비교

**주의**: 무료 제공자 특성상 데이터 보존 정책 및 개인정보 처리 방침을 확인 후 민감 데이터 입력 금지.

### 6.6 파트너십팀 (Partnerships)

**연동 가능 파트너**:
- OpenAI 호환 SDK 생태계 (Python, Node.js, 커뮤니티 클라이언트)
- 87개 무료 LLM 제공자 (FreeLLAMAPI가 라우팅 대상)
- 에이전트 호스트 (Claude Code, Cursor, OpenCode 등 OpenAI 호환 클라이언트)

**제휴 기회**:
- OpenRouter와 비교 포지셔닝: 무료 모델 중심 vs 유료 크레딧 중심
- 에이전트 도구와의 연동: `base_url` 하나로 무료 모델 풀에 접근
- 교육/학습 기관 대상 무료 LLM API 공급 파트너십

---

## 7. 요금 및 라이선스

| 항목 | 내용 |
|------|------|
| 서비스 요금 | 무료 (87개 제공자, 1,313개 엔드포인트) |
| 사용 목적 | 개인 실험 전용 (프로덕션 비권장) |
| 월 처리 규모 | 약 101억 토큰 |
| 할당량 | 제공자별 월 상한, 초과 시 429 `quota_exceeded` |
| 라이선스 | 오픈 소스 (GitHub: github.com/tashfeenahmed/freellmapi) |
| 배포 형태 | Docker 원클릭, Docker Compose, Microsoft Store 앱, `.exe` |

무료 제공자 특성상 안정성/가용성 보장(SLA)이 제한적이며, 프로덕션 트래픽에는 부적합하다. 중요 업무에는 OpenRouter 등 유료 제공자로 전환을 고려해야 한다.

---

## 8. 실습 체크리스트 (이 폴더에서)

- [ ] Docker 설치 확인 (`docker --version`, 서버 설치 시 필수)
- [ ] Windows: Microsoft Store 앱 설치 또는 GitHub Releases에서 `.exe` 다운로드/실행
- [ ] (WSL2/도커 환경) `curl -fsSL https://freellmapi.co/install.sh \| bash` 실행
- [ ] (소스 빌드) `git clone`, `npm install`, `.env`에 `ENCRYPTION_KEY` 설정, `docker compose up -d`
- [ ] 서버 기동 확인: `curl -s http://localhost:3001/v1/models`
- [ ] 대시보드 Keys 페이지에서 통합 API 키 발급 및 보관
- [ ] OpenAI SDK 연동: `base_url = http://localhost:3001/v1`, `api_key` 설정 후 채팅 요청 테스트
- [ ] 사용량 조회: `GET /v1/usage`로 월 사용량/할당량 확인
- [ ] 페일오버 확인: 한 제공자 장애 시 자동 대체 제공자 동작 관찰
- [ ] 429 `quota_exceeded` 처리: 월 할당량 초과 시 응답 코드 확인 및 재시도 로직 검토
- [ ] (보안) `ENCRYPTION_KEY`와 API 키를 안전하게 보관, 커밋 금지(.gitignore 추가)
- [ ] (참고) 기존 OpenRouter 키는 `C:\work\openrouter\open_router\doc\01_apikey.md`에 별도 보관, FreeLLAMAPI 키와 혼용하지 않음

---

## 9. 위험 및 주의사항

1. **프로덕션 비권장**: 개인 실험 전용 서비스. 중요 업무 도입 전 안정성, 백업, 복구 절차 검증 필수.
2. **Docker 필수**: 서버 설치(도커 원클릭/Compose)에는 Docker가 반드시 필요함. Windows에서는 Microsoft Store 앱 또는 `.exe` 사용.
3. **API 키 보안**: 통합 API 키와 `ENCRYPTION_KEY`를 유출하지 않도록 관리. `.env` 및 설정 파일은 커밋 금지.
4. **할당량 초과**: 무료 제공자 월 상한 초과 시 429 `quota_exceeded` 반환. 재시도 로직과 대체 모델 확보 필요.
5. **제공자 의존성**: 87개 무료 제공자의 가용성/정책 변경에 직접 영향. 단일 엔드포인트 장애 시 전체 트래픽 영향.
6. **민감 데이터 입력 금지**: 무료 제공자 특성상 입력 데이터 처리 정책 확인 후 사용. API 키, 비밀번호 등 시크릿 입력 자제.
7. **OpenRouter 키 분리**: 기존 OpenRouter 키(`sk-or-v1-...`, `C:\work\openrouter\open_router\doc\01_apikey.md`)는 FreeLLAMAPI와 별도 관리. 혼용/노출 주의.

---

## 10. 참고 링크

- 공식 사이트: https://freellmapi.co/
- 설치 스크립트: https://freellmapi.co/install.sh
- GitHub: https://github.com/tashfeenahmed/freellmapi
- GitHub Releases (Windows .exe): https://github.com/tashfeenahmed/freellmapi/releases
- OpenAI SDK 문서: https://platform.openai.com/docs/libraries
- OpenRouter: https://openrouter.ai/
- 기존 OpenRouter API 키 문서: C:\work\openrouter\open_router\doc\01_apikey.md
