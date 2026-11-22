# 접근성 구현 계획 (WCAG 2.1 AA)

대상: `C:\work\openrouter\study\01_분석_21st-mcp/` (Next.js 14, React 18, Tailwind CSS, shadcn/ui 스타일 토큰, GlassFolder 컴포넌트)
목표: WCAG 2.1 AA 수준 준수. GlassFolder 컴포넌트 중심.

---

## 1. 현재 발견 문제 및 WCAG 매핑

| # | 문제 | 위치 | WCAG 2.1 AA 기준 | 심각도 |
|---|------|------|-----------------|--------|
| A | lang 속성과 콘텐츠 언어 불일치 (화면 낭독기 합성 불일치) | `app/layout.tsx:12` (`lang="en"`) | 3.1.1 Language of Page (A) | P2 |
| B | 시각적 `<h1>` 부재 (sr-only h1만 존재) | `app/page.tsx:50` | 1.3.1 Info and Relationships (A), 2.4.6 Headings (AA) | P1 |
| C | 12px 미만 텍스트 (10px) | `glass-folder-cards.tsx:1089` `.gf-sheet-meta` | 1.4.4 Resize text (AA) 관련, 가독성 | P2 |
| D | `:focus-visible` 아웃라인 누락/불일치 | `globals.css:60`, `glass-folder-cards.tsx` | 2.4.7 Focus Visible (AA) | P1 |
| E | muted 텍스트 대비 4.5:1 미만 | `glass-folder-cards.tsx:1086-1092` `.gf-sheet-meta` | 1.4.3 Contrast (Minimum) (AA) | P1 |
| F | 링크와 onClick 충돌 (역할 혼동) | `glass-folder-cards.tsx:829` | 4.1.2 Name, Role, Value (A) | P1 |
| G | 중복 폴더 라벨 / 고유 접근성 이름 부재 | `app/page.tsx:15-48`, `glass-folder-cards.tsx` | 2.4.6, 4.1.2 | P2 |

---

## 2. WCAG 2.1 AA 준수 항목 (Next.js 앱 특화)

### 2.1 Perceivable (인지 가능)
- **1.1.1 Non-text Content (A)**: canvas 아트워크는 `aria-hidden="true"`로 처리됨. 파일 미리보기 이미지는 `alt=""` (장식적). 텍스트 대체 제공이 필요한 비텍스트 콘텐츠 추가 시 `aria-label`/`alt` 명시.
- **1.3.1 Info and Relationships (A)**: 시각적 `<h1>` 노출, 목록(`role="list"`/`"listitem"`) 구조 명확화.
- **1.4.3 Contrast (Minimum) (AA)**: 본문/UI 텍스트 4.5:1 이상, 대문자/큰 텍스트 3:1 이상.
- **1.4.4 Resize text (AA)**: 기준 텍스트 12px 이상, 200% 확대 시 내용/기능 손실 없음.
- **1.4.10 Reflow (AA)**: Next.js App Router + Tailwind 반응형 그리드, 320px CSS 뷰포트 대응.
- **1.4.11 Non-text Contrast (AA)**: UI 컴포넌트, 그래픽 객체 3:1 이상.
- **3.1.1 Language of Page (A)**: `lang` 속성과 실제 콘텐츠 언어 일치.

### 2.2 Operable (조작 가능)
- **2.1.1 Keyboard (A)**: 모든 기능 키보드 조작 가능. GlassFolder 히트 영역, 키 버튼, 메뉴, 파일 링크/버튼.
- **2.4.1 Bypass Blocks (A)**: 건너뛰기 링크 (Next.js 앱 상단에 "본문으로 건너뛰기" 링크 추가 검토).
- **2.4.3 Focus Order (A)**: 의미 있는 탭 순서 유지.
- **2.4.7 Focus Visible (AA)**: `:focus-visible` 아웃라인 일관 적용.
- **2.5.2 Pointer Cancellation (A)**: `onClick`은 pointer up 시점 실행, 다운 시 액션 실행 금지.

