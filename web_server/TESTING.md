# TESTING.md — OpenRouter 웹 서버 (문서 뷰어)

대상: `C:\work\openrouter\web_server/`  
UI: Vanilla HTML/CSS/JS (`public/index.html`, `public/style.css`, `public/app.js`)  
백엔드: Express API (`src/server.js`, 포트 3000)  
작성 언어: 한국어

---

## 1. 수동 테스트 체크리스트

### 1.1 접근성 (WCAG 2.1 AA)

| # | 검사 항목 | 예상 결과 | 담당 |
|---|-----------|-----------|------|
| A1 | `<html lang="ko">`로 한국어 음성 합성 적용 | 스크린 리더가 한국어로 읽음 | QA |
| A2 | 스킵 링크(`#main`)가 탭 순서 첫 번째 요소로 포커스 가능 | Tab 1회로 스킵 링크 도달, Enter로 본문 이동 | QA |
| A3 | 모든 버튼에 `aria-label` 또는 접근 가능한 이름 | 스크린 리더가 버튼 목적 발표 | QA |
| A4 | 검색 입력에 `<label>` + `aria-label="문서 검색"` | 입력 목적 명확히 발표 | QA |
| A5 | 상태 메시지에 `aria-live="polite"` | 동적 상태 변경이 발표됨 | QA |
| A6 | 뷰어 오버레이 `role="dialog"`, `aria-modal="true"` | 모달이 대화상자로 발표 | QA |
| A7 | 그리드 영역 `role="region"`, `aria-label="문서 목록"` | 지역 탐색 가능 | QA |
| A8 | 카드에 `role="button"`, `aria-label`(파일/폴더명) | 카드 목적 발표 | QA |
| A9 | `:focus-visible` 아웃라인 표시 (버튼, 입력, 카드) | 포커스 시각적 표시 | QA |
| A10 | 터치 타겟 44×44px 이상 (`.nav-item`, 툴바 버튼, 뷰어 버튼) | 모바일에서 터치 용이 | QA |
| A11 | `prefers-reduced-motion` 시 애니메이션 비활성화 | 애니메이션 없음 | QA |

### 1.2 모바일 (브레이크포인트 768px)

| # | 검사 항목 | 예상 결과 | 담당 |
|---|-----------|-----------|------|
| M1 | 뷰포트 메타 태그 `width=device-width, initial-scale=1.0` | 모바일에서 적절히 축소 | QA |
| M2 | `< 768px`에서 레이아웃 세로 스택 (사이드바 상단 바) | 단일 컬럼, 가로 스크롤 없음 | QA |
| M3 | 사이드바 `width: 100%`, `flex-direction: column` | 브랜드/네비/검색 세로 배치 | QA |
| M4 | 그리드 `grid-template-columns: 1fr` | 카드가 한 줄에 하나씩 | QA |
| M5 | 검색 입력/버튼 전체 너비, `min-height: 48px` | 터치 타겟 충분 | QA |
| M6 | `100dvh` 적용, 주소 표시줄 가시 여부에 하단 잘림 없음 | 뷰포트 안전 | QA |
| M7 | 터치 제스처 (스와이프 스크롤, 탭) 정상 동작 | 스크롤/탭 원활 | QA |

### 1.3 키보드 네비게이션

| # | 검사 항목 | 예상 결과 | 담당 |
|---|-----------|-----------|------|
| K1 | 모든 대화형 요소가 Tab 순서 도달 가능 | 탭으로 모든 버튼/입력/카드 도달 | QA |
| K2 | Shift+Tab으로 역방향 이동 가능 | 역탭 정상 | QA |
| K3 | Enter/Space로 카드(폴더/파일) 동작 실행 | 폴더 진입 또는 뷰어 열기 | QA |
| K4 | Escape로 뷰어 오버레이 닫기 | 뷰어 닫히고 포커스 복원 | QA |
| K5 | 검색 입력 Enter로 검색 실행 | 검색 결과 표시 | QA |
| K6 | 뷰어 오버레이 내부 Tab 트랩 (포커스 순환) | 뷰어 내부에서만 포커스 이동 | QA |
| K7 | 사이드바 버튼 `.nav-item` Enter/Space 활성화 | 폴더 루트 전환 | QA |

### 1.4 스크린 리더 (NVDA / JAWS / VoiceOver)

