# PERFORMANCE — Glass Folder Cards (Next.js 14 + React)

## 1. 개요

본 문서는 `C:\work\openrouter\study\01_분석_21st-mcp/` (Next.js 14 + React 글래스 폴더 카드 데모)의 성능 최적화 가이드입니다.

주요 진단 현안:
- 카드당 `mousemove`/`pointermove` 이벤트에서 `getBoundingClientRect()` 호출 → 레이아웃 스래싱(thrashing)
- 모든 카드에 `will-change: transform` 적용 → 컴포지터 오버헤드
- 스크롤 중 무거운 `backdrop-filter` 적용
- 지연 로딩(lazy loading) 전략 부재
- 번들 크기 분석 부재

주요 관련 파일:
- `app/page.tsx` — 페이지 진입부, `GlassFolder` 인스턴스 3개 렌더링
- `components/ui/glass-folder-cards.tsx` — 카드 컴포넌트 핵심 (pointer parallax, CSS-in-JS, canvas 아트, backdrop-filter)
- `app/globals.css` — Tailwind 기반 전역 스타일
- `next.config.js` — Next.js 설정 (최소 구성)

---

## 2. 크리티컬 렌더링 경로 최적화 (Critical Rendering Path)

### 2.1 React 클라이언트 렌더링 차단 감소

`GlassFolder`는 `"use client"` 컴포넌트입니다. 페이지가 로드될 때 클라이언트 측에서 수화(hydration)되며, canvas 기반 아트 워크가 `requestAnimationFrame` 분할 페인트로 그려집니다(`pump()` 함수, `glass-folder-cards.tsx:407-427`).

- 아트 생성(job)이 메인 스레드를 오래 점유하지 않도록 이미 구현되어 있습니다(프레임당 7ms 분할). 이 패턴을 유지하되, 다수 카드가 동시에 마운트될 때 큐 우선순위를 보장합니다(`priority` 인자: back panel 0, 파일 1).
- `appear`/`IntersectionObserver`로 뷰포트 진입 시 아트를 그리도록 이미 구현됨(`glass-folder-cards.tsx:583-604`). 이는 불필요한 오프스크린 아트 생성을 막아 초기 JS 실행 시간을 줄입니다.

### 2.2 폰트 및 CSS

- Tailwind CSS가 전역 스타일(`globals.css`)로 번들됩니다. 사용하지 않는 유틸리티 클래스가 포함되지 않도록 `tailwind.config.ts`의 `content` 경로를 정확히 유지합니다(`pages` 디렉토리가 없으므로 `./pages/**` 항목 제거 고려).
- 폰트는 시스템 UI 글꼴(`ui-sans-serif`, `system-ui` 등)을 사용하므로 웹 폰트 로딩 지연이 없습니다.

### 2.3 First Contentful Paint (FCP)

- `page.tsx`는 서버 컴포넌트로 렌더링되나, 내부 `GlassFolder`는 클라이언트 컴포넌트여서 클라이언트 측 수화가 필요합니다. 정적 사이트 생성(SSG) 또는 정적 내보내지(`next export`)를 고려해 HTML 단계에서 카드 골격을 노출할 수 있습니다.
- 배경 패턴(`radial-gradient`)은 CSS로 처리되어 이미지 요청이 없습니다.

---

## 3. 애니메이션 성능

### 3.1 문제: per-card pointermove + getBoundingClientRect

`glass-folder-cards.tsx:618-624`의 `move` 핸들러에서 매 이벤트마다 `el.getBoundingClientRect()`를 호출합니다:

```tsx
const move = (e: PointerEvent) => {
  if (e.pointerType === "touch") return;
  const r = el.getBoundingClientRect(); // 강제 레이아웃, 매 포인터 이동마다
  px = ((e.clientX - r.left) / r.width) * 2 - 1;
  py = ((e.clientY - r.top) / r.height) * 2 - 1;
  if (!raf) raf = requestAnimationFrame(write);
};
```

이는 카드 하나당 매 `pointermove`마다 강제 리플로우를 유발하며, 다수 카드에서 레이아웃 스래싱을 일으킵니다.

### 3.2 개선 방안

