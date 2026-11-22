# GlassFolder 컴포넌트 Props API 문서

OpenRouter 데모 앱(`study/01_분석_21st-mcp/components/ui/glass-folder-cards.tsx`)의 `GlassFolder` React 컴포넌트에 대한 전체 Props API 레퍼런스입니다.

컴포넌트 파일: `components/ui/glass-folder-cards.tsx`  
내보내기 타입: `GlassFolderProps` (기본 내보내기 함수 `GlassFolder`)

---

## 1. 개요

`GlassFolder`는 실제 파일 요소를 사이에 둔 유리 패널(앞면)과 아트웍을 가진 뒷면 패널로 구성된 폴더 카드입니다. 사용자는 호버/포커스 시 앞 패널이 기울고, 클릭·엔터·스페이스로 폴더를 열며, 파일 목록이 부채꼴로 펼쳐집니다. `+` 버튼으로 파일을 추가하고, `···` 버튼으로 키보드 조작 가능한 메뉴를 엽니다.

아트워크는 외부 이미지 없이 캔버스에 생성된 도메인-워프 노이즈 필드로 그려집니다(`image` Props로 사용자 이미지 대체 가능).

---

## 2. 타입 정의

### 2.1 GlassFolderProps

```tsx
export type GlassFolderProps = {
  label?: string
  meta?: string
  tone?: "light" | "dark"
  art?: FolderArt
  seed?: number
  image?: string
  files?: FolderFile[]
  action?: "add" | "more" | "none"
  onAdd?: (files: FolderFile[]) => FolderFile | void
  onFilesChange?: (files: FolderFile[]) => void
  menu?: FolderMenuItem[]
  labelPlacement?: "bottom-left" | "top-left" | "top-right"
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onFileSelect?: (file: FolderFile, index: number) => void
  width?: number
  appear?: boolean
  appearDelay?: number
  className?: string
  style?: React.CSSProperties
}
```

### 2.2 연관 타입

```tsx
export type ArtPreset = "aurora" | "ember" | "dusk" | "glacier" | "verdant"

export type ArtRecipe = {
  style: "marble" | "streak"
  colors: string[]
  scale?: number
  warp?: number
  angle?: number
  gloss?: number
  veins?: number
}

export type FolderArt = ArtPreset | ArtRecipe | "none"

export type FolderFile = {
  name: string
  meta?: string
  art?: ArtPreset | ArtRecipe
  image?: string
  href?: string
}

export type FolderMenuItem = {
  label: string
  onSelect?: () => void
  danger?: boolean
}
```

---

## 3. Props 레퍼런스

| Props | 타입 | 기본값 | 설명 |
|-------|------|--------|------|
| `label` | `string` | `"My Files"` | 폴더 앞면 패널에 표시되는 메인 라벨 |
| `meta` | `string` | 파일 개수(`N items`) | 라벨 아래에 표시되는 두 번째 줄 메타 텍스트. 지정하지 않으면 파일 개수가 자동 표시 |
| `tone` | `"light" \| "dark"` | `"light"` | 유리 톤. `"light"`는 우유 유리, `"dark"`는 연기 유리 |
| `art` | `FolderArt` | `"aurora"` | 뒷면 패널 아트워크. 프리셋, 커스텀 레시피, 또는 `"none"`(plain frosted) |
| `seed` | `number` | `3` | 아트워크 배열의 시드. 같은 시드는 같은 패턴 생성 |
| `image` | `string` | `undefined` | 뒷면 패널에 사용할 사용자 이미지 URL. 지정하면 `art` 대신 이미지 표시 |
| `files` | `FolderFile[]` | 샘플 파일 3개 | 폴더 내부 파일 목록. 최초 1회만 읽혀 폴더가 소유함 |
| `action` | `"add" \| "more" \| "none"` | `"add"` | 오른쪽 키 버튼 동작. `"add"`는 파일 추가, `"more"`는 메뉴 열기, `"none"`은 키 버튼 숨김 |
| `onAdd` | `(files) => FolderFile \| void` | `undefined` | `"add"` 액션 시 호출. 반환값이 있으면 해당 파일 추가, 없으면 `"Untitled N"` |
| `onFilesChange` | `(files) => void` | `undefined` | 파일 목록 변경 후 호출(부모에서 상태 동기화용) |
| `menu` | `FolderMenuItem[]` | `[]` | `"more"` 액션 메뉴 아이템 목록. 항상 "Open folder"/"Close folder" 항목이 먼저 추가됨 |
| `labelPlacement` | `"bottom-left" \| "top-left" \| "top-right"` | `"bottom-left"` | 라벨의 앞면 패널 내 위치 |
| `open` | `boolean` | `undefined` | 제어 컴포넌트: 열린/닫힘 상태. `undefined`이면 비제어 모드 |
| `defaultOpen` | `boolean` | `false` | 비제어 컴포넌트: 기본 열린 상태 |
| `onOpenChange` | `(open) => void` | `undefined` | 열림/닫힘 상태 변경 시 호출 |
| `onFileSelect` | `(file, index) => void` | `undefined` | 폴더가 열려 있을 때 파일 선택 시 호출. `href`가 있는 파일은 링크로 렌더링 |
| `width` | `number` | `340` | 폴더 너비(px). 높이는 `0.96 × width`로 자동 조정(무대 340×272 기준 비율) |
| `appear` | `boolean` | `true` | 뷰포트 첫 진입 시 입장 애니메이션 실행 여부 |
| `appearDelay` | `number` | `0` | 입장 애니메이션 지연(ms). 여러 폴더를 stagger 효과로 배치할 때 사용 |
| `className` | `string` | `undefined` | 루트 요소에 추가할 CSS 클래스 |
| `style` | `React.CSSProperties` | `undefined` | 루트 요소에 추가할 인라인 스타일 |

