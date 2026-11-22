# 교차 브라우저 테스트 계획서 (Cross-Browser Test Plan)

**프로젝트**: OpenRouter Study Document Viewer  
**경로**: `C:\work\openrouter\web_server/CROSS_BROWSER_TEST_PLAN.md`  
**대상**: Vanilla HTML/CSS/JS 문서 탐색 및 뷰어 애플리케이션  
**언어**: 한국어  
**버전**: 1.0

---

## 1. 브라우저 매트릭스 (Browser Matrix)

| 브라우저 | 최소 버전 | OS | 테스트 우선순위 | 비고 |
|----------|-----------|-----|---------------|------|
| Chrome | 120+ | Windows, macOS, Linux | P0 (기준) | 기준 브라우저 |
| Firefox | 120+ | Windows, macOS, Linux | P0 | `backdrop-filter` 미지원 버전 확인 필요 |
| Safari | 17+ | macOS, iOS | P0 | `-webkit-backdrop-filter` 접두사 필요, iOS 뷰포트 이슈 |
| Edge | 120+ | Windows | P1 | Chromium 기반, 기준과 동일 동작 예상 |
| Chrome Mobile | 120+ | Android | P1 | 터치 타겟, 뷰포트 단위 확인 |
| Safari Mobile | 17+ | iOS | P1 | `100dvh`, `-webkit-backdrop-filter`, Viewport 주소 표시줄 |

### 브라우저별 지원 범위 요약

| 브라우저 | CSS Grid | CSS Custom Properties | backdrop-filter | Fetch API | localStorage | Clipboard API | ES6+ |
|----------|----------|----------------------|-----------------|-----------|--------------|---------------|------|
| Chrome 120+ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Firefox 120+ | ✅ | ✅ | ⚠️ 부분 | ✅ | ✅ | ✅ | ✅ |
| Safari 17+ | ✅ | ✅ | ✅ (`-webkit-`) | ✅ | ✅ | ✅ | ✅ |
| Edge 120+ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Chrome Mobile 120+ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ 부분 | ✅ |
| Safari Mobile 17+ | ✅ | ✅ | ✅ (`-webkit-`) | ✅ | ✅ | ⚠️ 부분 | ✅ |

- ✅: 완전 지원
- ⚠️: 부분 지원 또는 접두사/폴백 필요

---

## 2. 기능 호환성 (Feature Compatibility)

### 2.1 CSS backdrop-filter (유리 효과)

| 브라우저 | 지원 여부 | 접두사 필요 | 폴백 전략 |
|----------|-----------|-------------|-----------|
| Chrome 120+ | 지원됨 | 불필요 | 불필요 |
| Firefox 120+ | 지원됨 (109부터 완전 지원) | 불필요 | 고정 배경색 |
| Safari 17+ | 지원됨 | `-webkit-backdrop-filter` 필요 | 고정 배경색 |
| Edge 120+ | 지원됨 | 불필요 | 불필요 |
| Chrome Mobile 120+ | 지원됨 | 불필요 | 고정 배경색 |
| Safari Mobile 17+ | 지원됨 | `-webkit-backdrop-filter` 필요 | 고정 배경색 |

**테스트 항목**:
- `.glass-panel` 요소의 `backdrop-filter: blur(16px)` 적용 확인
- `-webkit-backdrop-filter: blur(16px)` 동시 선언 확인 (Safari)
- 필터 미지원 시 `--color-surface` 고정 배경이 대체 표시되는지 확인
- 텍스트 대비 4.5:1 유지 여부 (폴백 배경 적용 시)

### 2.2 CSS Grid (문서 카드 레이아웃)

| 브라우저 | 지원 여부 | 폴백 전략 |
|----------|-----------|-----------|
| Chrome 120+ | 지원됨 | 불필요 |
| Firefox 120+ | 지원됨 | 불필요 |
| Safari 17+ | 지원됨 | 불필요 |
| Edge 120+ | 지원됨 | 불필요 |
| Chrome Mobile 120+ | 지원됨 | 불필요 |
| Safari Mobile 17+ | 지원됨 | 불필요 |