1. **`getBoundingClientRect` 한 번만 계산 및 캐시**  
   카드 크기/위치는 마우스 이동 중 바뀌지 않으므로, 컴포넌트 마운트 시 한 번 계산해 변수에 저장합니다. 윈도우 리사이즈 시에만 갱신합니다.

2. **`requestAnimationFrame` 스로틀링**  
   이미 `raf` 플래그로 한 프레임에 한 번만 `write`를 호출하고 있으나, rect 계산도 RAF 예약 조건 안으로 옮기거나 16ms 간격으로 스로틀링합니다.

3. **CSS 변수로 좌표 전달**  
   JS는 `--gf-px`, `--gf-py` CSS 커스텀 프로퍼티만 갱신하고, 실제 transform은 CSS(`calc(var(--gf-px) * ...)`)가 컴포지터 스레드에서 처리합니다. 이는 이미 `glass-folder-cards.tsx:939` 등에서 적용 중인 패턴입니다.

```tsx
React.useEffect(() => {
  const el = rootRef.current;
  if (!el) return;
  let raf = 0;
  let px = 0;
  let py = 0;
  // 카드 rect 한 번만 계산
  let rect = el.getBoundingClientRect();
  const updateRect = () => { rect = el.getBoundingClientRect(); };
  window.addEventListener('resize', updateRect);

  const write = () => {
    raf = 0;
    el.style.setProperty('--gf-px', px.toFixed(3));
    el.style.setProperty('--gf-py', py.toFixed(3));
  };
  const move = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    px = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    py = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    if (!raf) raf = requestAnimationFrame(write);
  };
  const leave = () => {
    px = 0; py = 0;
    if (!raf) raf = requestAnimationFrame(write);
  };
  el.addEventListener("pointermove", move, { passive: true });
  el.addEventListener("pointerleave", leave);
  return () => {
    window.removeEventListener('resize', updateRect);
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerleave", leave);
    cancelAnimationFrame(raf);
  };
}, []);
```

### 3.3 `will-change` 사용 가이드

현재 `glass-folder-cards.tsx` CSS에서 `will-change`를 명시적으로 사용하지는 않으나, `transform`, `backdrop-filter`, `filter` 등이 잦게 변경되는 요소(.gf-tilt, .gf-front, .gf-sheet)가 다수 있습니다.

- **상시 `will-change: transform` 적용 금지**: 모든 카드에 상시 적용하면 컴포지터 레이어가 과다 생성되어 GPU 메모리 오버헤드가 발생합니다.
- 상호작용 시작 직전에만 동적으로 추가하고 종료 후 제거합니다.

```tsx
// 상호작용 시작 (pointerenter)
el.style.willChange = 'transform';
// 상호작용 종료 (pointerleave, transitionend 후)
el.style.willChange = 'auto';
```

- transform만 변경되는 요소에는 `will-change: transform`을, 스크롤 중 위치가 변하는 요소에는 `will-change: transform`을 한정 적용합니다.

### 3.4 prefers-reduced-motion

`globals.css:65-74`와 `glass-folder-cards.tsx:1314-1321`에서 `prefers-reduced-motion: reduce`를 처리하고 있습니다. parallax(`--gf-px`, `--gf-py`) 역시 이 매체 쿼리에 따라 비활성화되도록 보장합니다(`glass-folder-cards.tsx:1320`: `.gf-tilt { transform: none; }`).

---

## 4. Backdrop-filter 최적화 전략

### 4.1 문제 현황

`glass-folder-cards.tsx`에서 무거운 backdrop-filter가 다수 요소에 적용됩니다:

| 요소 | backdrop-filter | 위치 |
|------|-----------------|------|
| `.gf-front` | `blur(22px) saturate(1.5)` | 라인 1130-1131 |
| `.gf-key--more` | `blur(10px)` | 라인 1244-1245 |
| `.gf-menu` | `blur(24px) saturate(1.6)` | 라인 1274-1275 |

`backdrop-filter: blur()`는 스크롤/애니메이션 중 매 프레임 배경 영역을 다시 래스터화하므로, 스크롤 시 컴포지터와 GPU에 부담이 큽니다. Next.js 앱은 `overflow-hidden` 메인 레이아웃이지만 카드 내부 스크롤/호버 시에도 비용이 발생합니다.