---

## 4. Props 상세 설명

### 4.1 label / meta / labelPlacement

- `label`: 폴더 이름. `gf-title` 요소에 렌더링되며, `aria-label`에도 사용됨.
- `meta`: 보조 메타 텍스트. 지정하지 않으면 `files.length`에 따라 `"N items"`(단수는 `"1 item"`)가 자동 생성됨.
- `labelPlacement`: 라벨 위치. `"bottom-left"`(기본)는 좌측 하단, `"top-left"`는 좌측 상단, `"top-right"`는 우측 상단.

### 4.2 tone / art / seed / image

- `tone`: `"light"`는 밝은 우유 유리, `"dark"`는 어두운 연기 유리. `data-tone` 속성으로 CSS 변수가 전환됨.
- `art`: 뒷면 패널 아트워크. 5개 프리셋(`aurora`, `ember`, `dusk`, `glacier`, `verdant`) 또는 `ArtRecipe` 객체, `"none"`.
- `seed`: 아트워크 난수 시드. 동일 seed + recipe는 동일한 아트워크 생성.
- `image`: `art` 대신 뒷면에 표시할 외부 이미지 URL. `draggable={false}`로 설정됨.

### 4.3 files / action / onAdd / onFilesChange

- `files`: 폴더 내 파일 목록. 각 파일은 `name`, 선택적 `meta`/`art`/`image`/`href`를 가짐. `art` 또는 `image`가 있으면 그림 파일, 없으면 흰 종이 시트(stub lines)로 렌더링.
- `action`: 오른쪽 키 버튼.
  - `"add"`: `+` 버튼. 클릭 시 `onAdd` 호출 후 새 파일이 폴더 바닥에 떨어지는 애니메이션.
  - `"more"`: `···` 버튼. 클릭 시 키보드 방향키 조작 가능한 플로팅 메뉴 열림.
  - `"none"`: 키 버튼 미표시.
- `onAdd`: 추가될 파일 객체를 반환. 반환하지 않으면 `{ name: "Untitled N", meta: "Just now" }` 기본 파일 추가.
- `onFilesChange`: 파일 추가 후 최종 파일 목록을 부모에 알림.

### 4.4 열림 상태 제어 (open / defaultOpen / onOpenChange)

- `open`: 제어 모드. 부모가 `true`/`false`로 직접 제어. `onOpenChange`와 함께 사용 권장.
- `defaultOpen`: 비제어 모드. 내부 상태의 초기값.
- `onOpenChange`: 폴더가 열리거나 닫힐 때 호출. 제어 모드(`open` 지정 시)에도 호출되나 내부 상태는 변경하지 않음.

### 4.5 onFileSelect

