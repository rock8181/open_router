# OpenRouter 문서 뷰어 디자인 시스템

**프로젝트**: OpenRouter Study Document Viewer  
**경로**: `C:\work\openrouter\web_server`  
**파일**: `DESIGN_SYSTEM.md`  
**언어**: 한국어  
**대상**: Vanilla HTML/CSS/JS 문서 탐색 및 뷰어 애플리케이션

---

## 0. 개요 및 설계 원칙

이 문서는 OpenRouter 문서 뷰어의 단일 진실 공급원(Single Source of Truth)이다. 모든 시각적 의사결정은 이 문서에 정의된 디자인 토큰과 컴포넌트 규격을 따르며, 기존 하드코딩 헥스 코드와 일관성 없는 스타일을 대체한다.

### 0.1 문제 현황 (기존 코드 검토 결과)

`public/style.css` 검토 결과 다음과 같은 문제가 확인됨:

- **어두운 밀도 높은 유리 효과(Glassmorphism)**: `backdrop-filter: blur(24px)` + 채도 160% + 그라데이션 워시로 텍스트 가독성이 낮고 시각적 소음이 큼 (`.gf-back`, `.gf-front`, `.gf-sheet`)
- **의미 없는 색상 토큰 부재**: 원색 헥스 (`#0f172a`, `#38bdf8`, `#ef4444` 등)가 컴포넌트 전반에 산재해 있으며, 라이트/다크 모드 변수가 명확하지 않음
- **일관성 없는 타이포그래피 스케일**: `font-size` 값이 `1rem`, `0.9rem`, `0.85rem`, `1.5rem` 등으로 제멋대로 지정되며, 행간이 `1.5`와 `1.7`이 혼재함
- **시각적 계층 구조 부재**: 모든 카드가 동일한 반경(`10px`)과 동일한 부드러운 그림자, 그라데이션 워시를 공유하는 SaaS 카드 키트 기본값을 따름
- **산재된 호버 트랜지션**: 모든 요소에 `transition: all 0.2s`가 적용되어 애니메이션이 난무하고 의도된 동작이 불분명함

### 0.2 설계 지침 (ui-ux-pro-max + frontend-design 기술 적용)

1. **접근성 최우선**: 대비 4.5:1 이상, 포커스 링, 키보드 내비게이션, ARIA 패턴 준수 (우선순위 1)
2. **터치 대상 최소 44×44px**: 버튼, 입력, 카드 상호작용 영역 (우선순위 2)
3. **의미 체계적 색상 토큰**: 원색 헥스를 컴포넌트에서 직접 사용하지 않음 (우선순위 6)
4. **한 번의 조율된 드러남**: 페이지 로드 시 하나의 오케스트레이션된 reveal만 허용, 모든 요소에 산재한 호버 애니메이션 금지 (우선순위 7)
5. **feel에 의존하지 않는 독창적 선택**: SaaS 카드 키트 기본값(동일한 반경, 부드러운 그림자, 그라데이션 워시)을 배제하고 콘텐츠 중심의 차분한 시각 언어를 채택함

---

## 1. 색상 토큰 (Color Tokens)

