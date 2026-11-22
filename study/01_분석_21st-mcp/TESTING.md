# TESTING.md — 01_분석_21st-mcp (Glass Folder Cards 데모)

대상: `C:\work\openrouter\study/01_분석_21st-mcp/`  
UI: Next.js 14 + React 18 + Tailwind CSS + Glass Folder Cards 컴포넌트 (`app/page.tsx`, `components/ui/glass-folder-cards.tsx`)  
개발 서버: `npm run dev` (포트 3000, Next.js 기본)  
작성 언어: 한국어

---

## 1. 수동 테스트 체크리스트

### 1.1 접근성 (WCAG 2.1 AA)

| # | 검사 항목 | 예상 결과 | 담당 |
|---|-----------|-----------|------|
| A1 | `<html lang="en">` 설정 | 스크린 리더가 영어로 읽음 | QA |
| A2 | `sr-only` 클래스로 숨겨진 제목("Glass Folder Cards Demo") | 스크린 리더만 인식, 시각적 숨김 | QA |
| A3 | 폴더 히트 영역(`gf-hit`)에 `aria-expanded`, `aria-label` | "Open/Close 폴더명, N items" 발표 | QA |
| A4 | 추가 버튼(`gf-key--add`)에 `aria-label="Add a file to ..."` | 버튼 목적 발표 | QA |
| A5 | 더보기 버튼(`gf-key--more`)에 `aria-haspopup="menu"`, `aria-expanded` | 메뉴 상태 발표 | QA |
| A6 | 메뉴 항목에 `role="menuitem"` | 메뉴 아이템으로 발표 | QA |
| A7 | 메뉴 영역에 `role="menu"`, `aria-label="... options"` | 메뉴 영역 발표 | QA |
| A8 | 파일 시트에 `role="button"` 또는 `<a>` (href 시) | 파일 요소로 발표 | QA |
| A9 | `filesRef`에 `role="list"`, `aria-label` | 폴더 내용물 목록 발표 | QA |
| A10 | 파일 항목에 `role="listitem"` | 목록 항목 발표 | QA |
| A11 | `:focus-visible` 아웃라인 (폴더 히트, 키, 시트, 메뉴 아이템) | 포커스 시각적 표시 | QA |
| A12 | Escape 키로 오픈된 폴더/메뉴 닫기 | 포커스 복원과 함께 닫힘 | QA |
| A13 | 메뉴 키보드 탐색 (ArrowUp/Down, Home, End, Tab) | 메뉴 항목 간 이동 가능 | QA |
| A14 | `prefers-reduced-motion` 시 애니메이션 비활성화 | 진입/호버 애니메이션 없음 | QA |
| A15 | 터치 타겟 44×44px 이상 (폴더 히트, 키, 시트, 메뉴) | 모바일에서 터치 용이 | QA |

### 1.2 모바일 (브레이크포인트: md ≥ 768px, xl ≥ 1200px)

| # | 검사 항목 | 예상 결과 | 담당 |
|---|-----------|-----------|------|
| M1 | `< 768px`에서 단일 컬럼 그리드 (`grid-cols-1`) | 폴더가 세로로 배치 | QA |
| M2 | `≥ 768px`에서 2컬럼 (`md:grid-cols-2`) | 폴더가 2열로 배치 | QA |
| M3 | `≥ 1200px`에서 3컬럼 (`xl:grid-cols-3`) | 폴더가 3열로 배치 | QA |
| M4 | 뷰포트 메타 태그 (Next.js 기본) | 모바일에서 적절히 축소 | QA |
| M5 | 터치 제스처 (스와이프, 탭) 정상 동작 | 스크롤/탭 원활 | QA |
| M6 | 폴더 크기 (`width` prop, 기본 340px) 모바일에서 적절히 표시 | 화면 내에서 잘리지 않음 | QA |
| M7 | 캔버스 아트워크 로딩 (모바일) | 아트워크가 캔버스에 그려짐 | QA |

### 1.3 키보드 네비게이션

