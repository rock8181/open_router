# Glass Folder Cards 통합 가이드

어떤 프로젝트에도 Glass Folder Cards를 통합하는 방법에 대한 종합 문서입니다.

OpenRouter 프로젝트는 Glass Folder Cards를 두 가지 방식으로 구현하고 있습니다.

| 애플리케이션 | 경로 | 기술 스택 | 컴포넌트 |
|-------------|------|----------|---------|
| 문서 뷰어 (Vanilla JS) | `web_server/` | Vanilla HTML/CSS/JS + Express | CSS 클래스 (`.gf-root`, `.gf-back`, `.gf-front`, `.gf-sheet`) |
| 데모 앱 (Next.js) | `study/01_분석_21st-mcp/` | Next.js 14 + React 18 + Tailwind CSS | `GlassFolder` React 컴포넌트 |

이 가이드는 두 구현 방식을 모두 다루며, 기존 프로젝트에 Glass Folder Cards를 도입하는 방법을 설명합니다.

디자인 결정의 단일 진실 공급원은 `web_server/DESIGN_SYSTEM.md`입니다. 색상, 타이포그래피, 간격, 반경, 그림자, 유리 효과, 애니메이션, 접근성 규칙은 모두 해당 문서를 따릅니다.

---

## 1. 전제 조건 (Prerequisites)

### 공통 전제 조건

| 항목 | 요구사항 | 비고 |
|------|---------|------|
| 브라우저 | Chrome, Edge, Firefox, Safari 최신 버전 | `backdrop-filter` 지원 필수 |
| 디자인 시스템 토큰 | CSS 변수 (`--color-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--glass-*`) | `DESIGN_SYSTEM.md` 섹션 1~6 참조 |
| 접근성 | WCAG AA 대비 4.5:1, 포커스 링, 키보드 내비게이션 | `DESIGN_SYSTEM.md` 섹션 9 참조 |
| 모션 설정 | `prefers-reduced-motion` 미디어 쿼리 처리 | `DESIGN_SYSTEM.md` 섹션 8 참조 |

### Vanilla JS (web_server) 전용

| 항목 | 요구사항 |
|------|---------|
| Node.js | v18 이상 (권장 v24.20.0) |
| 패키지 관리자 | npm |
| 웹 서버 | Express (또는 정적 파일 호스팅) |

### Next.js (study/01_분석_21st-mcp) 전용

| 항목 | 버전 | 비고 |
|------|------|------|
| Next.js | 14.2.x | App Router |
| React | 18.2.x | |
| TypeScript | 5.x | |
| Tailwind CSS | 3.4.x | shadcn/ui 스타일 CSS 변수 |
| lucide-react | 0.300.x | 아이콘 (선택사항) |
| clsx / tailwind-merge | 최신 | 조건부 클래스 병합 (선택사항) |

---

## 2. 설치 단계 (Installation)

### 방법 A: Vanilla JS / CSS (web_server)

`web_server/public/style.css`에 이미 Glass Folder Cards 토큰과 구조가 정의되어 있습니다. 기존 프로젝트에 적용하려면 아래 파일을 복사합니다.

1. `web_server/public/style.css` 중 Glass Folder Cards 섹션(라인 436~750)을 프로젝트 CSS에 복사
2. `web_server/public/index.html`의 카드 마크업 구조 참조
3. `web_server/public/app.js`의 카드 생성 로직(`createCard`) 참조

### 방법 B: Next.js / React (study/01_분석_21st-mcp)

신규 Next.js 프로젝트가 없는 경우:

```powershell
# Next.js + TypeScript + Tailwind CSS 프로젝트 생성
npx create-next-app@latest my-app --typescript --tailwind --eslint
cd my-app

# shadcn/ui 초기화 (선택사항, CSS 변수 토큰용)
npx shadcn@latest init

# 의존성 설치
npm install lucide-react clsx tailwind-merge
```

GlassFolder 컴포넌트 복사:

```powershell
# components/ui 디렉토리 생성
mkdir components\ui

# glass-folder-cards.tsx 파일을 components/ui에 복사
copy "C:\work\openrouter\study\01_분석_21st-mcp\components\ui\glass-folder-cards.tsx" components\ui\
```

`app/globals.css`에 shadcn/ui CSS 변수 토큰이 정의되어 있어야 합니다. 컴포넌트는 `hsl(var(--ring))`, `hsl(var(--muted-foreground))`, `hsl(var(--foreground))` 등을 참조합니다.

---

## 3. 구성 옵션 (Configuration)

### 3.1 디자인 토큰 구성 (공통)

`web_server/DESIGN_SYSTEM.md`에 정의된 CSS 변수를 프로젝트 루트(`:root`)와 다크 모드(`[data-tone="dark"]` 또는 `.dark`)에 선언합니다.

```css
:root {
  /* 색상 토큰 (섹션 1) */
  --color-bg: hsl(210, 20%, 97%);
  --color-surface: hsl(0, 0%, 100%);
  --color-text-primary: hsl(220, 20%, 10%);
  --color-accent: hsl(190, 85%, 45%);
  --color-border: hsl(210, 15%, 80%);
  --color-focus: hsl(190, 90%, 45%);

  /* 간격 토큰 (섹션 3) */
  --space-xs: 4px;
  --space-s: 8px;
  --space-m: 16px;
  --space-l: 24px;
  --space-xl: 32px;
  --space-xxl: 48px;

  /* 반경 토큰 (섹션 4) */
  --radius-md: 8px;
  --radius-lg: 12px;

  /* 그림자 토큰 (섹션 5) */
  --shadow-elevated: 0 4px 6px hsl(220, 40%, 10%, 0.10);
  --shadow-glass: 0 4px 20px hsl(220, 40%, 10%, 0.25);

  /* 유리 효과 토큰 (섹션 6) */
  --glass-bg: hsla(0, 0%, 100%, 0.55);
  --glass-border: hsla(0, 0%, 0%, 0.10);
  --blur-md: blur(16px);
}

[data-tone="dark"] {
  --color-bg: hsl(220, 30%, 8%);
  --color-surface: hsl(220, 25%, 15%);
  --color-text-primary: hsl(200, 15%, 95%);
  --color-accent: hsl(190, 90%, 55%);
  --color-border: hsl(215, 20%, 30%);
  --color-focus: hsl(190, 100%, 50%);
}
```

### 3.2 Vanilla JS 구성 (style.css)

Glass Folder Cards는 `style.css`의 `--gf-*` 토큰으로 구성됩니다.

| 토큰 | 기본값 | 설명 |
|------|--------|------|
| `--gf-bg` | `#0f172a` | 폴더 루트 배경 |
| `--gf-surface` | `rgba(30, 41, 59, 0.55)` | 유리 표면 배경 |
| `--gf-border` | `rgba(148, 163, 184, 0.18)` | 테두리 |
| `--gf-accent` | `#38bdf8` | 액센트 색상 |
| `--gf-ease` | `cubic-bezier(0.23, 1, 0.32, 1)` | 표준 완화 함수 |
| `--gf-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 스프링 완화 함수 |

`[data-tone="dark"]` 선택자로 다크 모드 토큰을 오버라이드할 수 있습니다.

### 3.3 Next.js 구성 (GlassFolder Props)

전체 Props 목록은 `COMPONENT_API.md`를 참조하십시오. 주요 구성 옵션:

- `tone`: `"light"` (우유 유리) 또는 `"dark"` (연기 유리)
- `art`: `"aurora"`, `"ember"`, `"dusk"`, `"glacier"`, `"verdant"` 프리셋 또는 `"none"`
- `image`: 사용자 지정 이미지 URL (아트 대신 사용)
- `labelPlacement`: `"bottom-left"`, `"top-left"`, `"top-right"`
- `action`: `"add"`, `"more"`, `"none"`
- `open` / `defaultOpen` / `onOpenChange`: 제어/비제어 열린 상태
- `width`: 폴더 너비(px), 높이는 `0.96 × width`로 자동 조정

---

## 4. 사용 예시 (Usage Examples)

### 4.1 Vanilla JS (index.html)

```html
<div class="gf-root" role="button" tabindex="0" aria-label="프로젝트 폴더">
  <div class="gf-stage">
    <div class="gf-back"></div>
    <div class="gf-front">
      <div class="gf-files">
        <div class="gf-sheet">
          <div class="gf-label">
            <span class="type-badge">폴더</span>
            <h3>프로젝트 문서</h3>
            <div class="meta">12개 항목</div>
          </div>
          <div class="gf-key">
            <button class="gf-btn-add" type="button" aria-label="추가">+</button>
            <button class="gf-btn-more" type="button" aria-label="더보기">···</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 4.2 Next.js (React)

```tsx
import GlassFolder from "@/components/ui/glass-folder-cards"

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <GlassFolder
        label="My Files"
        art="aurora"
        seed={3}
        appearDelay={0}
      />
      <GlassFolder
        label="Archives"
        art="none"
        action="more"
        labelPlacement="top-left"
        appearDelay={140}
        files={[
          { name: "Lookbook 2024", meta: "38 images", art: "dusk" },
          { name: "Contract.pdf", meta: "PDF · 320 KB" },
        ]}
        menu={[
          { label: "Rename" },
          { label: "Move to Trash", danger: true },
        ]}
      />
      <GlassFolder
        label="Personal Documents"
        meta="Wed 19 Aug"
        tone="dark"
        art="ember"
        action="none"
        width={340}
      />
    </main>
  )
}
```