### 4.2 개선 방안

1. **blur 반경 축소**  
   `.gf-front`: `blur(22px)` → `blur(10px)` 또는 `blur(8px)`  
   `.gf-menu`: `blur(24px)` → `blur(12px)`  
   지각적 차이는 작지만 GPU 래스터화 비용은 크게 줄어듭니다.

2. **정적 배경 대체**  
   backdrop-filter가 꼭 필요한 영역이 아니면 `background: rgba(...)` 반투명 색상으로 대체합니다. 이는 컴포지터 비용 없이 유리 효과를 근사할 수 있습니다.

3. **호버/포커스 시에만 backdrop-filter 적용**  
   기본 상태에서는 간소화된 배경을 사용하고, 상호작용 시에만 backdrop-filter를 켭니다.

```css
.gf-front {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
}
.gf-front:hover, .gf-front:focus-within {
  backdrop-filter: blur(22px) saturate(1.5);
}
```

4. **`contain: paint`로 리페인트 범위 제한**  
   backdrop-filter 적용 요소에 `contain: paint`를 추가해 해당 요소 내부 변경이 전체 페인트에 미치는 영향을 제한합니다.

---

## 5. 번들 크기 추천 (Next.js)

### 5.1 번들 분석 도구 도입

`next.config.js`에 번들 분석기를 추가해 정기적으로 번들 크기를 점검합니다.

```bash
npm install --save-dev @next/bundle-analyzer
```

```js
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
});
```

실행: `ANALYZE=true npm run build`

### 5.2 클라이언트 컴포넌트 최소화

`GlassFolder`는 `"use client"`이며, `page.tsx` 서버 컴포넌트에서 3개 인스턴스를 렌더링합니다. 클라이언트 측 JS 크기가 늘어나는 원인이 됩니다.

- 정적으로 보여야 하는 카드 콘텐츠는 서버 컴포넌트로 분리하고, 상호작용(parallax, 열기/닫기)만 클라이언트 컴포넌트로 캡슐화합니다.
- `next/dynamic`으로 `GlassFolder`를 지연 로드해 초기 번들 크기를 줄일 수 있습니다(단, 화면에 바로 보여야 하는 경우 SSG prerender와 조화 필요).

### 5.3 Canvas 아트 코드 분할

`glass-folder-cards.tsx`는 아트 생성 로직(`createArtJob`, `makeFbm` 등)과 UI 렌더링을 하나의 파일에 담고 있습니다(1,300줄 이상). 아트 생성 로직을 별도 모듈로 분리하고, `next/dynamic`으로 지연 로드하거나 서버 측에서 미리 렌더링된 이미지 Data URL을 주입하는 방식을 고려합니다.

### 5.4 의존성 검토

- `lucide-react`: 아이콘 사용 시 필요한 아이콘만 개별 임포트합니다(`import { Plus } from 'lucide-react'` 등). 현재 코드에서는 직접 SVG를 사용하므로 문제가 없으나, 향후 도입 시 유의합니다.
- `clsx`, `tailwind-merge`: 번들 크기에 미치는 영향이 작으나, 중복 유틸리티는 피합니다.

---

## 6. 이미지 최적화 (Unsplash, WebP/AVIF)

### 6.1 현재 상태

- `GlassFolder`는 `image` props로 외부 이미지를 받을 수 있습니다(`glass-folder-cards.tsx:729-733`, `787-789`).
- 아트 워크는 canvas로 생성되므로 이미지 요청이 없습니다(현재 구현 상태 강점).
- `img` 태그에 `width`, `height`, `draggable={false}`가 설정되어 있습니다.

### 6.2 권장 조치

1. **Next.js `next/image` 사용**  
   외부 이미지(`image` props)는 `next/image`로 래핑해 자동 최적화(크기 조정, 포맷 변환)를 받습니다. Unsplash 이미지는 `next/image`의 `loader` 또는 `unoptimized` 옵션과 함께 사용합니다.

```tsx
import Image from 'next/image';
<Image src={file.image} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" priority={false} />
```

2. **포맷**: WebP를 우선 사용하고, 브라우저 지원이 있는 경우 AVIF를 사용합니다. Next.js `next/image`는 기본적으로 WebP/AVIF를 지원합니다.