| # | 검사 항목 | 예상 결과 | 담당 |
|---|-----------|-----------|------|
| K1 | 모든 대화형 요소가 Tab 순서 도달 가능 | 탭으로 폴더 히트, 키, 시트, 메뉴 도달 | QA |
| K2 | Enter/Space로 폴더 열기/닫기 토글 | 폴더 상태 전환 | QA |
| K3 | Enter/Space로 파일 시트 선택 | `onFileSelect` 호출 | QA |
| K4 | `+` 키(추가 버튼) Enter/Space로 새 파일 추가 | 파일 추가, 카운트 증가 | QA |
| K5 | `···` 키(더보기 버튼) Enter/Space로 메뉴 열기 | 메뉴 표시, 첫 번째 항목 포커스 | QA |
| K6 | 메뉴 내에서 ArrowUp/Down으로 항목 이동 | 메뉴 항목 간 포커스 이동 | QA |
| K7 | 메뉴 항목 Enter로 선택 | 메뉴 동작 실행, 메뉴 닫힘, 포커스 복원 | QA |
| K8 | Escape로 메뉴 닫기 | 메뉴 닫힘, 키 버튼으로 포커스 복원 | QA |
| K9 | Escape로 열린 폴더 닫기 | 폴더 닫힘, 히트 영역으로 포커스 복원 | QA |
| K10 | 포커스 밖 클릭 시 폴더/메뉴 닫기 | 외부 클릭 시 닫힘 | QA |

### 1.4 스크린 리더 (NVDA / JAWS / VoiceOver)

| # | 검사 항목 | 예상 결과 | 담당 |
|---|-----------|-----------|------|
| SR1 | 페이지 로드 시 `sr-only` 제목 발표 | "Glass Folder Cards Demo" 발표 (시각적 숨김) | QA |
| SR2 | 폴더 포커스 시 `aria-label` 발표 | "Open My Files, 3 items, 버튼" 발표 | QA |
| SR3 | 폴더 열기 상태 변경 시 `aria-expanded` 변경 발표 | "expanded"/"collapsed" 발표 | QA |
| SR4 | 파일 시트 포커스 시 이름 발표 | 파일명 발표 | QA |
| SR5 | 메뉴 오픈 시 메뉴 역할과 첫 항목 포커스 발표 | "메뉴, Open folder, 메뉴 항목" 발표 | QA |
| SR6 | 새 파일 추가 시 변화 발표 | 파일 추가, 카운트 업데이트 | QA |
| SR7 | 캔버스 아트워크에 `aria-hidden="true"` | 스크린 리더가 아트워크 무시 (장식용) | QA |

---

## 2. agent-browser 테스트 시나리오

아래 명령어는 agent-browser 인터페이스를 사용한 UI 테스트 시나리오입니다.

### 2.1 앱 오픈 및 초기 상태 확인

```
agent-browser open http://localhost:3000
agent-browser wait main 5000
agent-browser snapshot main
agent-browser extract h1.sr-only textContent  # "Glass Folder Cards Demo" (sr-only)
```

예상 결과: 3개의 GlassFolder 카드 ("My Files", "Archives", "Personal Documents")가 그리드에 표시됨

### 2.2 폴더 열기/닫기 (My Files)

```
agent-browser open http://localhost:3000

# 첫 번째 폴더("My Files") 클릭
agent-browser click [aria-label*="Open My Files"]:first-child
# 또는 .gf-root:first-child 클릭

# 폴더 오픈 상태 대기
agent-browser wait [data-open] 3000

# 스냅샷: 폴더 오픈 상태
agent-browser snapshot .gf-root:first-child

# 파일 시트 클릭 (첫 번째 파일)
agent-browser click .gf-root:first-child .gf-sheet:first-child

# 폴더 닫기 (다시 클릭 또는 Escape)
agent-browser click [aria-label*="Close My Files"]:first-child

# 스냅샷: 폴더 닫힘 상태
agent-browser snapshot .gf-root:first-child
```

### 2.3 더보기 메뉴 (Archives 폴더)

```
agent-browser open http://localhost:3000

# 두 번째 폴더("Archives")의 더보기 버튼 클릭
agent-browser click .gf-root:nth-child(2) .gf-key--more

# 메뉴 오픈 대기
agent-browser wait [role="menu"][data-open] 3000

# 스냅샷: 메뉴 오픈 상태
agent-browser snapshot .gf-root:nth-child(2) .gf-menu

# 메뉴 항목 클릭 ("Rename")
agent-browser click [role="menuitem"]:first-child

# 메뉴 닫힘 확인
agent-browser wait [role="menu"]:not([data-open]) 3000
```

### 2.4 새 파일 추가 (My Files 폴더, action="add")