폴더가 열려 있고 파일(시트)을 클릭하거나 엔터/스페이스로 선택할 때 호출됨. `href`가 있는 파일은 `<a>` 태그로, 없으면 `<button>`으로 렌더링되며 `onClick`에서 `onFileSelect` 호출.

### 4.6 width

폴더 너비(px). 내부 무대는 고정 340×272, `k = width / 340` 비율로 전체가 스케일됨. 높이는 `(272 + 54) × k`(헤드룸 포함).

### 4.7 appear / appearDelay

뷰포트 진입 시 한 번만 입장 애니메이션(`data-entered`)이 재생됨. `IntersectionObserver` 임계값 25% 사용. `appear={false}`면 즉시 표시됨. `appearDelay`는 여러 폴더를 순차적으로 나타낼 때(stagger) 사용.

---

## 5. 사용 예시

### 5.1 기본 사용

```tsx
import GlassFolder from "@/components/ui/glass-folder-cards"

<GlassFolder label="My Files" art="aurora" seed={3} />
```

### 5.2 커스텀 파일 목록과 메뉴

```tsx
<GlassFolder
  label="Archives"
  art="none"
  action="more"
  labelPlacement="top-left"
  appearDelay={140}
  files={[
    { name: "Lookbook 2024", meta: "38 images", art: "dusk" },
    { name: "Invoices", meta: "12 PDFs" },
    { name: "Shoot — Lisbon", meta: "RAW · 2.1 GB", art: "ember" },
    { name: "Contract.pdf", meta: "PDF · 320 KB" },
  ]}
  menu={[
    { label: "Rename" },
    { label: "Share…" },
    { label: "Move to Trash", danger: true },
  ]}
/>
```

### 5.3 다크 톤, 키 버튼 없음

```tsx
<GlassFolder
  label="Personal Documents"
  meta="Wed 19 Aug"
  tone="dark"
  art="ember"
  seed={11}
  action="none"
  labelPlacement="top-right"
  appearDelay={280}
  width={340}
/>
```

### 5.4 제어 컴포넌트 (열림 상태 관리)

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
        console.log("선택:", file.name, index)
      }}
    />
  )
}
```

### 5.5 커스텀 아트 레시피

```tsx
<GlassFolder
  label="Custom"
  art={{
    style: "marble",
    colors: ["#120c18", "#3e2850", "#8f6c9c", "#b3502f", "#eab08a"],
    scale: 0.75,
    warp: 3.6,
    angle: 0.8,
    gloss: 0.5,
    veins: 0.5,
  }}
  seed={7}
/>
```

### 5.6 사용자 이미지

```tsx
<GlassFolder
  label="Photos"
  image="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=80"
  art="none"