모든 색상은 HSL 형식으로 정의하며, 라이트 모드와 다크 모드 각각에 값을 둔다. 컴포넌트는 반드시 CSS 변수(`--color-*`)를 참조해야 하며, 원시 헥스(#rrggbb)는 사용 금지.

### 1.1 토큰 정의

| 토큰 | 역할 | 라이트 모드 (HSL) | 다크 모드 (HSL) | 비고 |
|------|------|-------------------|-----------------|------|
| `--color-bg` | 페이지 전체 배경 | hsl(210, 20%, 97%) | hsl(220, 30%, 8%) | 최하위 배경 |
| `--color-surface` | 카드, 사이드바, 모달 표면 | hsl(0, 0%, 100%) | hsl(220, 25%, 15%) | 기본 표면 |
| `--color-surface-elev` | 승격된 표면 (드롭다운, 툴팁) | hsl(210, 20%, 94%) | hsl(220, 20%, 22%) | 표면보다 밝게/어둡게 |
| `--color-text-primary` | 본문, 제목 주요 텍스트 | hsl(220, 20%, 10%) | hsl(200, 15%, 95%) | 최고 대비 |
| `--color-text-secondary` | 보조 설명, 메타 정보 | hsl(220, 15%, 45%) | hsl(200, 10%, 65%) | 텍스트보다 채도 낮음 |
| `--color-text-muted` | placeholder, disabled, 희미한 라벨 | hsl(220, 10%, 60%) | hsl(200, 8%, 45%) | 비중요 정보 |
| `--color-accent` | 주요 액션, 링크, 활성 상태 | hsl(190, 85%, 45%) | hsl(190, 90%, 55%) | 브랜드 강조 |
| `--color-accent-hover` | accent 호버/활성 상태 | hsl(190, 85%, 35%) | hsl(190, 90%, 65%) | accent보다 채도/명도 조정 |
| `--color-border` | 카드, 입력 필드 테두리 | hsl(210, 15%, 80%) | hsl(215, 20%, 30%) | 약은 테두리 |
| `--color-border-hover` | 포커스/호버 시 테두리 | hsl(190, 70%, 40%) | hsl(190, 80%, 50%) | 상호작용 피드백 |
| `--color-focus` | 키보드 포커스 링 | hsl(190, 90%, 45%) | hsl(190, 100%, 50%) | focus-visible 전용 |
| `--color-success` | 성공 메시지, 확인 상태 | hsl(150, 60%, 35%) | hsl(150, 70%, 45%) | 녹색 계열 |
| `--color-error` | 오류 메시지, 삭제 액션 | hsl(0, 75%, 45%) | hsl(0, 80%, 60%) | 빨강 계열 |
| `--color-warning` | 경고, 주의 알림 | hsl(40, 85%, 45%) | hsl(40, 90%, 55%) | 노랑/오렌지 계열 |

### 1.2 CSS 변수 구현 예시

```css
:root {
  --color-bg: hsl(210, 20%, 97%);
  --color-surface: hsl(0, 0%, 100%);
  --color-surface-elev: hsl(210, 20%, 94%);
  --color-text-primary: hsl(220, 20%, 10%);
  --color-text-secondary: hsl(220, 15%, 45%);
  --color-text-muted: hsl(220, 10%, 60%);
  --color-accent: hsl(190, 85%, 45%);
  --color-accent-hover: hsl(190, 85%, 35%);
  --color-border: hsl(210, 15%, 80%);
  --color-border-hover: hsl(190, 70%, 40%);
  --color-focus: hsl(190, 90%, 45%);
  --color-success: hsl(150, 60%, 35%);
  --color-error: hsl(0, 75%, 45%);
  --color-warning: hsl(40, 85%, 45%);
}

[data-tone="dark"] {
  --color-bg: hsl(220, 30%, 8%);
  --color-surface: hsl(220, 25%, 15%);
  --color-surface-elev: hsl(220, 20%, 22%);
  --color-text-primary: hsl(200, 15%, 95%);
  --color-text-secondary: hsl(200, 10%, 65%);
  --color-text-muted: hsl(200, 8%, 45%);
  --color-accent: hsl(190, 90%, 55%);
  --color-accent-hover: hsl(190, 90%, 65%);
  --color-border: hsl(215, 20%, 30%);
  --color-border-hover: hsl(190, 80%, 50%);
  --color-focus: hsl(190, 100%, 50%);
  --color-success: hsl(150, 70%, 45%);
  --color-error: hsl(0, 80%, 60%);
  --color-warning: hsl(40, 90%, 55%);
}
```

### 1.3 사용 규칙

- `background`, `border`, `color`, `outline`, `box-shadow` 등 모든 시각적 속성은 반드시 `--color-*` 토큰을 사용해야 한다.
- 컴포넌트 내부에서 직접 헥스 값을 작성하지 않는다.
- 상태 변형(호버, 포커스, 활성, disabled)은 해당 토큰의 hover/변형 토큰을 사용하거나 opacity로만 조절한다.

---

## 2. 타이포그래피 스케일 (Typography Scale)

### 2.1 기본 설정

| 항목 | 값 |
|------|-----|
| 기본 폰트 크기 | `16px` (`1rem`) |
| 기본 행간 (line-height) | `1.5` |
| 글자 가중치 (본문) | `400` |
| 글자 가중치 (제목) | `600` |
| 글자 가중치 (강조/라벨) | `500` |

### 2.2 폰트 스택

```css
--font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-mono: "SF Mono", Monaco, Consolas, "Courier New", monospace;
```

- 시스템 폰트를 우선 사용하며, 외부 웹폰트 로드를 도입하지 않는다.
- **이모지 아이콘 사용 금지**: 모든 아이콘은 인라인 SVG 또는 Lucide/Heroicons SVG로 구현한다.

### 2.3 모듈러 스케일 (비율 1.25)

| 역할 | 클래스 | 폰트 크기 | 행간 | 가중치 | 용도 |
|------|--------|-----------|------|--------|------|
| Display / H1 | `.text-display` | `2.5rem` (40px) | 1.2 | 600 | 페이지 대문자 제목 |
| Heading 1 | `.text-h1` | `2rem` (32px) | 1.25 | 600 | 섹션 제목 |
| Heading 2 | `.text-h2` | `1.6rem` (25.6px) | 1.3 | 600 | 부섹션 제목 |
| Heading 3 | `.text-h3` | `1.25rem` (20px) | 1.35 | 600 | 카드 제목 |
| Body (기본) | `.text-body` | `1rem` (16px) | 1.5 | 400 | 본문 텍스트 |
| Body small | `.text-body-sm` | `0.875rem` (14px) | 1.5 | 400 | 보조 본문 |
| Caption | `.text-caption` | `0.875rem` (14px) | 1.4 | 500 | 메타, 라벨, 스니펫 |
| Overline / Label | `.text-overline` | `0.75rem` (12px) | 1.5 | 600 | 구분 라벨 |
| Code | `.text-code` | `0.875rem` (14px) | 1.5 | 400 | 인라인 코드, 코드 블록 |

### 2.4 줄 길이 (Line Length)

- 본문 최대 줄 길이: `72ch` (문서 뷰어 콘텐츠 영역)
- 제목/라벨은 줄 길이 제한을 두지 않으나, 가독성을 위해 한 줄이 지나치게 길어지지 않도록 컨테이너 너비를 제한한다.

---

## 3. 간격 스케일 (Spacing Scale)

기본 단위: **4px**. 모든 마진, 패딩, 간격은 이 단위의 배수여야 한다.

| 토큰 | 값 | 사용 예 |
|------|-----|---------|
| `--space-xs` | `4px` | 요소 내 미세 간격 |
| `--space-s` | `8px` | 버튼 아이콘 여백, 밀집 목록 |
| `--space-m` | `16px` | 카드 내부 패딩, 입력 필드 여백 |
| `--space-l` | `24px` | 섹션 간격, 헤더 패딩 |
| `--space-xl` | `32px` | 페이지 여백, 대영역 간격 |
| `--space-xxl` | `48px` | 큰 여백, 빈 상태(Empty State) 패딩 |

### 3.1 구현 예시

```css
:root {
  --space-xs: 4px;
  --space-s: 8px;
  --space-m: 16px;
  --space-l: 24px;
  --space-xl: 32px;
  --space-xxl: 48px;
}
```

---

## 4. 둥근 모서리 토큰 (Border Radius Tokens)

| 토큰 | 값 | 사용 예 |
|------|-----|---------|
| `--radius-sm` | `4px` | 배지, 작은 버튼, 태그 |
| `--radius-md` | `8px` | 입력 필드, 모달, 카드 (기본) |
| `--radius-lg` | `12px` | 대형 카드, 뷰어 패널 |
| `--radius-xl` | `16px` | 주요 컨테이너, 오버레이 |
| `--radius-full` | `9999px` | 원형 버튼, 아바타, 알약 모양 배지 |

### 4.1 사용 규칙

- **모든 컴포넌트에 동일한 반경을 적용하지 않는다.** 계층에 따라 반경을 차등 적용한다 (SaaS 카드 키트 기본값 배제).
- 카드류는 기본적으로 `--radius-md` (8px)를 사용하며, 더 두드러진 컨테이너는 `--radius-lg` (12px) 또는 `--radius-xl` (16px)를 사용한다.

---

## 5. 그림자 토큰 (Shadow Tokens)

| 토큰 | 값 | 사용 예 |
|------|-----|---------|
| `--shadow-subtle` | `0 1px 2px hsl(220, 40%, 10%, 0.06)` | 입력 필드, 밀집된 요소 |
| `--shadow-elevated` | `0 4px 6px hsl(220, 40%, 10%, 0.10)` | 카드, 드롭다운 |
| `--shadow-deep` | `0 8px 24px hsl(220, 40%, 10%, 0.16)` | 모달, 오버레이 패널 |
| `--shadow-glass` | `0 4px 20px hsl(220, 40%, 10%, 0.25)` | 유리 표면, 떠 있는 요소 |

### 5.1 다크 모드 조정

다크 모드에서는 그림자의 불투명도를 약간 높여 표면 분리를 뚜렷하게 한다:

| 토큰 | 다크 모드 값 |
|------|-------------|
| `--shadow-subtle` | `0 1px 2px hsl(220, 40%, 5%, 0.25)` |
| `--shadow-elevated` | `0 4px 6px hsl(220, 40%, 5%, 0.35)` |
| `--shadow-deep` | `0 8px 24px hsl(220, 40%, 5%, 0.45)` |
| `--shadow-glass` | `0 4px 20px hsl(220, 40%, 5%, 0.55)` |

---

## 6. 유리 효과 토큰 (Glass Effect Tokens)

기존의 과도한 흐림과 채도 포화 효과를 배제하고, 차분하고 읽기 쉬운 유리 표면만을 정의한다.

| 토큰 | 라이트 모드 | 다크 모드 | 설명 |
|------|-------------|-----------|------|
| `--glass-bg` | `hsla(0, 0%, 100%, 0.55)` | `hsla(220, 30%, 12%, 0.55)` | 유리 배경 |
| `--glass-bg-elev` | `hsla(0, 0%, 100%, 0.70)` | `hsla(220, 30%, 18%, 0.70)` | 승격 유리 배경 |
| `--glass-border` | `hsla(0, 0%, 0%, 0.10)` | `hsla(0, 0%, 100%, 0.12)` | 유리 테두리 |
| `--glass-border-hover` | `hsla(190, 85%, 45%, 0.35)` | `hsla(190, 90%, 55%, 0.35)` | 상호작용 테두리 |
| `--blur-sm` | `blur(8px)` | `blur(8px)` | 미세 흐림 |
| `--blur-md` | `blur(16px)` | `blur(16px)` | 표준 유리 흐림 |
| `--blur-lg` | `blur(24px)` | `blur(24px)` | 강한 흐림 |

### 6.1 구현 예시

```css
.glass-panel {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: var(--blur-md);
  -webkit-backdrop-filter: var(--blur-md);
}
```

- `backdrop-filter` 값은 `blur(24px) saturate(160%)` 같은 과도한 채도 조정을 사용하지 않는다.
- 텍스트가 유리 표면 위에 배치될 때 대비 4.5:1을 확보할 수 있도록 opacity와 배경 색상을 조정한다.

---

## 7. 컴포넌트 스펙 (Component Specs)

### 7.1 버튼 (Button)

| 속성 | 값 | 비고 |
|------|-----|------|
| 최소 터치 대상 | `44px × 44px` | 접근성 필수 |
| 높이 (기본) | `44px` | -- |
| 패딩 (수평) | `12px ~ 20px` | 텍스트 길이에 따라 가변 |
| 폰트 크기 | `0.9375rem` (15px) | -- |
| 글자 가중치 | `500` | -- |
| 둥근 모서리 | `--radius-md` (8px) | -- |
| 포커스 링 | `2px solid var(--color-focus)`, 오프셋 `2px` | `focus-visible` 전용 |

### 7.2 입력 필드 (Input)

| 속성 | 값 | 비고 |
|------|-----|------|
| 높이 | `44px` | 최소 터치 대상과 동일 |
| 패딩 | `10px 16px` | -- |
| 둥근 모서리 | `--radius-md` (8px) | -- |
| 테두리 | `1px solid var(--color-border)` | -- |
| 포커스 테두리 | `1px solid var(--color-border-hover)` + 포커스 링 | -- |
| 폰트 크기 | `0.9375rem` (15px) | -- |

### 7.3 카드 (Card)

| 속성 | 값 | 비고 |
|------|-----|------|
| 패딩 | `16px` (`--space-m`) | 카드 내부 콘텐츠 여백 |
| 둥근 모서리 | `--radius-md` (8px) | 기본 카드 |
| 테두리 | `1px solid var(--color-border)` | -- |
| 그림자 | `--shadow-elevated` | 호버 시 `--shadow-deep`로 완화 |
| 배경 | `var(--color-surface)` | -- |

### 7.4 모달 / 오버레이 (Modal / Overlay)

| 속성 | 값 | 비고 |
|------|-----|------|
| 배경 | `rgba(0, 0, 0, 0.4)` (다크), `rgba(0, 0, 0, 0.2)` (라이트) | backdrop |
| 패널 배경 | `var(--color-surface)` | -- |
| 패널 둥근 모서리 | `--radius-lg` (12px) | -- |
| z-index (오버레이) | `1000` | -- |
| z-index (패널) | `1010` | -- |
| z-index (토스트) | `1100` | -- |
| z-index (드롭다운/툴팁) | `900` | -- |

### 7.5 z-index 레이어 계층

| 레이어 | z-index | 용도 |
|--------|---------|------|
| 베이스 | `1` | 일반 콘텐츠 |
| 드롭다운 / 툴팁 | `900` | 플로팅 메뉴 |
| 모달 오버레이 | `1000` | 모달 backdrop |
| 모달 패널 | `1010` | 모달 콘텐츠 |
| 토스트 알림 | `1100` | 화면 하단 알림 |
| 스킵 링크 | `1000` | 키보드 내비게이션 진입점 |

---

## 8. 애니메이션 원칙 (Animation Principles)

### 8.1 핵심 원칙

1. **한 번의 조율된 드러남 (One orchestrated reveal)**: 페이지 로드 시 하나의 오케스트레이션된 reveal만 허용한다. 모든 카드/섹션에 개별 fade-and-slide-up 애니메이션을 적용하는 기본값은 배제한다.
2. **상황 인식 타이밍 (Context-aware timing)**: 요소의 성격과 거리에 따라 지속 시간을 달리한다.
3. **사용자 동작에 반응하는 모션만 허용**: 열기, 확장, 확인 등 사용자 액션에 반응하는 모션은 허용하되, 마우스 호버만으로 상태가 즉각 변경되는 0ms 애니메이션은 금지한다.
4. **`prefers-reduced-motion` 준수**: 사용자가 동작 감소를 선호하면 모든 애니메이션과 트랜지션을 비활성화하거나 즉시 완료 상태로 만든다.

### 8.2 타이밍 스펙

| 유형 | 지속 시간 | 완화 함수 (Easing) | 용도 |
|------|-----------|-------------------|------|
| 진입 (Enter) | `200ms` | `cubic-bezier(0.23, 1, 0.32, 1)` (ease-out) | 모달 오픈, 패널 슬라이드 |
| 퇴장 (Exit) | `150ms` | `cubic-bezier(0.45, 0, 0.55, 1)` (ease-in) | 모달 닫기, 패널 닫기 |
| 호버 상태 | `150ms` | `ease` | 버튼, 링크 (최소한만) |
| 토스트 등장/소멸 | `250ms` / `200ms` | `ease-out` | 알림 표시 |
| 페이지 reveal (단 1회) | `400ms` | `cubic-bezier(0.34, 1.56, 0.64, 1)` (spring) | 초기 로드 시 한 번만 |

### 8.3 구현 규칙

- `transition: all 0.2s`와 같은 광범위한 트랜지션을 모든 요소에 적용하지 않는다. 변경되는 속성만 명시한다 (예: `transition: background-color 150ms ease, border-color 150ms ease`).
- `width`, `height` 애니메이션은 레이아웃 시프트를 유발하므로 사용하지 않는다. `transform`과 `opacity`만 사용한다.
- `@media (prefers-reduced-motion: reduce)` 미디어 쿼리 내에서 모든 `animation-duration`, `transition-duration`을 `0.01ms`로 설정하거나 애니메이션을 제거한다.

---

## 9. 접근성 규칙 (Accessibility Rules)

### 9.1 색상 대비

- **최소 대비 비율**: 텍스트와 배경 간 `4.5:1` 이상 (WCAG AA)
- 대문자/굵은 글꼴(18pt 이상 또는 14pt 이상 bold)의 경우 `3:1` 허용
- UI 컴포넌트(입력 필드 테두리, 버튼 등)와 인접 색상 간 `3:1` 이상
- 색상만으로 정보를 전달하지 않는다 (예: 오류 상태는 색상 + 아이콘 + 텍스트로 표현)

### 9.2 포커스 관리

- 모든 상호작용 요소(버튼, 입력, 링크, 카드 역할의 요소)는 `:focus-visible` 스타일을 가져야 한다.
- 포커스 링: `2px solid var(--color-focus)`, `outline-offset: 2px`
- 포커스 링을 절대 제거하지 않는다 (`outline: none` 금지).

### 9.3 키보드 내비게이션

- 모든 기능은 키보드만으로 조작 가능해야 한다.
- `tabIndex`는 `0` 또는 `-1`만 사용하며, 양수 `tabIndex`는 사용하지 않는다.
- 모달이 열리면 포커스를 모달 내부로 이동시키고, 닫힐 때 이전 포커스 요소로 복원한다.
- `Escape` 키로 모달/오버레이를 닫을 수 있어야 한다.
- 스페이스바와 엔터 키로 버튼 역할을 하는 요소를 활성화할 수 있어야 한다.

### 9.4 ARIA 패턴

| 요소 | ARIA 속성 | 예 |
|------|-----------|-----|
| 버튼 역할의 div | `role="button"`, `aria-label`, `aria-pressed`(토글 시) | 카드 클릭 영역 |
| 모달 | `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-hidden` | 뷰어 오버레이 |
| 내비게이션 | `aria-label`, `aria-current="page"`(활성 항목) | 사이드바 |
| 검색 | `aria-label`, `aria-live="polite"`(상태) | 검색 박스, 상태 메시지 |
| 이미지/아이콘 | `alt` 또는 `aria-hidden="true"`(장식용) | 문서 썸네일, 구분선 |

### 9.5 기타 접근성 요구사항

- 건너뛰기 링크(Skip Link) 제공: 페이지 상단에 키보드 사용자가 본문으로 바로 이동할 수 있는 링크
- 폼 입력에는 반드시 연결된 `<label>` 또는 `aria-label`이 있어야 한다.
- 오류 메시지는 입력 필드 근처에 인라인으로 표시하며, 상단에만 요약하지 않는다.
- 빈 상태(Empty State)는 조치 유도 문구를 포함해야 한다.

---

## 10. 기존 CSS 마이그레이션 가이드

`public/style.css`를 이 디자인 시스템에 맞게 재구성할 때 다음을 적용한다:

1. 모든 원색 헥스(`#0f172a`, `#38bdf8`, `#ef4444` 등)를 `--color-*` 토큰으로 대체한다.
2. `.card`, `.gf-back`, `.gf-front`, `.gf-sheet`의 `backdrop-filter: blur(24px) saturate(160%)`와 그라데이션 워시를 제거하고, 섹션 6의 유리 효과 토큰을 적용한다.
3. 모든 컴포넌트의 `border-radius`를 `--radius-*` 토큰으로 통일하고, 동일한 반경(10px)을 배제한다.
4. `transition: all 0.2s`를 제거하고, 변경 속성만 명시한 단기 트랜지션(150ms~200ms)으로 대체한다.
5. 애니메이션 `@keyframes slideIn`, `gf-drop`, `gf-roll`, `gf-turn` 등을 제거하고, 섹션 8의 한 번 reveal 원칙에 따라 단일 페이지 로드 애니메이션만 남긴다.
6. 폰트 크기를 섹션 2의 모듈러 스케일로 재정의하고, 행간을 `1.5`로 통일한다.
7. 모든 상호작용 요소의 최소 크기를 `44px × 44px`로 보장한다.

---

## 11. 문서 버전

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2026-11-21 | 최초 작성 (색상, 타이포그래피, 간격, 반경, 그림자, 유리 효과, 컴포넌트, 애니메이션, 접근성) |
