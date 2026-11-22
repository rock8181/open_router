# 모바일 우선 반응형 디자인 설계서

대상: `C:\work\openrouter\web_server/public/style.css`, `public/index.html`

---

## 1. 브레이크포인트 전략 (모바일 우선)

### 기본 스타일 (모바일, < 768px)
CSS 베이스 스타일은 모두 모바일 기기(화면 너비 768px 미만)를 기준으로 작성합니다.

- 단일 컬럼 레이아웃
- 사이드바는 상단 고정 바(top bar) 형태
- 터치 친화적인 간격과 터치 타겟 크기
- 고정 픽셀 너비 최소화, `%` 또는 `vw` 기반 유동 너비 사용

### 오버라이드 (태블릿/데스크톱, >= 768px)
`min-width: 768px` 미디어 쿼리에서만 데스크톱 전용 스타일을 적용합니다.

- 사이드바를 좌측 고정 사이드 패널(side drawer)로 전환
- 멀티 컬럼 그리드 적용
- 메인 콘텐츠는 사이드바 오른쪽에 배치 (`flex: 1`)

### 브레이크포인트 기준점
| 브레이크포인트 | 대상 기기 | 적용 스타일 |
|---|---|---|
| 기본 (< 768px) | 모바일 | 단일 컬럼, 상단 사이드바 |
| >= 768px | 태블릿/데스크톱 | 멀티 컬럼, 좌측 사이드 패널 |
| (선택) >= 1024px | 대형 데스크톱 | 확장된 그리드, 추가 패널 |

### CSS 구조 예시

```css
/* ===== 베이스: 모바일 (< 768px) ===== */
body { ... }
.layout { flex-direction: column; }
.sidebar { width: 100%; ... }
.grid { grid-template-columns: 1fr; }

/* ===== 태블릿/데스크톱 (>= 768px) ===== */
@media (min-width: 768px) {
  .layout { flex-direction: row; }
  .sidebar { width: 320px; border-right: 1px solid #334155; }
  .grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
}
```

---

## 2. 사이드바 변환 전략

### 모바일 (< 768px): 상단 바 (top bar)
- `.layout`은 `flex-direction: column`
- `.sidebar`는 `width: 100%`, 고정 너비(`min(320px, 90vw)`) 제거
- `flex-direction: column`으로 브랜드, 네비게이션, 검색 박스를 세로 스택 배치
- `border-right` 제거, 하단 구분선(`border-bottom`) 사용
- **현재 문제**: 모바일 쿼리에서 `.sidebar`가 `flex-direction: row` + `overflow-x: auto`로 설정되어 어색한 가로 스크롤 행이 됨 → 세로 스택으로 변경

### 데스크톱 (>= 768px): 사이드 패널 (side drawer)
- `.layout`은 `flex-direction: row`
- `.sidebar`는 고정 너비(예: 320px) 또는 `minmax` 기반 유동 너비
- `border-right` 구분선 표시, `overflow-y: auto`로 스크롤 가능
- `.main`은 `flex: 1`로 남은 영역 차지

---

## 3. 터치 타겟 크기 (모바일)

### 권장 최소 크기
- **44px × 44px 이상** (Apple Human Interface Guidelines)
- **48px × 48px 이상** (Material Design, 권장)
- 상호작용 요소 간 간격은 최소 8px 확보

### 적용 대상
- 버튼(`.nav-item`, `.toolbar button`, `.viewer-actions button`, 검색 버튼 등)
- 링크, 입력 필드, 체크박스, 라디오 버튼
- 뷰어 닫기 버튼, 복사 버튼 등

### 현재 코드 검토
- `.nav-item`: `min-height: 44px` — 기준 만족
- 검색 입력: `min-height: 44px` — 기준 만족
- 툴바 버튼: `min-width: 44px` / `min-height: 44px` — 기준 만족
- `.viewer-actions button`: `padding: 8px 14px` + `min-width: 44px` / `min-height: 44px` — 텍스트 길이에 따라 44px 미만 될 수 있음, 패딩 확대 필요

### 변경 방향
모든 인터랙티브 요소에 `min-height: 48px`, `min-width: 48px` 적용 권장.

---

## 4. 뷰포트 안전 높이 단위 (dvh)

### 문제
- `100vh`는 모바일 브라우저의 주소 표시줄 표시/숨김에 따라 실제 가시 영역과 맞지 않아 하단이 잘리거나 여백이 생길 수 있음.

### 해결
- `100vh` 대신 **`100dvh`(동적 뷰포트 높이)** 사용
- 현재 코드: `body`와 `.layout`에 이미 `height: 100dvh` 적용됨 — 양호
- `body { overflow: auto }`와 함께 사용할 때 스크롤 동작 검토 필요

### CSS 적용 예시

```css
body {
  height: 100dvh;
  overflow: auto;
}

.layout {
  height: 100dvh;
}
```

---

## 5. 검색 박스 모바일 동작

### 모바일 (< 768px)
- 검색 박스는 **전체 너비 (`width: 100%`)**
- 고정 너비(`width: 200px`) 제거 — 현재 모바일 쿼리에 `width: 200px`가 있어 문제
- 입력 필드와 검색 버튼은 세로 스택 또는 전체 너비 행으로 배치
- 검색 버튼 터치 타겟 44px 이상 보장

### 데스크톱 (>= 768px)
- 사이드바 내에 통합, 사이드바 너비에 맞춰 유동적으로 확장
- `width: 100%` 유지

### CSS 변경 예시