3. **지연 로딩**: 뷰포트 외 이미지는 `loading="lazy"`(기본값)를 사용합니다. above-the-fold 이미지만 `priority`를 설정합니다.

4. **Unsplash 소스**: `source.unsplash.com` 같은 외부 랜덤 이미지 서비스는 캐싱과 오프라인 동작이 어렵습니다. 직접 다운로드해 최적화한 후 `/public`에 저장하거나 이미지 CDN을 사용합니다.

5. **디코딩**: `decoding="async"`를 추가해 이미지 디코딩이 메인 스레드를 차단하지 않게 합니다.

```tsx
<img src="thumbnail.webp" loading="lazy" decoding="async" width="300" height="200" alt="" />
```

---

## 7. 캐싱 전략

### 7.1 정적 자산 캐시

Next.js 프로덕션 빌드 출력은 정적 자산(JS, CSS, 이미지)에 대해 자동으로 해시된 파일명을 생성합니다. `next start` 또는 정적 호스팅(Vercel, Netlify, S3 등)에서 장기 캐시를 적용합니다.

- 정적 자산: `Cache-Control: public, max-age=31536000, immutable`
- HTML: `Cache-Control: no-cache` 또는 `stale-while-revalidate`

### 7.2 ISR / 정적 생성

`page.tsx`는 현재 동적 데이터 없이 정적 콘텐츠만 보여줍니다. `export const dynamic = 'force-static'` 또는 기본 정적 생성을 활용해 빌드 시 HTML을 prerender하고, CDN 엣지에서 캐시합니다.

### 7.3 클라이언트 캐시

- `GlassFolder`의 아트(canvas)는 이미 `artCache` 맵으로 캐시됩니다(`glass-folder-cards.tsx:403`). 동일한 레시피/시드/크기는 재사용되어 네트워크와 계산 비용을 줄입니다. 이 캐시 전략을 유지하되, 메모리 누수 방지를 위해 카드 언마운트 시 사용하지 않는 캐시 항목 정리를 고려합니다(현재는 영구 캐시).
- `appear`/`IntersectionObserver`로 뷰포트 진입 시에만 아트를 그리는 패턴을 유지해 불필요한 초기 로드를 방지합니다.

---

## 8. Core Web Vitals 목표

| 지표 | 목표 | 측정 도구 |
|------|------|-----------|
| LCP (Largest Contentful Paint) | ≤ 2.5초 | Lighthouse, Vercel Speed Insights |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | Lighthouse |
| INP (Interaction to Next Paint) | ≤ 200ms | Lighthouse, web-vitals |
| TTFB (Time to First Byte) | ≤ 600ms | Lighthouse |

### 8.1 측정 및 모니터링

- `web-vitals` 라이브러리를 추가해 실제 사용자 모니터링(RUM)을 수행합니다.

```bash
npm install web-vitals
```

- 정기적으로 `npm run build` 후 Lighthouse 감사를 실행하고 회귀를 방지합니다.
- `ANALYZE=true npm run build`로 번들 크기를 주기적으로 점검합니다.

### 8.2 Next.js 전용 권장 사항

- `next/image`로 이미지 최적화 (LCP 개선)
- `next/font`로 시스템 폰트 최적화 (CLS, FOUT 방지)
- `script` 컴포넌트로 서드 파티 스크립트 지연 로드 (INP 개선)

---

## 9. 체크리스트

- [ ] `glass-folder-cards.tsx`에서 `getBoundingClientRect()`를 마운트 시 한 번만 계산 및 캐시
- [ ] `pointermove` 핸들러에 `{ passive: true }` 추가
- [ ] `requestAnimationFrame` 스로틀링 유지 및 rect 계산 최적화
- [ ] `will-change: transform` 상시 적용 제거, 상호작용 시 동적 추가/제거
- [ ] `backdrop-filter` blur 반경 축소, 호버 시에만 적용
- [ ] `@next/bundle-analyzer` 도입 및 정기적 번들 크기 점검
- [ ] 외부 이미지 `next/image` + WebP/AVIF + `loading="lazy"` 적용
- [ ] 정적 자산 장기 캐시 헤더 설정
- [ ] Lighthouse 점검: LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms
