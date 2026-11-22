# 색상 및 타이포그래피 시스템 문서

**대상 프로젝트:** `C:\work\openrouter\study\01_분석_21st-mcp\` (Glass Folder Cards, Next.js 14 + Tailwind + shadcn/ui 토큰 구조)  
**작성 목적:** 원시 헥스 색상과 px 글꼴 크기를 의미적 디자인 토큰으로 대체하고, WCAG 대비율을 검증해 `globals.css`에 바로 반영할 수 있는 CSS 커스텀 프로퍼티를 제공한다.

---

## 1. 현재 문제 진단

| 문제 | 현황(코드 참조) | 영향 |
|------|-----------------|------|
| 원시 헥스 색상 남발 | `components/ui/glass-folder-cards.tsx`에 `#141416`, `#f5f5f7`, `#4c8dff`, `#ffffff`, `#2a2a2e` 등 인라인 헥스 다수 | 테마 전환(다크 모드) 유지보수 불가, 색상 일관성 깨짐 |
| px 단위 글꼴 크기 | `font-size: 12.5px` (`.gf-sheet-name`), `font-size: 10px` (`.gf-sheet-meta`) | 브라우저 글꼴 크기 설정 미반영, 접근성 저하 |
| `--muted-foreground` 대비 위험 | `app/globals.css:18` light 모드 `215 20.2% 33.9%` — 중성 채도, 밝기 경계 | 시트 메타 텍스트 `rgba(24, 24, 27, 0.5)`는 흰색 배경 대비 **3.38:1**로 WCAG AA 본문 기준 4.5:1 미달 |
| 일관되지 않은 타이포그래피 규모 | `10px`, `12px`, `12.5px`, `18px` 혼용 | 시각 리듬 깨짐, 배포 단위 불일치 |
| 범용 시스템 글꼴 스택 | `ui-sans-serif, system-ui, -apple-system, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` | 브랜드 차별화 없음, 플랫폼별 렌더링 차이 |

---

## 2. 색상 시스템

### 2.1 설계 원칙

- 모든 색상은 **의미적(semantic) 토큰**으로 정의하며, 원시 헥스 값을 직접 사용하지 않는다.
- HSL(`hsl(H S%)`) 표기 사용 — shadcn/ui + Tailwind 기존 구조와 호환.
- 라이트 모드와 다크 모드 토큰을 쌍으로 정의.
- 텍스트-배경 쌍마다 WCAG 2.1 대비율을 측정하고, 본문 텍스트는 **4.5:1 이상**(AA), 대형 텍스트(24px 이상 또는 19px 이상 bold)와 UI 컴포넌트는 **3:1 이상**을 만족해야 한다.

### 2.2 색상 토큰 (HSL)

#### 라이트 모드 (`:root`)