| # | 검사 항목 | 예상 결과 | 담당 |
|---|-----------|-----------|------|
| SR1 | 페이지 로드 시 스킵 링크 발표 | "본문 콘텐츠로 건너뛰기" 발표 | QA |
| SR2 | 사이드바 `aria-label="폴더 네비게이션"` 발표 | 지역 이름 발표 | QA |
| SR3 | 카드 포커스 시 `aria-label`(파일명) 발표 | "파일명, 버튼" 발표 | QA |
| SR4 | 뷰어 오픈 시 "문서 뷰어, 대화상자" 발표 | 모달 상태 발표 | QA |
| SR5 | 상태 메시지 변경 시 `aria-live`로 발표 | "로드 중...", "준비" 발표 | QA |
| SR6 | 검색 결과 빈 상태 알림 | "문서가 없습니다" 발표 | QA |

---

## 2. agent-browser 테스트 시나리오

아래 명령어는 agent-browser 인터페이스를 사용한 UI 테스트 시나리오입니다. 실제 명령어 형식은 환경에 따라 조정하십시오.

### 2.1 공통 — 앱 오픈 및 상태 확인

```
agent-browser open http://localhost:3000
agent-browser wait .status 5000
agent-browser extract .status textContent
```

예상 결과: `.status` 텍스트가 "준비"

### 2.2 사이드바 폴더 네비게이션

```
# 앱 오픈
agent-browser open http://localhost:3000

# 스냅샷: 초기 상태 (사이드바 + 그리드)
agent-browser snapshot .layout

# 사이드바 첫 번째 버튼 클릭 (open_router/doc)
agent-browser click #nav-open_router

# 로딩 대기
agent-browser wait .status 5000
agent-browser extract .status textContent

# 스냅샷: 폴더 진입 후 그리드
agent-browser snapshot #grid

# 문서 카드 클릭 (첫 번째 카드)
agent-browser click .gf-root:first-child

# 뷰어 오버레이 대기
agent-browser wait [aria-hidden="false"] 5000

# 스냅샷: 뷰어 오픈 상태
agent-browser snapshot #viewerOverlay

# 뷰어 닫기 (Escape 또는 닫기 버튼)
agent-browser click #closeViewerBtn

# 스냅샷: 뷰어 닫힘 상태
agent-browser snapshot #viewerOverlay
```

### 2.3 검색 기능

```
agent-browser open http://localhost:3000

# 검색 입력에 텍스트 입력 (agent-browser의 입력 명령어 사용)
agent-browser click #searchInput
agent-browser extract #searchInput value  # 값이 비어있어야 함

# 검색어 입력 (예시: agent-browser에 텍스트 입력 명령이 있다면)
# agent-browser type #searchInput claude
# agent-browser click #searchBtn

# 또는 Enter 키 입력 후 대기
agent-browser wait [role="alert"] 5000
agent-browser snapshot #grid

# 검색 결과 추출
agent-browser extract #grid innerHTML

# 검색 취소 (빈 검색어로 되돌리기)
agent-browser extract #docCount textContent
```

### 2.4 문서 뷰어 (복사, 닫기)

```
agent-browser open http://localhost:3000
agent-browser click .gf-root:first-child
agent-browser wait #viewerOverlay 5000

# 뷰어 제목 추출
agent-browser extract #viewerTitle textContent

# 뷰어 콘텐츠 추출
agent-browser extract #viewerContent textContent

# 복사 버튼 클릭
agent-browser click #copyBtn

# 복사 피드백 대기 ("복사됨")
agent-browser wait [aria-checked="true"] 3000

# 뷰어 닫기
agent-browser click #closeViewerBtn
agent-browser wait [aria-hidden="true"] 3000
```

### 2.5 새로고침 및 툴바

```
agent-browser open http://localhost:3000
agent-browser click #refreshBtn
agent-browser wait .status 5000
agent-browser extract .status textContent  # "로드 중..." → "준비"

agent-browser click #addBtn
# prompt() 다이얼로그가 뜨므로 수동 확인 필요 (접근성 이슈)
agent-browser snapshot .layout
```

---

## 3. 브라우저 호환성 매트릭스

| 브라우저 | 버전 | OS | 사이드바 네비게이션 | 문서 그리드 | 뷰어 오버레이 | 검색 | 키보드 네비 | 스크린 리더 | 비고 |
|----------|------|-----|---------------------|-------------|---------------|------|-------------|-------------|------|
| Chrome | 120+ | Windows/macOS | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (NVDA/JAWS) | 기준 브라우저 |
| Edge | 120+ | Windows | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (Narrator) | Chromium 기반 |
| Firefox | 120+ | Windows/macOS | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (NVDA) | `backdrop-filter` 지원 확인 필요 |
| Safari | 17+ | macOS/iOS | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (VoiceOver) | `100dvh` 지원, `-webkit-backdrop-filter` |
| Chrome (Android) | 120+ | Android | ✅ | ✅ | ✅ | ✅ | ⚠️ (외부 키보드) | ✅ (TalkBack) | 터치 타겟 44px 확인 |
| Safari (iOS) | 17+ | iOS | ✅ | ✅ | ✅ | ✅ | ⚠️ (외부 키보드) | ✅ (VoiceOver) | 뷰포트 단위 확인 |

