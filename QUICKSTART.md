# Glass Folder Cards 5분 설정 가이드

Glass Folder Cards를 5분 안에 프로젝트에 도입하는 빠른 시작 가이드입니다.

OpenRouter 프로젝트의 두 구현 방식(Vanilla JS, Next.js) 중 하나를 선택해 따라 하십시오.

---

## 1. 전제 조건 (Prerequisites)

시작 전 다음 항목이 준비되어 있어야 합니다.

| 항목 | 요구사항 |
|------|---------|
| 모던 브라우저 | Chrome, Edge, Firefox, Safari (`backdrop-filter` 지원) |
| Node.js | v18 이상 (권장 v24.20.0) |
| 디자인 시스템 토큰 | `web_server/DESIGN_SYSTEM.md`의 CSS 변수 (`--color-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--glass-*`) |

---

## 2. 방법 A — Vanilla JS / CSS (web_server) 3분

`web_server/public/style.css`에 Glass Folder Cards 토큰과 구조가 이미 정의되어 있습니다. 기존 HTML 프로젝트에 복사만 하면 됩니다.

### 2.1 CSS 복사

`web_server/public/style.css`의 아래 섹션을 프로젝트 CSS 파일에 복사합니다.

- 라인 436~474: Glass Folder Cards 토큰(`:root`, `[data-tone="dark"]`)
- 라인 476~647: 구조(`.gf-root`, `.gf-stage`, `.gf-back`, `.gf-front`, `.gf-files`, `.gf-sheet`, `.gf-label`, `.gf-key`, `.gf-menu`)
- 라인 651~696: 애니메이션(`@keyframes gf-drop`, `gf-roll`, `gf-turn`, `gf-bump`)
- 라인 716~750: 접근성 및 `prefers-reduced-motion`

### 2.2 HTML 예시

```html
<link rel="stylesheet" href="style.css">

<div class="gf-root" role="button" tabindex="0" aria-label="문서 폴더">
  <div class="gf-stage">
    <div class="gf-back"></div>
    <div class="gf-front">
      <div class="gf-files">
        <div class="gf-sheet">
          <div class="gf-label">
            <span class="type-badge">폴더</span>
            <h3>My Files</h3>
            <div class="meta">5개 항목</div>
          </div>
          <div class="gf-key">
            <button type="button" aria-label="추가">+</button>
            <button type="button" aria-label="더보기">···</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 2.3 확인

브라우저에서 HTML 파일을 열어 카드가 반짝이는 유리 효과와 함께 표시되는지 확인합니다. 카드에 마우스를 올리면 앞 패널이 앞뒤로 기울어집니다.

---

## 3. 방법 B — Next.js / React (study/01_분석_21st-mcp) 5분

Next.js 프로젝트에 `GlassFolder` React 컴포넌트를 추가합니다.

### 3.1 프로젝트 준비 (신규인 경우)

```powershell
# Next.js + TypeScript + Tailwind CSS 생성
npx create-next-app@latest my-app --typescript --tailwind --eslint
cd my-app

# shadcn/ui 초기화 (CSS 변수 토큰용)
npx shadcn@latest init

# 의존성 설치
npm install lucide-react clsx tailwind-merge
```

### 3.2 컴포넌트 복사

```powershell
mkdir components\ui
copy "C:\work\openrouter\study\01_분석_21st-mcp\components\ui\glass-folder-cards.tsx" components\ui\
```

### 3.3 globals.css 토큰 확인

`app/globals.css`에 shadcn/ui CSS 변수(`--background`, `--foreground`, `--ring`, `--muted-foreground` 등)가 정의되어 있어야 합니다. GlassFolder는 `hsl(var(--ring))`, `hsl(var(--muted-foreground))` 등을 참조합니다.

### 3.4 사용 예시

```tsx
// app/page.tsx
import GlassFolder from "@/components/ui/glass-folder-cards"

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <GlassFolder label="My Files" art="aurora" seed={3} appearDelay={0} />
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
      />
    </main>
  )
}
```

### 3.5 실행

```powershell
npm run dev
```

브라우저에서 `http://localhost:3000`을 열어 세 개의 Glass Folder 카드가 표시되는지 확인합니다.

---

## 4. 디자인 시스템 토큰 적용 (Quick Check)

`DESIGN_SYSTEM.md`에 따라 다음 토큰을 프로젝트에 선언합니다.

```css
:root {
  --color-bg: hsl(210, 20%, 97%);
  --color-surface: hsl(0, 0%, 100%);
  --color-text-primary: hsl(220, 20%, 10%);
  --color-accent: hsl(190, 85%, 45%);
  --color-border: hsl(210, 15%, 80%);
  --color-focus: hsl(190, 90%, 45%);
  --space-m: 16px;
  --radius-md: 8px;
  --shadow-elevated: 0 4px 6px hsl(220, 40%, 10%, 0.10);
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

---

## 5. 자주 발생하는 문제와 빠른 해결

| 문제 | 원인 | 해결 |
|------|------|------|
| 유리 효과가 안 보임 | 브라우저가 `backdrop-filter` 미지원 | 최신 브라우저 사용; 불투명 배경 폴백 추가 |
| 애니메이션이 끊김 | `prefers-reduced-motion` 미반영 | `@media (prefers-reduced-motion: reduce)`에서 duration을 `0.01ms`로 설정 |
| 텍스트가 안 읽힘 | 유리 표면 대비 부족 | `--color-text-primary` 사용, 불투명도 조정 (`DESIGN_SYSTEM.md` 섹션 9.1) |
| 포커스 링이 없음 | `outline: none` | 포커스 링 유지 (`2px solid var(--color-focus)`, `outline-offset: 2px`) |
| Next.js에서 `hsl(var(--ring))` 오류 | CSS 변수 미정의 | `app/globals.css`에 shadcn/ui 토큰 추가 |
| 모바일 터치가 불편함 | 터치 타겟이 44px 미만 | `min-height: 48px`, `min-width: 48px` (`MOBILE_RESPONSIVE.md` 섹션 3) |

---

## 6. 다음 단계

- 전체 Props API: `COMPONENT_API.md`
- 통합 가이드(모든 프로젝트): `INTEGRATION_GUIDE.md`
- 배포 가이드(정적 및 Next.js): `DEPLOYMENT.md`
- 디자인 시스템: `web_server/DESIGN_SYSTEM.md`