```
agent-browser open http://localhost:3000

# 첫 번째 폴더("My Files")의 추가 버튼(`+`) 클릭
agent-browser click .gf-root:first-child .gf-key--add

# 새 파일 추가 대기 (애니메이션 + 상태 업데이트)
agent-browser wait .gf-sheet--drop 3000

# 스냅샷: 파일 추가 후
agent-browser snapshot .gf-root:first-child

# 파일 수 증가 확인 (metaLine)
agent-browser extract .gf-root:first-child .gf-meta textContent
```

### 2.5 키보드 네비게이션 (수동/agent-browser 조합)

```
agent-browser open http://localhost:3000

# 폴더에 Tab으로 포커스 이동 (agent-browser는 키보드 이벤트 시뮬레이션 지원 시)
# agent-browser keypress Tab  # 환경에 따라 다름

# Enter로 폴더 열기
# agent-browser keypress Enter

# Escape로 폴더 닫기
# agent-browser keypress Escape

# 스냅샷으로 상태 확인
agent-browser snapshot main
```

### 2.6 캔버스 아트워크 로딩

```
agent-browser open http://localhost:3000

# 아트워크 캔버스 로딩 대기 (data-ready 속성)
agent-browser wait canvas[data-ready] 10000

# 스냅샷: 아트워크 로드 완료
agent-browser snapshot .gf-art

# 캔버스에 픽셀이 그려졌는지 확인
agent-browser extract canvas.gf-art[data-ready] width
agent-browser extract canvas.gf-art[data-ready] height
```

### 2.7 인터랙션 조합 시나리오

```
agent-browser open http://localhost:3000

# 1. 폴더 열기
agent-browser click .gf-root:first-child
agent-browser wait [data-open] 3000

# 2. 파일 선택
agent-browser click .gf-root:first-child .gf-sheet:first-child

# 3. 폴더 닫기
agent-browser click [aria-label*="Close"]:first-child

# 4. 더보기 메뉴 오픈
agent-browser click .gf-root:first-child .gf-key--more
agent-browser wait [role="menu"][data-open] 3000

# 5. 메뉴 항목 선택 후 닫힘 확인
agent-browser click [role="menuitem"]:nth-child(2)
agent-browser wait [role="menu"]:not([data-open]) 3000

# 6. 최종 상태 스냅샷
agent-browser snapshot main
```

---

## 3. 브라우저 호환성 매트릭스

| 브라우저 | 버전 | OS | 폴더 열기/닫기 | 파일 시트 클릭 | 더보기 메뉴 | 새 파일 추가 | 캔버스 아트워크 | 키보드 네비 | 스크린 리더 | 비고 |
|----------|------|-----|----------------|----------------|-------------|--------------|-----------------|-------------|-------------|------|
| Chrome | 120+ | Windows/macOS | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (NVDA/JAWS) | 기준 브라우저 |
| Edge | 120+ | Windows | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (Narrator) | Chromium 기반 |
| Firefox | 120+ | Windows/macOS | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (NVDA) | `backdrop-filter` 부분 지원 |
| Safari | 17+ | macOS/iOS | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (VoiceOver) | `-webkit-backdrop-filter` 필요 |
| Chrome (Android) | 120+ | Android | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ (TalkBack) | 터치 타겟 44px 확인 |
| Safari (iOS) | 17+ | iOS | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ (VoiceOver) | 뷰포트, 터치 이벤트 확인 |

- ✅: 정상 동작
- ⚠️: 부분 동작 / 수동 확인 필요

**중점 테스트 항목:**
- `backdrop-filter`: Safari는 `-webkit-backdrop-filter` 필요, Firefox 구버전은 미지원 가능
- `IntersectionObserver`: 폴더 입장 애니메이션 트리거, 모든 현대 브라우저 지원
- `ResizeObserver`/`devicePixelRatio`: 캔버스 아트워크 해상도 조정
- Canvas `putImageData`/`drawImage`: 아트워크 렌더링
- CSS `all: unset` (`.gf-sheet`): 브라우저별 기본 스타일 리셋 일관성

---

## 4. 성능 벤치마크