/>
```

---

## 6. 내보내기 유틸리티 함수

`glass-folder-cards.tsx`에서 함께 내보내는 유틸리티:

| 함수 | 반환 타입 | 설명 |
|------|-----------|------|
| `ART_PRESETS` | `Record<ArtPreset, ArtRecipe>` | 5개 기본 아트 프리셋 레시피 |
| `hexToRgb(hex)` | `[number, number, number]` | 헥스 문자열을 RGB 트리플로 변환 |
| `rng(seed)` | `() => number` | 시드 기반 난수 생성기(mulberry32) |
| `hashString(s)` | `number` | 문자열을 안정적인 정수로 해시(파일별 아트 시드용) |
| `createArtJob(width, height, recipe, seed)` | `ArtJob` | 캔버스 아트워크 생성 잡 |
| `fanSlot(index, count)` | `number` | 파일 부채꼴 위치(-1 ~ 1) |

---

## 7. 접근성 및 ARIA

| 요소 | ARIA 속성 | 설명 |
|------|-----------|------|
| 루트(폴더 hit 영역) | `role="button"`, `aria-label`, `aria-expanded`, `aria-haspopup` | 폴더 열기/닫기 버튼 역할 |
| 파일 시트 | `role="listitem"` (부모 `role="list"`, `aria-label`) | 폴더 내부 파일 목록 |
| 키 버튼(`add`) | `aria-haspopup` 미설정, `aria-label` | 파일 추가 |
| 키 버튼(`more`) | `aria-haspopup="menu"`, `aria-expanded`, `aria-controls` | 메뉴 토글 |
| 메뉴 | `role="menu"`, `aria-label`, `data-open` | 키보드 방향키 탐색 |
| 메뉴 아이템 | `role="menuitem"`, `tabIndex` | 메뉴 항목 |
| 아트 캔버스 | `aria-hidden="true"` | 장식용, 스크리드 리더에서 숨김 |

- 포커스 링: `2px solid hsl(var(--ring))`, `outline-offset: 3px` (shadcn/ui 토큰 참조)
- `Escape` 키: 메뉴 또는 열린 폴더 닫기
- 외부 클릭/포인터다운: 열린 폴더·메뉴 닫기
- `prefers-reduced-motion`: 모든 트랜지션/애니메이션 `0s` 제거

---

## 8. CSS 데이터 속성 및 클래스

루트 요소에 다음 `data-*` 속성이 동적 부여되어 CSS 스타일링에 활용할 수 있습니다.

| 속성 | 값 | 의미 |
|------|-----|------|
| `data-tone` | `"light" \| "dark"` | 유리 톤 |
| `data-open` | `true` (존재 시) | 폴더 열린 상태 |
| `data-entered` | `true` (존재 시) | 입장 애니메이션 완료 |
| `data-place` | `"bottom-left" \| "top-left" \| "top-right"` | 라벨 위치 |
| `className` | `gf-root` + 사용자 클래스 | 루트 요소 클래스 |

내부 주요 클래스: `.gf-stage`, `.gf-back`, `.gf-front`, `.gf-files`, `.gf-sheet`, `.gf-label`, `.gf-key`, `.gf-menu`, `.gf-menu-item`, `.gf-hit`, `.gf-title`, `.gf-meta`, `.gf-sheet-name`, `.gf-sheet-meta`, `.gf-sheet-art`, `.gf-art`, `.gf-glyph`.

---

## 9. 문제 해결 (Troubleshooting)

| 증상 | 원인 | 해결 |
|------|------|------|
| `hsl(var(--ring))` 오류 | shadcn/ui CSS 변수 미정의 | `app/globals.css`에 `--ring`, `--foreground`, `--muted-foreground` 등 추가 |
| 아트워크가 표시되지 않음 | Canvas API 미지원 또는 시드 오류 | 최신 브라우저 사용; `art="none"` 또는 `image`로 폴백 |
| 파일 클릭 이벤트가 안 됨 | `pointer-events: none` 부모 요소 | `.gf-sheet`는 `pointer-events: auto`; 버튼/링크 요소 직접 클릭 확인 |
| 메뉴가 keyboard로 안 열림 | `role="menuitem"` 포커스 누락 | 메뉴 오픈 시 첫 번째 `[role=menuitem]`에 포커스 이동(컴포넌트 내부에서 처리) |
| 애니메이션이 끊김 | `prefers-reduced-motion` | `@media (prefers-reduced-motion: reduce)`에서 duration 제거 |
| `width` 변경 시 비율 깨짐 | 고정 무대 340×272 기준 | `width`만 변경하면 나머지 요소는 `k` 비율로 자동 스케일 |

---

## 10. 디자인 시스템 참조

모든 스타일 결정은 `web_server/DESIGN_SYSTEM.md`를 따릅니다.

- 색상 토큰: 섹션 1 (`--color-*`)
- 타이포그래피: 섹션 2 (`--font-sans`, `--font-mono`, 모듈러 스케일)
- 간격: 섹션 3 (`--space-*`, 기본 단위 4px)
- 반경: 섹션 4 (`--radius-*`)
- 그림자: 섹션 5 (`--shadow-*`)
- 유리 효과: 섹션 6 (`--glass-bg`, `--glass-border`, `--blur-*`)
- 애니메이션: 섹션 8 (진입 200ms, 퇴장 150ms, reveal 1회만)
- 접근성: 섹션 9 (대비 4.5:1, 터치 대상 44×44px, 포커스 링, ARIA)

관련 문서:
- `INTEGRATION_GUIDE.md` — 모든 프로젝트에 통합하는 방법
- `QUICKSTART.md` — 5분 설정 가이드
- `DEPLOYMENT.md` — 정적 및 Next.js 배포 가이드
- `web_server/MOBILE_RESPONSIVE.md` — 모바일 우선 브레이크포인트