```css
/* 모바일 베이스 */
.search-box {
  width: 100%;
}

.search-box input {
  width: 100%;
}

/* 데스크톱 오버라이드는 불필요 (이미 100%) */
```

---

## 6. 그리드 컬럼 전략

### 모바일 (< 768px): 단일 컬럼
- `grid-template-columns: 1fr`
- 카드 하나당 한 줄 차지, 세로 스크롤로 탐색
- `gap: 16px`, `padding: 16px`

### 데스크톱 (>= 768px): 멀티 컬럼
- `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`
- 화면 너비에 따라 자동으로 컬럼 수 조정
- `gap: 24px`, `padding: 24px 32px`

### 현재 코드 문제
- 베이스 스타일에 이미 멀티 컬럼(`repeat(auto-fill, minmax(280px, 1fr))`)이 있고, 모바일 쿼리(`max-width: 768px`)에서 단일 컬럼으로 덮어씀 → **데스크톱 우선 구조**
- 모바일 우선 구조로 재정리: 베이스에 단일 컬럼, `min-width: 768px`에서 멀티 컬럼 적용

---

## 7. 뷰포트 메타 태그 요구사항

### 현재 (`index.html` line 5)

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### 권장

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

- `width=device-width`: 기기 너비를 뷰포트 너비로 설정
- `initial-scale=1.0`: 초기 배율 1배
- 접근성을 고려해 `user-scalable=no` 또는 `maximum-scale` 제한은 가급적 적용하지 않음 (사용자 확대 축소 보장)
- 모바일 더블탭 줌 지연 방지를 위해 버튼/링크 등에 `touch-action: manipulation` 적용 권장

---

## 8. 구체적인 CSS 변경 사항

### 현재 문제점 요약

| 항목 | 현재 상태 | 문제 |
|---|---|---|
| 브레이크포인트 | `@media (max-width: 768px)` | 데스크톱 우선, 모바일 우선 아님 |
| 사이드바 너비 | `width: min(320px, 90vw)` | 모바일에서 고정 320px 경향 |
| 사이드바 모바일 배치 | `flex-direction: row` + `overflow-x: auto` | 어색한 가로 스크롤 행 |
| 검색 박스 모바일 | `width: 200px` | 고정 너비, 전체 너비 아님 |
| 그리드 | 베이스에 멀티 컬럼, 모바일에서 단일 컬럼 오버라이드 | 모바일 우선 역순 |
| 뷰포트 높이 | `100dvh` 사용 | 양호 (유지) |
| 터치 타겟 | 대부분 44px | 48px 상향 권장 |

### 권장 최종 CSS (`style.css` 하단 교체)

```css
/* ============================================================
   모바일 우선 반응형 (베이스: < 768px)
   ============================================================ */

/* 레이아웃: 세로 스택 */
.layout {
  display: flex;
  flex-direction: column;
  height: 100dvh;
}

/* 사이드바: 상단 바, 전체 너비 */
.sidebar {
  width: 100%;
  max-width: none;
  background: #1e293b;
  border-right: none;
  border-bottom: 1px solid #334155;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow-y: auto;
}

/* 브랜드/네비/검색: 세로 스택 */
.brand { margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #334155; }
.nav { margin-bottom: 24px; }
.nav-item {
  width: 100%;
  padding: 14px 16px;
  min-height: 48px;
}
.search-box {
  width: 100%;
  margin-bottom: 24px;
}
.search-box input {
  width: 100%;
  min-height: 48px;
}
.search-box button {
  width: 100%;
  padding: 14px 16px;
  min-height: 48px;
}

/* 메인 */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 헤더/툴바: 모바일 패딩 축소 */
.header { padding: 16px; }
.toolbar {
  padding: 12px 16px;
  gap: 12px;
  flex-wrap: wrap;
}
.toolbar button {
  min-width: 48px;
  min-height: 48px;
  padding: 10px 16px;
}

/* 그리드: 단일 컬럼 */
.grid {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

/* 뷰어 오버레이: 모바일에서 전체 화면 */
.viewer-overlay { inset: 0; z-index: 100; }
.viewer-panel { border-left: none; border-top: 1px solid #334155; }
.viewer-header { padding: 16px; }
.viewer-content { padding: 16px; }

/* 뷰어 액션 버튼 터치 타겟 */
.viewer-actions button {
  min-width: 48px;
  min-height: 48px;
  padding: 10px 14px;
}

/* ============================================================
   태블릿/데스크톱 오버라이드 (>= 768px)
   ============================================================ */
@media (min-width: 768px) {
  .layout {
    flex-direction: row;
  }

  .sidebar {
    width: 320px;
    border-right: 1px solid #334155;
    border-bottom: none;
    padding: 24px;
  }

  .header { padding: 24px 32px; }
  .toolbar { padding: 12px 32px; }

  .grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
    padding: 24px 32px;
  }

  .viewer-panel { border-left: 1px solid #334155; border-top: none; }
  .viewer-header { padding: 20px 32px; }
  .viewer-content { padding: 32px; }
}
```

### HTML 변경 (`index.html`)

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```
현재 메타 태그가 적절하므로 유지하되, 필요 시 인터랙티브 요소에 `style="touch-action: manipulation"` 또는 CSS로 `touch-action: manipulation` 추가 권장.

---

이 문서는 `style.css`와 `index.html`의 현재 문제를 바탕으로 모바일 우선 반응형 디자인으로 마이그레이션하기 위한 설계 기준입니다. 실제 CSS 적용 시 위 섹션 8의 코드를 참고해 순차적으로 반영하십시오.