| 항목 | 측정 지표 | 목표값 | 측정 방법 | 담당 |
|------|-----------|---------|-----------|------|
| P1 | 페이지 초기 로드 (LCP) | < 2.5초 | Lighthouse / DevTools | QA |
| P2 | 폴더 입장 애니메이션 (IntersectionObserver → appearDelay) | < 1.5초 (전체 폴더) | DevTools Performance | QA |
| P3 | 캔버스 아트워크 생성 및 렌더링 | < 300ms per canvas | performance.now(), DevTools | QA |
| P4 | 폴더 오픈/닫기 전환 | < 400ms | DevTools Performance (CSS 트랜지션) | QA |
| P5 | 새 파일 추가 애니메이션 | < 600ms | DevTools Performance | QA |
| P6 | 메뉴 오픈/닫기 | < 200ms | DevTools Performance | QA |
| P7 | 메모리 누수 (폴더 반복 오픈/닫기 20회) | 누적 증가 없음 | Chrome DevTools Memory | QA |
| P8 | Lighthouse 접근성 점수 | ≥ 90 | Lighthouse 감사 | QA |
| P9 | Lighthouse 성능 점수 | ≥ 90 | Lighthouse 감사 | QA |

**agent-browser 성능 측정 예시:**

```
agent-browser open http://localhost:3000
agent-browser wait main 5000
agent-browser snapshot main  # 로드 완료 시점 기록
agent-browser wait canvas[data-ready] 10000  # 모든 캔버스 로드 대기
```

---

## 5. 오류 시나리오 테스트

| # | 시나리오 | 재현 방법 | 예상 결과 | 담당 |
|---|----------|-----------|-----------|------|
| E1 | 개발 서버 다운 | `npm run dev` 프로세스 종료 후 새로고침 | 연결 불가 오류 | QA |
| E2 | 캔버스 아트워크 생성 실패 | Canvas API 비지원 환경 (매우 드묾) | 폴더는 표시되지만 아트워크는 빈 공간 | QA |
| E3 | IntersectionObserver 미지원 | 구 브라우저 | `appear` 없이 바로 표시됨 (폴백 동작) | QA |
| E4 | 파일 시트 클릭 시 `onFileSelect` 미정의 | 기본 폴더("My Files") 파일 클릭 | 아무 동작 없음 (에러 아님) | QA |
| E5 | 더보기 메뉴 항목 `onSelect` 미정의 | "My Files" 폴더의 더보기 메뉴 (`menu` prop 없음) | "Open folder"/"Close folder"만 작동 | QA |
| E6 | 빠른 연속 클릭 (폴더 오픈/닫기) | 폴더를 빠르게 여러 번 클릭 | 상태 일관성 유지, 애니메이션 큐잉 | QA |
| E7 | 포커스 트랩 예외 상황 | 메뉴 오픈 상태에서 외부 클릭 | 메뉴 닫힘 | QA |
| E8 | 큰 `width` prop (화면 초과) | `width={1000}` 등 | 폴더가 화면 밖으로 넘칠 수 있음 (컨테이너 제한) | QA |
| E9 | 파일이 0개인 폴더 | `files={[]}` | 빈 폴더 표시, 키 버튼만 작동 | QA |
| E10 | `appearDelay` 매우 큰 값 | `appearDelay={5000}` | 폴더 입장이 지연되어 표시 | QA |

**agent-browser 오류 테스트 예시:**

```
# 헬스체크 (Next.js 기본)
agent-browser open http://localhost:3000
agent-browser wait main 5000

# 잘못된 경로 (404)
agent-browser open http://localhost:3000/nonexistent
agent-browser extract body textContent  # Next.js 404 페이지 예상
```

---

## 6. 회귀 테스트 케이스