**테스트 항목**:
- `grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))` 카드 배열 확인
- 모바일 (<768px)에서 `grid-template-columns: 1fr` 단일 열 적용 확인
- 그리드 미지원 시 flexbox로 카드가 세로 스택되는지 확인 (폴백)

### 2.3 CSS Custom Properties (테마 토큰)

| 브라우저 | 지원 여부 | 폴백 전략 |
|----------|-----------|-----------|
| Chrome 120+ | 지원됨 | 불필요 |
| Firefox 120+ | 지원됨 | 불필요 |
| Safari 17+ | 지원됨 | 불필요 |
| Edge 120+ | 지원됨 | 불필요 |
| Chrome Mobile 120+ | 지원됨 | 불필요 |
| Safari Mobile 17+ | 지원됨 | 불필요 |

**테스트 항목**:
- `var(--color-bg)`, `var(--color-surface)` 등 변수 적용 확인
- `[data-tone="dark"]` 모드 전환 시 변수 값 치환 확인
- 미지원 브라우저에서 폴백 값(첫 번째 인자) 적용 확인

### 2.4 JavaScript ES6+ 기능

| 기능 | 브라우저 지원 | 폴백 필요 여부 |
|------|--------------|---------------|
| `const` / `let` | 모든 타겟 브라우저 지원 | 불필요 |
| 화살표 함수 | 모든 타겟 브라우저 지원 | 불필요 |
| 템플릿 리터럴 | 모든 타겟 브라우저 지원 | 불필요 |
| 디스트럭처링 | 모든 타겟 브라우저 지원 | 불필요 |
| 모듈 (import/export) | 모든 타겟 브라우저 지원 | 불필요 |
| async/await | 모든 타겟 브라우저 지원 | 불필요 |

**테스트 항목**:
- 콘솔 에러 없이 스크립트 로드 및 실행 확인
- `async` 함수 기반 API 호출 정상 동작 확인
- 모듈 import/export 정상 작동 확인 (사용 시)

### 2.5 Fetch API

| 브라우저 | 지원 여부 | 폴백 전략 |
|----------|-----------|-------------|
| Chrome 120+ | 지원됨 | XMLHttpRequest |
| Firefox 120+ | 지원됨 | XMLHttpRequest |
| Safari 17+ | 지원됨 | XMLHttpRequest |
| Edge 120+ | 지원됨 | XMLHttpRequest |
| Chrome Mobile 120+ | 지원됨 | XMLHttpRequest |
| Safari Mobile 17+ | 지원됨 | XMLHttpRequest |

**테스트 항목**:
- `fetch('/api/documents')` 응답 처리 확인
- 네트워크 오류 시 `catch` 블록 동작 및 오류 메시지 표시
- 타임아웃 처리 및 재시도 로직 확인

### 2.6 localStorage

| 브라우저 | 지원 여부 | 폴백 전략 |
|----------|-----------|-------------|
| Chrome 120+ | 지원됨 | 쿠키 / 메모리 폴백 |
| Firefox 120+ | 지원됨 | 쿠키 / 메모리 폴백 |
| Safari 17+ | 지원됨 | 쿠키 / 메모리 폴백 |
| Edge 120+ | 지원됨 | 쿠키 / 메모리 폴백 |
| Chrome Mobile 120+ | 지원됨 | 쿠키 / 메모리 폴백 |
| Safari Mobile 17+ | 지원됨 | 쿠키 / 메모리 폴백 |

**테스트 항목**:
- 테마 설정(`data-tone`) 저장 및 복원 확인
- 개인정보 보호 모드(시크릿)에서 `QuotaExceededError` 처리 확인
- 스토리지 비활성화 시 graceful degradation 확인

### 2.7 Clipboard API

| 브라우저 | 지원 여부 | 폴백 전략 |
|----------|-----------|-------------|
| Chrome 120+ | 지원됨 (HTTPS/localhost) | textarea 선택 후 `document.execCommand('copy')` |
| Firefox 120+ | 지원됨 | textarea 선택 후 `document.execCommand('copy')` |
| Safari 17+ | 지원됨 | textarea 선택 후 `document.execCommand('copy')` |
| Edge 120+ | 지원됨 | textarea 선택 후 `document.execCommand('copy')` |
| Chrome Mobile 120+ | ⚠️ 부분 지원 | textarea 폴백 |
| Safari Mobile 17+ | ⚠️ 부분 지원 | textarea 폴백 |