### 4.3 제어 컴포넌트 (열림/닫힘 상태 관리)

```tsx
import { useState } from "react"
import GlassFolder from "@/components/ui/glass-folder-cards"

export default function ControlledFolder() {
  const [open, setOpen] = useState(false)

  return (
    <GlassFolder
      label="Documents"
      open={open}
      onOpenChange={setOpen}
      onFileSelect={(file, index) => {
        console.log("선택된 파일:", file.name, "인덱스:", index)
      }}
    />
  )
}
```

---

## 5. 문제 해결 (Troubleshooting)

| 증상 | 원인 | 해결 방법 |
|------|------|-----------|
| 유리 효과가 적용되지 않음 | 브라우저가 `backdrop-filter` 미지원 | 최신 브라우저 사용; 대체 배경(`background` 불투명도) 준비 |
| 카드 애니메이션이 어지러움 | `prefers-reduced-motion` 미처리 | `@media (prefers-reduced-motion: reduce)`에서 애니메이션 `0.01ms`로 단축 (`DESIGN_SYSTEM.md` 섹션 8) |
| 텍스트 대비 부족 | 유리 표면 위 텍스트 대비 < 4.5:1 | `--color-text-primary` 토큰 사용; `backdrop-filter` 불투명도 조정 (`DESIGN_SYSTEM.md` 섹션 9.1) |
| 포커스 링이 표시되지 않음 | `outline: none` 사용 | 포커스 링 금지 원칙 준수 (`DESIGN_SYSTEM.md` 섹션 9.2) |
| Next.js에서 `hsl(var(--ring))` 오류 | shadcn/ui CSS 변수 미정의 | `app/globals.css`에 CSS 변수 토큰 추가 |
| 이미지가 깨짐 | `image` URL 접근 불가 | URL 유효성 확인; `art="none"`으로 폴백 |
| 모바일에서 터치 타겟 작음 | 버튼/카드 < 44×44px | `min-height: 48px`, `min-width: 48px` 적용 (`MOBILE_RESPONSIVE.md` 섹션 3) |

---

## 6. 디자인 시스템 참조 (Design System Reference)

모든 시각적 결정은 다음 문서를 따릅니다.

| 문서 | 경로 | 내용 |
|------|------|------|
| DESIGN_SYSTEM.md | `web_server/DESIGN_SYSTEM.md` | 색상, 타이포그래피, 간격, 반경, 그림자, 유리 효과, 컴포넌트, 애니메이션, 접근성, 마이그레이션 |
| MOBILE_RESPONSIVE.md | `web_server/MOBILE_RESPONSIVE.md` | 모바일 우선 브레이크포인트, 터치 타겟, 그리드 전략 |
| ACCESSIBILITY_AUDIT.md | `web_server/ACCESSIBILITY_AUDIT.md` | 접근성 감사 및 개선 사항 |
| 02_frontend-ui.md | `web_server/02_frontend-ui.md` | 프론트엔드 UI 설계 문서 |

### 주요 토큰 요약 (DESIGN_SYSTEM.md)

- **색상**: `--color-bg`, `--color-surface`, `--color-text-primary`, `--color-accent`, `--color-border`, `--color-focus`
- **간격**: `--space-xs`(4px) ~ `--space-xxl`(48px), 기본 단위 4px
- **반경**: `--radius-sm`(4px), `--radius-md`(8px), `--radius-lg`(12px), `--radius-xl`(16px)
- **그림자**: `--shadow-subtle`, `--shadow-elevated`, `--shadow-deep`, `--shadow-glass`
- **유리 효과**: `--glass-bg`, `--glass-border`, `--blur-sm`(8px), `--blur-md`(16px), `--blur-lg`(24px)
- **애니메이션**: 진입 200ms, 퇴장 150ms, hover 150ms, 페이지 reveal 400ms(1회만)
- **접근성**: 대비 4.5:1, 터치 대상 44×44px 이상, 포커스 링 `2px solid var(--color-focus)`

---

## 7. 관련 문서

- `QUICKSTART.md` — 5분 설정 가이드
- `COMPONENT_API.md` — GlassFolder 전체 Props API 레퍼런스
- `DEPLOYMENT.md` — 정적 및 Next.js 배포 가이드
- `web_server/DESIGN_SYSTEM.md` — 디자인 시스템 단일 진실 공급원