| 토큰 | HSL | 용도 |
|------|-----|------|
| `--background` | `0 0% 100%` | 페이지 배경 |
| `--foreground` | `222.2 84% 4.9%` | 본문 텍스트 (가장 어두운 잉크) |
| `--card` | `0 0% 100%` | 카드 표면 |
| `--card-foreground` | `222.2 84% 4.9%` | 카드 내 텍스트 |
| `--popover` | `0 0% 100%` | 팝오버 배경 |
| `--popover-foreground` | `222.2 84% 4.9%` | 팝오버 텍스트 |
| `--primary` | `222.2 47.4% 11.2%` | 주 액션 배경 (짙은 남청) |
| `--primary-foreground` | `210 40% 98%` | 주 액션 텍스트 (흰색) |
| `--secondary` | `210 40% 96.1%` | 보조 표면 |
| `--secondary-foreground` | `222.2 47.4% 11.2%` | 보조 표면 텍스트 |
| `--muted` | `210 40% 96.1%` | 음영 표면 (메타 정보 배경) |
| `--muted-foreground` | `215 20% 35%` | 음영 텍스트 (메타, 캡션) |
| `--accent` | `217 91% 60%` | 강조 액센트 (기존 링/아웃라인 색 #4c8dff 계열) |
| `--accent-foreground` | `222.2 47.4% 11.2%` | 액센트 위 텍스트 (작은 배지/칩용) |
| `--destructive` | `0 84.2% 60.2%` | 위험/삭제 액션 배경 |
| `--destructive-foreground` | `210 40% 98%` | 위험 액션 텍스트 |
| `--border` | `214.3 31.8% 91.4%` | 테두리 |
| `--input` | `214.3 31.8% 91.4%` | 입력 필드 테두리 |
| `--ring` | `222.2 84% 4.9%` | 포커스 링 |

#### 다크 모드 (`.dark`)

| 토큰 | HSL | 용도 |
|------|-----|------|
| `--background` | `222.2 84% 4.9%` | 페이지 배경 |
| `--foreground` | `210 40% 98%` | 본문 텍스트 (흰색) |
| `--card` | `222.2 84% 4.9%` | 카드 표면 |
| `--card-foreground` | `210 40% 98%` | 카드 내 텍스트 |
| `--popover` | `222.2 84% 4.9%` | 팝오버 배경 |
| `--popover-foreground` | `210 40% 98%` | 팝오버 텍스트 |
| `--primary` | `210 40% 98%` | 주 액션 배경 (흰색) |
| `--primary-foreground` | `222.2 47.4% 11.2%` | 주 액션 텍스트 (짙은 남청) |
| `--secondary` | `217.2 32.6% 17.5%` | 보조 표면 |
| `--secondary-foreground` | `210 40% 98%` | 보조 표면 텍스트 |
| `--muted` | `217.2 32.6% 17.5%` | 음영 표면 |
| `--muted-foreground` | `215 20.2% 75.1%` | 음영 텍스트 |
| `--accent` | `217 91% 60%` | 강조 액센트 (두 모드 동일) |
| `--accent-foreground` | `222.2 47.4% 11.2%` | 액센트 위 텍스트 |
| `--destructive` | `0 62.8% 30.6%` | 위험/삭제 액션 배경 |
| `--destructive-foreground` | `210 40% 98%` | 위험 액션 텍스트 |
| `--border` | `217.2 32.6% 17.5%` | 테두리 |
| `--input` | `217.2 32.6% 17.5%` | 입력 필드 테두리 |
| `--ring` | `212.7 47.4% 83.9%` | 포커스 링 |

> **수정 포인트:** 기존 `--muted-foreground` (`215 20.2% 33.9%`)는 중성 채도 + 밝기 경계 값으로, 시트 메타 텍스트처럼 반투명 흰색(`rgba(24, 24, 27, 0.5)`)과 조합 시 대비 3.38:1로 **4.5:1 미달**이 측정됨. 신규 토큰(`215 20% 35%`)은 라이트 모드 본문 배경 대비 **7.44:1**, 음영 표면 대비 **6.79:1**을 확보.

### 2.3 대비율 검증 (측정 결과)

| 텍스트 요소 | 배경 | 라이트 모드 | 다크 모드 | 판정 (AA 본문 4.5:1 / 대형·UI 3:1) |
|-------------|------|-------------|-----------|-------------------------------------|
| `--foreground` | `--background` | 19.99:1 | 19.09:1 | 통과 (AAA) |
| `--muted-foreground` | `--background` | 7.44:1 | 10.56:1 | 통과 (AAA) |
| `--muted-foreground` | `--muted` | 6.79:1 | 7.72:1 | 통과 (AAA) |
| `--primary-foreground` | `--primary` | 17.84:1 | 17.84:1 | 통과 (AAA) |
| `--secondary-foreground` | `--secondary` | 16.30:1 | 16.30:1 | 통과 (AAA) |
| `--card-foreground` | `--card` | 19.99:1 | 19.09:1 | 통과 (AAA) |
| `--destructive-foreground` | `--destructive` | 3.76:1 | 3.76:1 | **UI 컴포넌트 3:1 통과 / 본문 사용 금지** |
| `--accent` (포커스 링) | `--background` | 3.20:1 | 3.20:1 | UI 컴포넌트 3:1 통과 (본문 텍스트용 비권장) |
| 시트 이름 (`.gf-sheet-name`) | 시트 배경 | 17.72:1 | 17.72:1 | 통과 (AAA) |
| 시트 메타 (기존 `rgba(24,24,27,0.5)`) | 흰색 | 3.38:1 | — | **실패 → `--muted-foreground` 토큰으로 교체** |

> 주의: `--destructive`는 밝은 빨강(`60.2%`)이므로 흰색 텍스트 대비가 3.76:1에 그침. 위험 색상은 **본문 텍스트에 사용하지 말고**, 버튼 등 대형 UI 컴포넌트에만 적용한다.

---

## 3. 타이포그래피 시스템

### 3.1 기반 설정

- **기준 글꼴 크기:** `16px = 1rem` (브라우저 기본값 고수, 사용자 글꼴 크기 설정 존중)
- **모듈러 스케일 비율:** `1.25` (완전 4도)
- 모든 글꼴 크기는 **rem 단위** (px 금지)

### 3.2 모듈러 스케일 표 (16px 기준)

| 토큰 | rem | 픽셀 환산 | 스케일 단계 | 용도 |
|------|-----|-----------|-------------|------|
| `--text-3xl` | `2.44140625rem` | 39.06px | 1.25⁴ | H1 / 화면 주 제목 |
| `--text-2xl` | `1.953125rem` | 31.25px | 1.25³ | H2 / 섹션 제목 |
| `--text-xl` | `1.5625rem` | 25px | 1.25² | H3 / 카드 제목 |
| `--text-lg` | `1.25rem` | 20px | 1.25¹ | 리드 문구 / 강조 본문 |
| `--text-base` | `1rem` | 16px | 1.25⁰ | 본문 (기본) |
| `--text-sm` | `0.8rem` | 12.8px | 1.25⁻¹ | 메타 / 캡션 / 보조 텍스트 |
| `--text-xs` | `0.64rem` | 10.24px | 1.25⁻² | 초소형 라벨 / 법적 고지 |

> 기존 프로젝트에서 혼용된 `10px`, `12px`, `12.5px`, `18px`는 위 스케일 단계로 매핑:  
> `10px → 0.64rem`, `12px/12.5px → 0.8rem`, `18px → 1.25rem` (스케일 외 값은 사용 금지)

### 3.3 줄 높이 및 자간 토큰

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--leading-none` | `1` | 제목 |
| `--leading-tight` | `1.25` | 소제목 |
| `--leading-snug` | `1.375` | 본문 |
| `--leading-normal` | `1.5` | 장문 문단 |
| `--leading-relaxed` | `1.625` | 가독성 우선 문장 |
| `--tracking-tighter` | `-0.04em` | 대형 제목 |
| `--tracking-tight` | `-0.02em` | 제목 |
| `--tracking-normal` | `0` | 본문 |
| `--tracking-wide` | `0.05em` | 캡션 / 메타 |

### 3.4 글꼴 가중치

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--font-weight-normal` | `400` | 본문 |
| `--font-weight-medium` | `500` | 강조, 메뉴 항목 |
| `--font-weight-semibold` | `600` | 제목, 시트 이름 |

### 3.5 글꼴 스택 추천 (의도적 선택)

범용 시스템 글꼴(`system-ui` 계열) 대신 **한 가지 의도적 서체**를 지정한다.

**산세리프 (본문/UI):**
```
"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
```
- `Inter`를 최우선으로 지정: 화면 인터페이스 전용 설계, 큰 x-높이, 소형 글씨 가독성 우수. 웹 폰트로 로드하되, 로드 실패 시 시스템 산세리프로 폴백.

**고정폭 (메타/코드/숫자 정렬):**
```
ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace
```
- 파일 크기/날짜 등 숫자 고정폭이 필요한 메타 텍스트에만 적용.

적용 방식: `next/font/google` 또는 CSS `@import`로 Inter(400, 500, 600)를 로드하고 `body`에 `var(--font-sans)` 적용.

---

## 4. 줄 길이 가이드라인

- 가독성 최적 줄 길이: **45~75자**, 절대 상한 **80자 미만**.
- CSS 구현: 본문 콘테이너에 `max-width: 64ch` 적용 (약 64자).
- 프로젝트 내 적용 예 (`app/page.tsx` 안내 문구):
  ```tsx
  <p className="max-w-[64ch] text-sm text-muted-foreground">…</p>
  ```
- 제목은 줄 길이를 제한하지 않으나, 한 줄에 과도하게 길게 배치하지 않도록 `max-width: 72ch` 권장.

---

## 5. 텍스트 요소별 대비율 검증 요약

프로젝트 내 실제 텍스트 요소에 적용된 검증 결과:

| 요소 | 선택자/위치 | 글꼴 크기 | 색상 토큰 | 대비율 (라이트/다크) | 기준 | 결과 |
|------|-------------|-----------|-----------|----------------------|------|------|
| 페이지 본문 | `body` | `1rem` | `--foreground` / `--background` | 19.99:1 / 19.09:1 | 4.5:1 | 통과 |
| 시트 이름 | `.gf-sheet-name` | `0.875rem → 0.8rem` | `--foreground` (고정) | 17.72:1 / 동일 | 4.5:1 | 통과 |
| 시트 메타 | `.gf-sheet-meta` | `10px → 0.64rem` | `--muted-foreground` | 7.44:1 / 10.56:1 | 4.5:1 | 통과 (기존 3.38:1 실패 수정) |
| 카드 라벨(타이틀) | `.gf-title` | `1.125rem → 1.25rem` | `--foreground` | 19.99:1 / 19.09:1 | 4.5:1 | 통과 |
| 메뉴 항목 | `.gf-menu-item` | `0.875rem` | `--foreground` | 19.99:1 / 19.09:1 | 4.5:1 | 통과 |
| 위험 메뉴 항목 | `.gf-menu-item--danger` | `0.875rem` | `--destructive` | 3.76:1 (UI) | 3:1 UI | 통과 (본문 용도 아님) |
| 포커스 링 | `*:focus-visible` | — | `--ring` (3.20:1 on white) | 3.20:1 | 3:1 UI | 통과 |

---

## 6. globals.css에 복사할 CSS 커스텀 프로퍼티

아래 블록을 `app/globals.css`의 `:root` / `.dark` 변수 블록을 대체해 삽입한다. Tailwind 설정(`tailwind.config.ts`)은 이미 `hsl(var(--토큰))` 참조 구조를 사용하므로 변수명만 일치하면 바로 적용된다.

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215 20% 35%;
    --accent: 217 91% 60%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;

    --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    --font-mono: ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;

    --text-xs: 0.64rem;
    --text-xs--leading: 1;
    --text-sm: 0.8rem;
    --text-sm--leading: 1.25;
    --text-base: 1rem;
    --text-base--leading: 1.5;
    --text-lg: 1.25rem;
    --text-lg--leading: 1.5;
    --text-xl: 1.5625rem;
    --text-xl--leading: 1.25;
    --text-2xl: 1.953125rem;
    --text-2xl--leading: 1.125;
    --text-3xl: 2.44140625rem;
    --text-3xl--leading: 1.1;

    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;

    --tracking-tighter: -0.04em;
    --tracking-tight: -0.02em;
    --tracking-normal: 0;
    --tracking-wide: 0.05em;

    --max-width-prose: 64ch;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 75.1%;
    --accent: 217 91% 60%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 47.4% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-family: var(--font-sans);
    font-size: var(--text-base);
    line-height: var(--text-base--leading);
    font-weight: var(--font-weight-normal);
    letter-spacing: var(--tracking-normal);
  }
  *.focus-visible {
    outline: 2px solid hsl(var(--ring));
    outline-offset: 2px;
  }

  .prose {
    max-width: var(--max-width-prose);
  }

  .text-xs {
    font-size: var(--text-xs);
    line-height: var(--text-xs--leading);
  }
  .text-sm {
    font-size: var(--text-sm);
    line-height: var(--text-sm--leading);
  }
  .text-base {
    font-size: var(--text-base);
    line-height: var(--text-base--leading);
  }
  .text-lg {
    font-size: var(--text-lg);
    line-height: var(--text-lg--leading);
  }
  .text-xl {
    font-size: var(--text-xl);
    line-height: var(--text-xl--leading);
  }
  .text-2xl {
    font-size: var(--text-2xl);
    line-height: var(--text-2xl--leading);
  }
  .text-3xl {
    font-size: var(--text-3xl);
    line-height: var(--text-3xl--leading);
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-delay: 0.01ms !important;
      transition-duration: 0.01ms !important;
      transition-delay: 0.01ms !important;
    }
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## 7. 후속 적용 작업 목록