**테스트 항목**:
- `navigator.clipboard.writeText()` 복사 버튼 동작 확인
- HTTPS가 아닌 경우 Clipboard API 거부 시 textarea 폴백 작동 확인
- 복사 완료 피드백 ("복사됨") 표시 확인

---

## 3. 알려진 문제 및 폴백 (Known Issues & Fallbacks)

### 3.1 backdrop-filter 미지원

| 항목 | 내용 |
|------|------|
| 영향 브라우저 | Firefox 108 이하, 구형 Safari, 일부 Android WebView |
| 증상 | 유리 효과(blur) 미적용, 배경을 통해 뒤 콘텐츠가 그대로 보임 |
| 폴백 | `.glass-panel`에 `background: var(--color-surface)` 고정 불투명 배경 적용 |
| 테스트 방법 | DevTools에서 `backdrop-filter` 비활성화 후 고정 배경 표시 확인 |

### 3.2 Clipboard API 미지원 / 보안 제한

| 항목 | 내용 |
|------|------|
| 영향 브라우저 | Chrome Mobile, Safari Mobile (부분 지원), HTTP 컨텍스트 |
| 증상 | `navigator.clipboard` undefined 또는 보안 예외 발생 |
| 폴백 | 임시 `<textarea>` 요소 생성 → 텍스트 선택 → `document.execCommand('copy')` → 요소 제거 |
| 테스트 방법 | DevTools 콘솔에서 `navigator.clipboard` 제거 후 복사 버튼 클릭, textarea 폴백 작동 확인 |

### 3.3 CSS Grid 미지원

| 항목 | 내용 |
|------|------|
| 영향 브라우저 | Internet Explorer (타겟 외), 구형 모바일 브라우저 |
| 증상 | 카드 그리드가 한 열에 모두 나열되거나 레이아웃 깨짐 |
| 폴백 | `@supports not (display: grid)` 내에서 `display: flex; flex-wrap: wrap;` 적용 |
| 테스트 방법 | DevTools에서 `display: grid` 비활성화 후 flexbox 폴백 레이아웃 확인 |

### 3.4 Safari iOS 뷰포트 이슈 (`100dvh`)

| 항목 | 내용 |
|------|------|
| 영향 브라우저 | Safari Mobile iOS 15 이하 (`100dvh` 미지원) |
| 증상 | 하단 주소 표시줄에 콘텐츠 가림 |
| 폴백 | CSS 변수 `--vh`를 JavaScript로 계산해 적용, 또는 `100vh` 사용 |
| 테스트 방법 | iOS Safari에서 하단 UI 가림 여부 확인, 스크롤 가능 여부 확인 |

---

## 4. 테스트 절차 (Test Procedures)

### 4.1 테스트 준비

1. 로컬 서버 실행: `npm start` 또는 `node src/server.js` (포트 3000)
2. 테스트 URL: `http://localhost:3000`
3. DevTools 열기 (F12) → 콘솔, 네트워크, 요소 패널 준비
4. 각 브라우저별로 아래 절차를 순차 실행

### 4.2 공통 테스트 절차 (모든 브라우저)