- ✅: 정상 동작
- ⚠️: 부분 동작 / 수동 확인 필요

**중점 테스트 항목:**
- `backdrop-filter` (유리 효과): Firefox 구버전, Safari는 `-webkit-` 접두사 필요
- `100dvh`: 모바일 Safari에서 주소 표시줄 가림 문제
- `focus-visible`: 모든 브라우저에서 포커스 링 표시 확인
- CSS Grid `auto-fill`: 그리드 컬럼 수 자동 조정

---

## 4. 성능 벤치마크

| 항목 | 측정 지표 | 목표값 | 측정 방법 | 담당 |
|------|-----------|---------|-----------|------|
| P1 | 페이지 초기 로드 (DOMContentLoaded) | < 1.5초 | DevTools Performance / Lighthouse | QA |
| P2 | API `/api/documents` 응답 시간 | < 300ms | Chrome DevTools Network | QA |
| P3 | API `/api/view` 응답 시간 | < 500ms | Chrome DevTools Network | QA |
| P4 | API `/api/search` 응답 시간 | < 500ms | Chrome DevTools Network | QA |
| P5 | 뷰어 오픈 애니메이션 | < 400ms | DevTools Performance (애니메이션) | QA |
| P6 | 그리드 렌더링 (문서 50개 기준) | < 500ms | performance.now() 측정 | QA |
| P7 | 메모리 사용량 (뷰어 반복 열기/닫기 10회) | 누적 증가 없음 | Chrome DevTools Memory | QA |
| P8 | Lighthouse 접근성 점수 | ≥ 90 | Lighthouse 감사 | QA |

**agent-browser 성능 측정 예시:**

```
agent-browser open http://localhost:3000
agent-browser wait .status 5000
agent-browser snapshot .layout  # 로드 완료 시점 기록
```

---

## 5. 오류 시나리오 테스트

| # | 시나리오 | 재현 방법 | 예상 결과 | 담당 |
|---|----------|-----------|-----------|------|
| E1 | 서버 다운 (Express 프로세스 종료) | 서버 중지 후 페이지 새로고침 | 연결 불가 오류, 오류 메시지 표시 | QA |
| E2 | 잘못된 루트 파라미터 | `/api/documents?root=invalid` 직접 요청 | HTTP 400, `{error: "Invalid root"}` | QA |
| E3 | 존재하지 않는 문서 조회 | `/api/view?root=open_router&file=missing.md` | HTTP 404, `{error: "File not found"}` | QA |
| E4 | 경로 traversal 시도 | `/api/view?root=open_router&file=../../../etc/passwd` | HTTP 403, `{error: "Access denied"}` | QA |
| E5 | 검색어 빈 문자열 | 검색 입력 비우고 검색 버튼 클릭 | 검색 실행 안 됨 또는 전체 목록 표시 | QA |
| E6 | 네트워크 지연 (느린 3G) | DevTools 네트워크 스로틀링 | 로딩 상태 표시, 타임아웃 처리 | QA |
| E7 | 큰 파일 뷰어 | 대용량 마크다운 파일 열기 | 뷰어 열림, 스크롤 가능, 차단 없음 | QA |
| E8 | 브라우저 뒤로/앞으로 버튼 | 뷰어 오픈 후 브라우저 뒤로 가기 | 뷰어 닫힘, 목록 뷰로 복귀 | QA |
| E9 | 페이지 새로고침 (뷰어 오픈 상태) | 뷰어 오픈 중 F5 | 뷰어 닫히고 초기 목록 상태로 초기화 | QA |
| E10 | JavaScript 비활성화 | 브라우저 설정에서 JS 비활성화 | 정적 HTML만 표시, 상호작용 불가 | QA |

**agent-browser 오류 테스트 예시:**

```
# E2: 잘못된 루트
agent-browser open http://localhost:3000/api/documents?root=invalid
agent-browser extract body textContent  # "Invalid root" JSON 예상

# E3: 존재하지 않는 문서
agent-browser open http://localhost:3000/api/view?root=open_router&file=nonexistent.md
agent-browser extract body textContent  # "File not found" JSON 예상

# E4: 경로 traversal
agent-browser open http://localhost:3000/api/view?root=open_router&file=../../etc/passwd
agent-browser extract body textContent  # "Access denied" JSON 예상

# E1: 헬스체크
agent-browser open http://localhost:3000/api/health
agent-browser extract body textContent  # {"status":"ok",...} 예상
```

---

## 6. 회귀 테스트 케이스