### 2.3 Understandable (이해 가능)
- **3.1.1 Language of Page (A)**
- **3.2.1 On Focus (A)**: 포커스 시 문맥 변경 없음.
- **3.2.2 On Input (A)**: 입력 시 자동 문맥 변경 없음.
- **3.3.2 Labels or Instructions (A)**: 라벨 명확.

### 2.4 Robust (견고함)
- **4.1.2 Name, Role, Value (A)**: 버튼/링크/메뉴 역할과 이름 명시.
- **4.1.3 Status Messages (A)**: 폴더 열기/닫기, 파일 추가 상태는 `aria-live="polite"` 영역으로 알림 (선택).

---

## 3. 대비 비율 계산 (각 텍스트 요소)

배경: 라이트 모드 `#ffffff`, 전경 `#141416`(≈ `#242427`).

| 텍스트 요소 | 색상 | 배경 | 계산 대비 | AA 요구 (일반 4.5:1 / 큰 3:1) | 판정 |
|---|---|---|---|---|---|
| 페이지 본문 (`text-muted-foreground`) | `hsl(215,20.2%,33.9%)` ≈ `#455468` | `#ffffff` | 7.76:1 | 4.5:1 | 통과 |
| 폴더 제목 (`.gf-title`) | `var(--gf-ink)` `#141416` | 유리 패널 틴트(밝음) | 추정 6:1 이상 | 4.5:1 | 통과(실측 권장) |
| 폴더 메타 (`.gf-meta`) | `hsl(var(--muted-foreground))` | 유리 패널 틴트 | 추정 5:1 이상 | 4.5:1 | 통과(실측 권장) |
| 시트 이름 (`.gf-sheet-name`) | `#18181b` / `#fafafa` | `#ffffff` / `#1a1a1d` | 라이트 15.7:1 / 다크 12.7:1 | 4.5:1 | 통과 |
| 시트 메타 (`.gf-sheet-meta`) | `rgba(24,24,27,.5)` ≈ `#8b8b8d` | `#ffffff` | **3.38:1** | 4.5:1 (10px 작은 텍스트) | **실패** |
| 키 버튼 글리프 (`.gf-key`) | `#fff` / `#111113` | 그라데이션 | 추정 3:1 이상 | 3:1 (UI 컴포넌트) | 통과 추정 |
| 메뉴 아이템 (`.gf-menu-item`) | `hsl(var(--foreground))` | `hsl(var(--secondary))` | 4.5:1 이상 필요 | 4.5:1 | 검토 필요 |

### 계산 예시 (시트 메타)
- 전경 `rgba(24,24,27,0.5)` over `#ffffff` = `#8b8b8d`, 상대輝도 0.260
- 배경 `#ffffff`, 상대輝도 1.000
- 대비 = (1.000 + 0.05) / (0.260 + 0.05) = **3.38:1** → 4.5:1 미달

### 수정 방안
- `.gf-sheet-meta` 색상을 `rgba(24,24,27,.5)`에서 `#6b6b70` 이상(약 4.5:1 확보)으로 변경, 또는 글꼴 크기를 12px 이상으로 올리고 대비 3:1(큰 텍스트) 유지.
- 권장: `rgba(24,24,27,.75)` ≈ `#4a4a4e`, 대비 약 5.3:1.

---

## 4. 키보드 내비게이션 계획 (탭 순서, 포커스 관리)