| ID | 테스트 케이스 | 사전 조건 | 실행 단계 | 예상 결과 | 자동화 여부 |
|----|--------------|-----------|-----------|-----------|-------------|
| R1 | 폴더 열기/닫기 토글 | 서버 실행 중 | 1. 앱 오픈 2. 폴더 히트 클릭 3. `data-open` 확인 4. 다시 클릭 | 폴더 상태 전환 (`data-open` 추가/제거) | agent-browser |
| R2 | 파일 시트 선택 | 폴더 오픈 상태 | 1. 폴더 열기 2. 파일 시트 클릭 3. `onFileSelect` 확인 | 파일 선택 이벤트 발생 | agent-browser / 수동 |
| R3 | 새 파일 추가 | `action="add"` 폴더 | 1. `+` 버튼 클릭 2. 파일 추가 대기 | 새 시트 추가, 카운트 증가 | agent-browser |
| R4 | 더보기 메뉴 오픈/닫기 | `action="more"` 폴더 | 1. `···` 버튼 클릭 2. 메뉴 항목 클릭 | 메뉴 표시 → 선택 후 닫힘 | agent-browser |
| R5 | 메뉴 키보드 탐색 | 메뉴 오픈 상태 | 1. ArrowDown으로 이동 2. Enter로 선택 | 항목 간 포커스 이동, 선택 실행 | 수동 |
| R6 | Escape로 폴더/메뉴 닫기 | 폴더 오픈 또는 메뉴 오픈 | 1. Escape 키 입력 | 닫힘, 포커스 복원 | 수동 |
| R7 | 외부 클릭으로 닫기 | 폴더 오픈 상태 | 1. 폴더 외부 클릭 | 폴더 닫힘 | 수동 / agent-browser |
| R8 | 캔버스 아트워크 로딩 | 서버 실행 중 | 1. 앱 오픈 2. `canvas[data-ready]` 확인 | 모든 캔버스에 `data-ready` 속성 | agent-browser |
| R9 | 그리드 레이아웃 (1/2/3열) | 뷰포트 크기 변경 | 1. 모바일 → 태블릿 → 데스크톱 뷰포트 전환 | 각각 1/2/3컬럼 그리드 | agent-browser / 수동 |
| R10 | `aria-expanded` 상태 변경 | 폴더 오픈/닫기 | 1. 폴더 히트 요소 검사 2. 상태 확인 | `aria-expanded="true/false"` 정확 | agent-browser |
| R11 | `aria-haspopup="menu"` | 더보기 버튼 | 1. `gf-key--more` 요소 검사 | `aria-haspopup="menu"` 속성 존재 | agent-browser |
| R12 | `role="menuitem"` | 메뉴 항목 | 1. 메뉴 오픈 2. 항목 요소 검사 | `role="menuitem"` 존재 | agent-browser |
| R13 | 파일 `role="listitem"` | 폴더 내용물 | 1. 폴더 오픈 2. 시트 요소 검사 | `role="listitem"` 존재 | agent-browser |
| R14 | 포커스 복원 (폴더 닫기) | 폴더 오픈 상태 | 1. 폴더 닫기 2. 포커스 요소 확인 | 히트 영역(`gf-hit`)으로 포커스 복원 | 수동 |
| R15 | 포커스 복원 (메뉴 닫기) | 메뉴 오픈 상태 | 1. 메뉴 항목 선택 2. 포커스 확인 | 키 버튼(`gf-key`)으로 포커스 복원 | 수동 |

---

## 7. 테스트 실행 명령어 요약 (agent-browser)

```bash
# 1. 앱 오픈 및 초기 상태 확인
agent-browser open http://localhost:3000
agent-browser wait main 5000
agent-browser snapshot main

# 2. 폴더 열기/닫기 (첫 번째 폴더)
agent-browser click .gf-root:first-child
agent-browser wait [data-open] 3000
agent-browser snapshot .gf-root:first-child
agent-browser click [aria-label*="Close"]:first-child

# 3. 파일 선택
agent-browser click .gf-root:first-child .gf-sheet:first-child

# 4. 더보기 메뉴 (두 번째 폴더)
agent-browser click .gf-root:nth-child(2) .gf-key--more
agent-browser wait [role="menu"][data-open] 3000
agent-browser snapshot .gf-root:nth-child(2) .gf-menu
agent-browser click [role="menuitem"]:first-child

# 5. 새 파일 추가 (첫 번째 폴더)
agent-browser click .gf-root:first-child .gf-key--add
agent-browser wait .gf-sheet--drop 3000
agent-browser snapshot .gf-root:first-child

# 6. 캔버스 아트워크 로딩 확인
agent-browser wait canvas[data-ready] 10000
agent-browser extract canvas.gf-art[data-ready] width

# 7. 스냅샷 비교 (회귀 테스트)
agent-browser snapshot main  # 기준 스냅샷 저장 후 비교
```

---

## 8. Next.js 개발 서버 실행 (테스트 전)

```powershell
# 프로젝트 디렉토리로 이동
cd C:\work\openrouter\study\01_분석_21st-mcp

# 의존성 설치 (최초 1회)
npm install

# 개발 서버 실행
npm run dev

# 브라우저에서 http://localhost:3000 접속
```

**프로덕션 빌드 테스트:**

```powershell
npm run build
npm run start
# http://localhost:3000 에서 프로덕션 빌드 테스트
```

---

**작성 완료**: `C:\work\openrouter\study/01_분석_21st-mcp/TESTING.md`  
**관련 문서**: `01_분석_21st-mcp.md`, `01_로그인폼_컴포넌트_결과.md`, `INTEGRATION_GUIDE.md`, `components/ui/glass-folder-cards.tsx`