| 단계 | 테스트 항목 | 확인 방법 | 예상 결과 |
|------|-------------|-----------|-----------|
| 1 | 페이지 로드 | `http://localhost:3000` 접속 | 메인 대시보드 표시, 콘솔 에러 없음 |
| 2 | CSS 변수 적용 | 요소 검사 → `--color-*` 토큰 확인 | 다크/라이트 테마 색상 올바르게 적용 |
| 3 | 문서 그리드 | 카드 레이아웃 확인 | `grid` 또는 `flex` 폴백으로 카드 정렬 |
| 4 | 사이드바 네비게이션 | 폴더 버튼 클릭 | 해당 폴더 문서 목록 표시 |
| 5 | 문서 뷰어 오픈 | 문서 카드 클릭 | 뷰어 오버레이 표시, 마크다운 렌더링 |
| 6 | 뷰어 복사 | `#copyBtn` 클릭 | 클립보드에 내용 복사, "복사됨" 피드백 |
| 7 | 검색 | 검색어 입력 후 Enter | 일치하는 문서 결과 표시 |
| 8 | 키보드 내비게이션 | Tab, Shift+Tab, Enter, Space, Escape | 모든 대화형 요소 도달 및 작동 |
| 9 | 테마 토글 | 다크/라이트 전환 버튼 | `data-tone` 변경 및 색상 즉시 반영 |
| 10 | 콘솔 에러 확인 | DevTools 콘솔 패널 | JavaScript 에러 없음 |

### 4.3 브라우저별 특이 사항 테스트

#### Chrome 120+ (Windows, macOS, Linux) — 기준 브라우저

| # | 테스트 항목 | 절차 | 예상 결과 |
|---|-------------|------|-----------|
| C1 | 전체 기능 검증 | 4.2 공통 절차 전체 실행 | 모든 기능 정상 |
| C2 | backdrop-filter | `.glass-panel` blur 적용 확인 | 유리 효과 정상, 텍스트 가독성 확보 |
| C3 | Clipboard API | `navigator.clipboard.writeText()` 직접 호출 | 복사 성공 |
| C4 | DevTools 성능 | Performance 패널로 로드 시간 측정 | DOMContentLoaded < 1.5초 |

#### Firefox 120+ (Windows, macOS, Linux)

| # | 테스트 항목 | 절차 | 예상 결과 |
|---|-------------|------|-----------|
| F1 | backdrop-filter 지원 확인 | DevTools에서 `backdrop-filter` 토글 | 지원 시 유리 효과, 미지원 시 고정 배경 폴백 |
| F2 | CSS Grid | 그리드 레이아웃 렌더링 확인 | 카드 자동 줄바꿈 및 정렬 정상 |
| F3 | Fetch API | 네트워크 패널로 API 호출 확인 | JSON 응답 정상 처리 |
| F4 | localStorage | 테마 변경 후 페이지 재로드 | 테마 상태 유지 |

#### Safari 17+ (macOS, iOS)

| # | 테스트 항목 | 절차 | 예상 결과 |
|---|-------------|------|-----------|
| S1 | `-webkit-backdrop-filter` | `.glass-panel`에 웹킷 접두사 적용 확인 | 유리 효과 정상 (macOS/iOS) |
| S2 | 뷰포트 단위 | iOS에서 하단 주소 표시줄 가시 여부 확인 | 콘텐츠 가림 없음, 스크롤 정상 |
| S3 | 터치 이벤트 | iOS에서 카드 탭, 뷰어 닫기 | 터치 타겟 44×44px 이상, 조작 원활 |
| S4 | VoiceOver | 스크린 리더로 페이지 탐색 | ARIA 레이블 정상 발표 |

#### Edge 120+ (Windows)

| # | 테스트 항목 | 절차 | 예상 결과 |
|---|-------------|------|-----------|
| E1 | Chromium 기반 동작 | Chrome과 동일한 절차 실행 | Chrome과 동일하게 모든 기능 정상 |
| E2 | 읽어 보기 모드 | Edge 읽어 보기 모드에서 페이지 렌더링 | 텍스트 콘텐츠 정상 추출 |

#### Chrome Mobile 120+ (Android)

| # | 테스트 항목 | 절차 | 예상 결과 |
|---|-------------|------|-----------|
| M1 | 터치 타겟 | 버튼, 카드 최소 44×44px 확인 | 손가락으로 조작 가능 |
| M2 | 그리드 레이아웃 | 뷰포트 < 768px에서 단일 열 확인 | 카드 세로 스택, 가로 스크롤 없음 |
| M3 | Clipboard API | 복사 버튼 클릭 | 부분 지원 시 textarea 폴백 작동 |
| M4 | 뷰포트 메타 태그 | `width=device-width, initial-scale=1.0` 확인 | 적절한 축소 배율 |