### 4.1 탭 순서
1. 페이지 `<h1>` (시각적 노출)
2. 폴더 1 히트 버튼 (GlassFolder #1 "My Files" 열기/닫기)
3. 폴더 1 키 버튼 (추가/더보기)
4. 폴더 1 메뉴 (열린 시, 메뉴 아이템 순서대로; Esc로 닫고 키 버튼으로 포커스 복귀)
5. 폴더 2 히트 버튼 ("Archives")
6. 폴더 2 키 버튼 (더보기 메뉴)
7. 폴더 3 히트 버튼 ("Personal Documents")
8. 폴더 3 키 버튼 (없음, `action="none"`)
9. 본문 안내 텍스트 (펜, 링크 아님)

폴더가 열릴 때:
- `filesRef` 컨테이너의 `inert` 속성 제거 (기존 구현 있음, 유지)
- 파일 시트(링크/버튼)가 탭 순서에 포함
- 포커스는 폴더 히트 버튼 유지 (열림 시 자동 포커스 이동 금지)

### 4.2 포커스 관리
- Escape: 메뉴 열림 → 메뉴 닫고 키 버튼으로 포커스 복귀; 폴더 열림 → 폴더 닫고 히트 버튼으로 포커스 복귀 (기존 구현 있음, 유지)
- 포커스 아웃 사이클: 폴더 내부에서 Tab으로 순회 후 다음 폴더로 이동
- `:focus-visible` 아웃라인: `globals.css` 전역 선언 유지, GlassFolder 내부 모든 상호작용 요소(`.gf-hit`, `.gf-key`, `.gf-sheet`, `.gf-menu-item`)에 일관 적용. `all: unset` 사용 시 outline 재설정 필수.
- `aria-expanded`, `aria-controls` 상태 변화 시 포커스 유지.

### 4.3 포인터 상호작용
- `onClick`은 pointerup 시점 실행 (pointer down 시 실행 금지, 2.5.2 Pointer Cancellation).
- 링크(`<a href>`)는 `onClick`과 경합하지 않도록 분리: `onFileSelect`가 있을 때는 버튼(`<button>`) 사용, 내비게이션 링크는 `<a>`만 사용.

---

## 5. GlassFolder 컴포넌트 ARIA 속성 요구사항

| 요소 | 역할 | aria 속성 | 비고 |
|---|---|---|---|
| `gf-root` (폴더 루트) | 없음(구조) | `aria-label` 불필요 | 폴더 구분자 역할 없음 |
| `gf-hit` 버튼 | `button` | `aria-expanded={open}`, `aria-label="열기/닫기 {label}, {count} 항목"` | 토글 버튼, 고유 이름 필요 |
| `gf-title` | 텍스트 | 없음(시각 텍스트), `aria-labelledby` 고려 | 히트 버튼 라벨과 중복 발표 피함 |
| `gf-files` 컨테이너 | `list` | `role="list"`, `aria-label="{label} 내용물"` | 기존 구현 유지 |
| 시트 슬롯 | `listitem` | `role="listitem"` | 기존 구현 유지 |
| 파일 링크/버튼 | `link` 또는 `button` | `href` 있음 → link, 없음 → button, `aria-label="{파일명} {메타}"` | 링크/onClick 충돌 해결 |
| `gf-key` (추가/더보기) | `button` | `aria-label="파일 추가: {label}"` / `"옵션 더보기: {label}"`, `aria-haspopup="menu"`, `aria-expanded={menuOpen}`, `aria-controls="gf-menu-{uid}"` | 기존 구현 유지 |
| `gf-menu` | `menu` | `role="menu"`, `aria-label="{label} 옵션"` | 기존 구현 유지 |
| 메뉴 아이템 | `menuitem` | `role="menuitem"`, `tabIndex={열림? -1 : undefined}`, `disabled={닫힘}` | 기존 구현 유지, 포커스 관리 |
| canvas 아트워크 | 장식 | `aria-hidden="true"` | 기존 구현 유지 |
| 이미지 파일 미리보기 | `img` | `alt=""` (장식) 또는 파일명 대체 텍스트 | `draggable={false}` 유지 |

### 중복 라벨 해결
- 각 폴더의 `label` prop을 고유하게 ("My Files", "Archives", "Personal Documents" — 현재 이미 고유)
- 히트 버튼의 `aria-label`에 "열기/닫기" 접두사를 넣어 시트 제목(`gf-title`)과의 중복 발표 방지
- `aria-label="{label} 내용물"`과 `gf-title` 텍스트가 동일하게 발표되지 않도록 역할 분리

---

## 6. 화면 낭독기 테스트 노트

### 테스트 환경
- NVDA + Firefox/Chrome (Windows)
- JAWS + Chrome/Edge (Windows)
- VoiceOver + Safari (macOS)
- TalkBack + Chrome (Android, 선택)

### 확인 항목
1. **언어 합성**: `lang="en"` 콘텐츠가 영어 낭독기로 읽혀지는지 확인. 한국어 `lang="ko"` 설정 시 영어 텍스트가 한국어 합성으로 읽혀지는 불일치 방지 (현재 `lang="en"`이므로 일치 — 유지 권장).
2. **폴더 진입**: Tab으로 폴더 히트 버튼 도달 시 "My Files, 단추, 펼쳐짐/접힘, X 항목" 발표 확인.
3. **폴더 열기**: Enter/Space로 폴더 열림, 파일 시트가 탭 순서에 포함되는지, "파일명, 링크/단추" 발표 확인.
4. **메뉴**: 더보기 키로 메뉴 열림, 메뉴 아이템이 화살표 키로 순회, Esc로 닫고 키 버튼으로 포커스 복귀.
5. **시트 메타**: 작은 텍스트(10px)가 화면 낭독기로 발표되는지, 대비 문제로 가독성 저하 없는지.
6. **하이라이트 모드**: Windows 고대비 모드에서 `border-color`, `forced-colors` 대응. Tailwind `border-border` 토큰 사용.

### 테스트 스크립트 예시 (수동)
```
Tab → "My Files" 폴더 히트 버튼 포커스 → 낭독기 발표 확인
Enter → 폴더 열림 → 파일 시트 탭 순서 확인
Esc → 폴더 닫힘 → 히트 버튼 포커스 복귀 확인
```

---

## 7. 우선순위 (P1/P2/P3)

### P1 (차단, 즉시 수정)
1. **시각적 `<h1>` 추가** — `app/page.tsx`: sr-only h1 제거, 시각적 노출 h1 추가 또는 페이지 제목을 h1로 노출 (1.3.1, 2.4.6)
2. **시트 메타 대비 수정** — `.gf-sheet-meta` `rgba(24,24,27,.5)` → 4.5:1 확보 색상 변경, 또는 12px 이상으로 상향 (1.4.3)
3. **링크/onClick 역할 분리** — `glass-folder-cards.tsx:829` `<a onClick>` 충돌 해결, `onFileSelect`는 `<button>`, 내비게이션은 `<a href>` (4.1.2)
4. **`:focus-visible` 일관 적용** — 모든 상호작용 요소에 아웃라인 확보, `all: unset` 시 outline 재설정 (2.4.7)

### P2 (높음, 단기)
5. **12px 미만 텍스트 수정** — `.gf-sheet-meta` 10px → 12px 이상 (1.4.4 가독성)
6. **lang 속성 확인** — `app/layout.tsx` `lang="en"`과 영어 콘텐츠 일치 확인, 한국어 콘텐츠 시 `lang="ko"` 변경 (3.1.1)
7. **폴더 고유 접근성 이름** — 각 폴더 `aria-label` 고유화, 중복 발표 방지 (4.1.2, 2.4.6)

### P3 (보통, 중장기)
8. **건너뛰기 링크(skip link)** — Next.js 앱 상단에 "본문으로 건너뛰기" 링크 추가 (2.4.1)
9. **상태 메시지 알림** — 폴더 열기/닫기, 파일 추가를 `aria-live="polite"` 영역으로 알림 (4.1.3)
10. **선호 축약 모션** — 이미 `.gf-root`에 `prefers-reduced-motion` 처리됨, 유지 및 검증

---

이 계획을 토대로 구현 후 `npm run lint`, axe-core / Lighthouse 접근성 감사, 화면 낭독기 수동 테스트를 수행하세요.