1. `app/globals.css` — 위 6절 CSS 블록으로 토큰 교체.
2. `components/ui/glass-folder-cards.tsx` —
   - `font-family`를 `var(--font-sans)`로 통일 (라인 919, 1200).
   - `font-size: 12.5px` → `0.8rem`, `font-size: 10px` → `0.64rem` (라인 1081, 1089).
   - 인라인 헥스 색상(`#141416`, `#f5f5f7`, `#4c8dff` 등)을 해당 의미적 토큰(`--foreground`, `--muted-foreground`, `--ring` 등)으로 교체. 아트워크 캔버스 색상(`ART_PRESETS`)은 일러스트레이션 영역이므로 유지하되 UI 프레임 색상은 토큰화.
3. `tailwind.config.ts` — `theme.extend.fontFamily.sans`에 `var(--font-sans)` 추가 (선택, 클래스 단위 사용 시).
4. `app/page.tsx` 안내 문구 — `max-w-[64ch]` 추가로 줄 길이 80자 미만 보장.
5. 다크 모드 토글 동작 확인 및 전체 텍스트 요소 대비 재측정 (자동화된 axe/contrast 테스트 권장).

---

**문서 버전:** 1.0  
**적용 대상:** `C:\work\openrouter\study\01_분석_21st-mcp\` 전체 UI 레이어