#### Safari Mobile 17+ (iOS)

| # | 테스트 항목 | 절차 | 예상 결과 |
|---|-------------|------|-----------|
| M5 | `-webkit-backdrop-filter` | Safari iOS에서 유리 효과 확인 | 접두사 적용 시 정상, 미지원 시 폴백 배경 |
| M6 | `100dvh` / 뷰포트 | 하단 주소 표시줄 표시/숨김 전환 시 콘텐츠 확인 | 가림 없음, `100vh` 폴백 적용 |
| M7 | 터치 스크롤 | 뷰어 콘텐츠 세로 스크롤 | 관성 스크롤 정상, 바운스 없음 |
| M8 | VoiceOver | iOS 스크린 리더 탐색 | 모든 인터랙티브 요소 발표 |

### 4.4 폴백 동작 테스트 절차

| 시나리오 | 재현 방법 | 검증 항목 | 예상 결과 |
|----------|-----------|-----------|-----------|
| backdrop-filter 미지원 | DevTools에서 CSS 속성 비활성화 | `.glass-panel` 배경 색상 | `--color-surface` 고정 배경 표시, 텍스트 대비 4.5:1 유지 |
| CSS Grid 미지원 | `@supports not (display: grid)` 강제 적용 | 카드 레이아웃 | `flex-wrap: wrap`로 카드 정렬, 세로 스택 |
| Clipboard API 미지원 | `navigator.clipboard` 모킹 제거 | 복사 버튼 클릭 | textarea 생성 후 `execCommand('copy')`로 복사 성공 |
| localStorage 비활성화 | 시크릿 모드 또는 스토리지 차단 | 테마 변경 후 새로고침 | 오류 없이 기본 테마(라이트) 적용 |
| JavaScript 비활성화 | 브라우저 설정에서 JS 차단 | 페이지 로드 | 정적 HTML만 표시, 상호작용 불가 (안내 메시지) |

### 4.5 테스트 결과 기록 양식

| 브라우저 | 버전 | OS | 기능 | 결과 (✅/⚠️/❌) | 비고 |
|----------|------|-----|------|----------------|------|
| Chrome | 120+ | Windows | 전체 | | |
| Firefox | 120+ | macOS | backdrop-filter | | |
| Safari | 17+ | iOS | 뷰포트 | | |
| Edge | 120+ | Windows | 전체 | | |
| Chrome Mobile | 120+ | Android | 터치 | | |
| Safari Mobile | 17+ | iOS | Clipboard | | |

---

## 5. 테스트 환경 및 도구

| 도구 | 용도 |
|------|------|
| Chrome DevTools | CSS/JS 디버깅, 성능 측정, 네트워크 모니터링 |
| Firefox DevTools | CSS Grid 인스펙터, 백드롭 필터 디버깅 |
| Safari Web Inspector | iOS 원격 디버깅 (Mac에 iPhone 연결) |
| agent-browser | UI 자동화 테스트 시나리오 실행 |
| Lighthouse | 접근성, 성능, PWA 감사 |
| BrowserStack / Sauce Labs | 실제 디바이스 교차 브라우저 테스트 (선택) |

---

## 6. 승인 및 배포 기준

모든 P0 우선순위 브라우저(Chrome, Firefox, Safari)에서 다음 조건 충족 시 배포 승인:

- 콘솔에 치명적 JavaScript 에러 없음
- 핵심 사용자 흐름(폴더 네비게이션, 문서 뷰어, 검색, 복사) 정상 동작
- backdrop-filter 미지원 시 고정 배경 폴백 적용 확인
- Clipboard API 폴백(textarea) 동작 확인
- CSS Grid 폴백(flexbox) 레이아웃 정상

---

**작성 완료**: `C:\work\openrouter\web_server/CROSS_BROWSER_TEST_PLAN.md`  
**관련 문서**: `TESTING.md`, `DESIGN_SYSTEM.md`, `02_frontend-ui.md`, `MOBILE_RESPONSIVE.md`, `ACCESSIBILITY_AUDIT.md`