| ID | 테스트 케이스 | 사전 조건 | 실행 단계 | 예상 결과 | 자동화 여부 |
|----|--------------|-----------|-----------|-----------|-------------|
| R1 | 사이드바 폴더 전환 | 서버 실행 중 | 1. 앱 오픈 2. `#nav-study` 클릭 3. 제목 확인 | 페이지 제목이 "study/01_skill_claude"로 변경 | agent-browser |
| R2 | 문서 카드 클릭 → 뷰어 오픈 | 서버 실행 중, 문서 존재 | 1. 앱 오픈 2. 카드 클릭 3. 뷰어 오버레이 확인 | 뷰어 오버레이 표시, 문서 내용 렌더링 | agent-browser |
| R3 | 뷰어 닫기 → 목록 복귀 | 뷰어 오픈 상태 | 1. `#closeViewerBtn` 클릭 2. 오버레이 확인 | `aria-hidden="true"`, 그리드 표시 | agent-browser |
| R4 | 검색 기능 | 서버 실행 중 | 1. 검색어 입력 2. 검색 버튼 클릭 3. 결과 확인 | 일치하는 문서 결과 표시 | agent-browser |
| R5 | 검색 초기화 | 검색 결과 표시 중 | 1. 검색 입력 비움 2. 목록 뷰로 복귀 | 전체 문서 목록 재표시 | agent-browser |
| R6 | 새로고침 버튼 | 서버 실행 중 | 1. `#refreshBtn` 클릭 2. 상태 메시지 확인 | "로드 중..." → "준비", 그리드 재렌더링 | agent-browser |
| R7 | 키보드 Enter로 카드 오픈 | 서버 실행 중 | 1. 카드에 Tab으로 포커스 2. Enter 키 입력 | 뷰어 오픈 | 수동 |
| R8 | Escape로 뷰어 닫기 | 뷰어 오픈 상태 | 1. Escape 키 입력 | 뷰어 닫힘, 포커스 복원 | 수동 |
| R9 | 스킵 링크 동작 | 페이지 로드 후 | 1. Tab으로 스킵 링크 도달 2. Enter 입력 | 본문 콘텐츠로 포커스 이동 | 수동 |
| R10 | 뷰어 복사 버튼 | 뷰어 오픈 상태 | 1. `#copyBtn` 클릭 2. 피드백 확인 | "복사됨" 표시, `aria-checked="true"` | agent-browser |
| R11 | 문서 수 표시 | 서버 실행 중 | 1. 폴더 진입 2. `#docCount` 확인 | 문서 수 텍스트 표시 ("N개 항목") | agent-browser |
| R12 | 모바일 그리드 레이아웃 | 뷰포트 < 768px | 1. 모바일 뷰포트 설정 2. 그리드 확인 | 단일 컬럼 레이아웃 | agent-browser / 수동 |
| R13 | 경로 traversal 차단 | 서버 실행 중 | 1. traversal 경로 요청 2. 응답 코드 확인 | HTTP 403 | agent-browser (API 직접 호출) |
| R14 | 헬스체크 엔드포인트 | 서버 실행 중 | 1. `/api/health` 요청 2. 응답 확인 | `{"status":"ok"}` | agent-browser |
| R15 | aria-expanded 오용 확인 | 앱 오픈 | 1. 카드 요소 검사 2. 속성 확인 | `aria-expanded` 속성 없음 | 수동 |

---

## 7. 테스트 실행 명령어 요약 (agent-browser)

```bash
# 1. 앱 오픈 및 초기 상태 확인
agent-browser open http://localhost:3000
agent-browser wait .status 5000

# 2. 사이드바 폴더 전환 테스트
agent-browser click #nav-study
agent-browser wait #pageTitle 3000
agent-browser extract #pageTitle textContent

# 3. 문서 뷰어 오픈/닫기 테스트
agent-browser click .gf-root:first-child
agent-browser wait #viewerOverlay 5000
agent-browser snapshot #viewerOverlay
agent-browser click #closeViewerBtn
agent-browser wait [aria-hidden="true"] 3000

# 4. 검색 테스트
agent-browser click #searchInput
agent-browser click #searchBtn
agent-browser wait [role="alert"] 5000
agent-browser snapshot #grid

# 5. API 헬스체크
agent-browser open http://localhost:3000/api/health
agent-browser extract body textContent

# 6. 스냅샷 비교 (회귀 테스트)
agent-browser snapshot .layout  # 기준 스냅샷 저장 후 비교
```

---

**작성 완료**: `C:\work\openrouter\web_server/TESTING.md`  
**관련 문서**: `ACCESSIBILITY_AUDIT.md`, `MOBILE_RESPONSIVE.md`, `02_frontend-ui.md`, `03_backend-api.md`