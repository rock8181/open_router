# PERFORMANCE — OpenRouter 문서 뷰어 (Express + Vanilla JS)

## 1. 개요

본 문서는 `C:\work\openrouter\web_server/` (Express 정적 파일 서버 + 프런트엔드 vanilla JS 문서 뷰어)의 성능 최적화 가이드입니다.

주요 진단 현안:
- 카드당 `mousemove` 이벤트에서 `getBoundingClientRect()` 호출 → 레이아웃 스래싱(thrashing)
- 모든 카드에 `will-change: transform` 적용 → 컴포지터 오버헤드
- 스크롤 중 무거운 `backdrop-filter` 적용
- 지연 로딩(lazy loading) 전략 부재
- 번들 크기 분석 부재

---

## 2. 크리티컬 렌더링 경로 최적화 (Critical Rendering Path)

### 2.1 HTML 머리 내 차단 자원 최소화

`index.html`은 현재 `<head>`에 `style.css`만 링크합니다. 스크립트(`app.js`)는 `<body>` 끝 부분에 위치해 파서 차단을 피하고 있으나, 다음과 같이 개선할 수 있습니다.

- CSS는 필수적인 above-the-fold 스타일만 인라인화하고, 나머지 CSS는 `media="print"` + `onload` 기법 또는 `link rel=preload`로 우선순위를 지정합니다.
- 뷰어 오버레이 등 초기에 보이지 않는 컴포넌트 스타일은 지연 로드 대상에서 제외합니다.

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preload" href="style.css" as="style">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  ...
  <script src="app.js" defer></script>
</body>
```

### 2.2 첫 페인트(FCP) 개선

- 서버 렌더링 HTML에서 초기 문서 카드 일부를 이미 렌더링하여 클라이언트 측 JS 실행 전에도 콘텐츠를 노출합니다(Express 서버 측 렌더링 고려).
- 폰트는 시스템 글꼴 스택을 그대로 사용하므로 웹 폰트 로딩 지연 문제는 없습니다. 현재 `-apple-system, BlinkMacSystemFont, 'Segoe UI', ...`를 사용 중이므로 유지합니다.
- `body { overflow: auto; height: 100dvh; }`는 뷰포트를 즉시 확정하므로 레이아웃 시프트를 줄입니다.

### 2.3 DOM 크기 관리

- `renderGrid()`에서 카드를 모두 한 번에 생성합니다. 문서가 많을 경우 DOM 노드 수가 증가해 레이아웃 비용이 올라갑니다.
- 가상 스크롤링(virtual scrolling) 도입 또는 화면 외 카드는 `content-visibility: auto`를 적용합니다.

```css
.grid {
  /* 항목 수가 많을 때 레이아웃 비용 절감 */
  content-visibility: auto;
  contain-intrinsic-size: 280px 320px;
}
```

---

## 3. 애니메이션 성능

### 3.1 문제: per-card mousemove + getBoundingClientRect

`app.js:194-198`의 `setupParallax`에서 매 `mousemove`마다 `card.getBoundingClientRect()`를 호출합니다. 이는 강제 리플로우(forced reflow)를 유발하고, 다수 카드에 대해 매 프레임 반복되면 레이아웃 스래싱이 발생합니다.

```js
// 문제 코드 (app.js:194-198)
function onMove(e) {
  const rect = card.getBoundingClientRect(); // 강제 레이아웃
  targetX = (e.clientX - rect.left) / rect.width - 0.5;
  targetY = (e.clientY - rect.top) / rect.height - 0.5;
  if (!frame) frame = requestAnimationFrame(update);
}
```

### 3.2 개선 방안

1. **`getBoundingClientRect` 호출을 `requestAnimationFrame` 밖/밖으로 분리**  
   카드 rect는 마우스 이동 시마다 바뀔 필요가 없습니다(카드 크기/위치가 고정). 카드 생성 시 한 번만 계산해 캐시합니다.

2. **`requestAnimationFrame` 스로틀링**  
   이미 `frame` 플래그로 한 번만 RAF를 예약하고 있으나, rect 계산도 RAF 내에서 하거나, 16ms 간격으로 스로틀링합니다.

3. **CSS 변수로 위임**  
   좌표 값을 CSS 커스텀 프로퍼티(`--gf-px`, `--gf-py`)로 쓰고, transform은 CSS가 처리하도록 합니다. JS는 좌표 계산만 담당합니다.

```js
function setupParallax(card) {
  if (prefersReducedMotion.matches) return null;
  const rect = card.getBoundingClientRect(); // 한 번만 계산
  const width = rect.width;
  const height = rect.height;
  const left = rect.left;
  const top = rect.top;

  let frame = null;
  let targetX = 0;
  let targetY = 0;

  function update() {
    frame = null;
    card.style.setProperty('--gf-px', targetX.toFixed(3));
    card.style.setProperty('--gf-py', targetY.toFixed(3));
  }

  function onMove(e) {
    targetX = (e.clientX - left) / width - 0.5;
    targetY = (e.clientY - top) / height - 0.5;
    if (!frame) frame = requestAnimationFrame(update);
  }

  function onLeave() {
    targetX = 0;
    targetY = 0;
    if (frame) {
      cancelAnimationFrame(frame);
      frame = null;
    }
    update();
  }

  card.addEventListener('mousemove', onMove, { passive: true });
  card.addEventListener('mouseleave', onLeave);

  return () => {
    card.removeEventListener('mousemove', onMove);
    card.removeEventListener('mouseleave', onLeave);
    if (frame) cancelAnimationFrame(frame);
    card.style.removeProperty('--gf-px');
    card.style.removeProperty('--gf-py');
  };
}
```

`style.css`에서는 `--gf-px`, `--gf-py`를 사용해 transform을 적용합니다.

```css
.gf-stage {
  transform: translate3d(
    calc(var(--gf-px, 0) * -8px),
    calc(var(--gf-py, 0) * -6px),
    0
  );
}
```

### 3.3 `will-change` 사용 가이드

현재 `style.css:701-702`에서 `.gf-root { will-change: auto; }`로 되어 있으나, 호버 상태 등에서 `transform`, `box-shadow` 등이 자주 변경됩니다.

- **`will-change: transform`을 모든 카드에 상시 적용하지 마십시오.** 컴포지터 레이어를 과다 생성해 메모리와 GPU 메모리 오버헤드를 일으킵니다.
- 상호작용 시작 직전에만 동적으로 추가하고, 상호작용 종료 후 제거합니다.

```js
// 상호작용 시작 시
card.style.willChange = 'transform';
// 상호작용 종료 후 (mouseleave / transitionend 후)
card.style.willChange = 'auto';
```

- transform만 변경되는 요소에는 `will-change: transform`, 스크롤 중 위치가 변하는 요소에는 `will-change: transform, scroll-position` 등 필요한 경우에만 한정 적용합니다.

### 3.4 prefers-reduced-motion 존중

현재 `prefers-reduced-motion`을 확인해 애니메이션을 비활성화하는 로직이 있습니다(`app.js:7`, `style.css:739-750`). 유지하되, parallax 역시 해당 매체 쿼리에 따라 비활성화되도록 `setupParallax`에서 조기에 리턴하고 있습니다(`app.js:179`).

---

## 4. Backdrop-filter 최적화 전략

### 4.1 문제 현황

`style.css`에서 다음과 같이 무거운 backdrop-filter가 다중 요소에 적용됩니다:

- `.gf-back`, `.gf-front`: `blur(24px) saturate(160%)` (라인 516-517)
- `.gf-sheet`: `blur(18px) saturate(140%)` (라인 562-563)
- `.gf-menu`: `blur(16px)` (라인 622-623)

`backdrop-filter: blur()`는 스크롤/애니메이션 중 매 프레임 배경 영역을 다시 래스터화하므로, 특히 스크롤 시 컴포지터와 GPU에 부담이 큽니다.

### 4.2 개선 방안

1. **blur 반경 축소**  
   `blur(24px)` → `blur(12px)` 또는 `blur(8px)`로 낮춥니다. 지각적 차이는 작지만 GPU 비용은 크게 줄어듭니다.

2. **반투명 색상 대체**  
   backdrop-filter가 꼭 필요한 영역이 아니면 `background: rgba(...)` 반투명 색상으로 대체합니다. 이는 컴포지터 비용 없이도 유리 효과를 근사할 수 있습니다.

3. **정적 요소에는 backdrop-filter 미적용, 상호작용 시에만 적용**  
   스크롤 중에는 backdrop-filter를 끄고, 호버/포커스 시에만 켭니다.

```css
.gf-back, .gf-front {
  backdrop-filter: blur(12px) saturate(120%);
  -webkit-backdrop-filter: blur(12px) saturate(120%);
}

/* 스크롤 중에는 간소화 */
@media (hover: none) {
  .gf-back, .gf-front {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: rgba(30, 41, 59, 0.8);
  }
}
```

4. **`contain: paint`로 리페인트 범위 제한**  
   backdrop-filter 적용 요소에 `contain: paint`를 추가해 해당 요소 내부 변경이 전체 페인트에 미치는 영향을 제한합니다.

---

## 5. 번들 크기 분석 (Bundle Size)

웹 서버 애플리케이션은 번들러(webpack/vite 등)를 사용하지 않는 순수 vanilla JS 프로젝트입니다. `public/app.js`, `public/style.css`가 직접 제공됩니다.

### 5.1 권장 조치

1. **파일 크기 측정**  
   `app.js`와 `style.css`의 기즈핑 전/후 크기를 정기적으로 측정합니다.

```powershell
# 예시: 파일 크기 확인
(Get-Item "C:\work\openrouter\web_server\public\app.js").Length
(Get-Item "C:\work\openrouter\web_server\public\style.css").Length
```

2. **압축 활성화**  
   Express 서버(`src/server.js`)에서 정적 파일에 gzip/brotli 압축을 적용합니다(`compression` 미들웨어 사용 또는 Express 내장 정적 서버 옵션).

3. **미사용 CSS 제거**  
   사용하지 않는 CSS 클래스(예: 미사용 유틸리티 클래스)를 제거해 `style.css` 크기를 줄입니다.

4. **JS 최소화**  
   프로덕션 배포 전 `app.js`를 terser 등으로 압축합니다.

---

## 6. 이미지 최적화 (Unsplash, WebP/AVIF)

현재 웹 서버 애플리케이션은 이미지를 직접 사용하지 않습니다(텍스트 문서 뷰어). 다만 추후 문서 �네일/미리보기 이미지를 추가할 경우:

1. **형식**: WebP를 우선 사용하고, 브라우저 지원이 있는 경우 AVIF를 사용합니다. Fallback으로 JPEG/PNG를 제공합니다.
2. **크기**: 화면에 표시될 최대 크기로 리사이즈합니다. 불필요한 고해상도 이미지는 로드하지 않습니다.
3. **지연 로딩**: `loading="lazy"` 속성을 사용해 뷰포트 외 이미지는 지연 로드합니다.
4. **Unsplash 소스**: Unsplash 이미지를 사용할 경우 `source.unsplash.com` 대신 직접 다운로드해 최적화한 후 자체 서버에서 제공합니다(외부 의존성 제거 및 오프라인 동작 보장).
5. **디코딩**: `decoding="async"`를 추가해 이미지 디코딩이 메인 스레드를 차단하지 않게 합니다.

```html
<img src="thumbnail.webp" loading="lazy" decoding="async" width="300" height="200" alt="...">
```

---

## 7. 캐싱 전략

Express 정적 파일 서버(`src/server.js`)에서 정적 자산에 대한 캐시 제어 헤더를 설정합니다.

### 7.1 정적 자산 캐시

```js
// src/server.js 예시
app.use(express.static('public', {
  maxAge: '1d', // HTML은 단기 캐시
  setHeaders: (res, path) => {
    if (path.endsWith('.css') || path.endsWith('.js')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));
```

- CSS/JS: `public, max-age=31536000, immutable` (파일명 해시로 버전 관리 시)
- HTML: `no-cache` 또는 단기 `max-age` (최신 콘텐츠 보장)
- API 응답 (`/api/documents`, `/api/search`, `/api/view`): `Cache-Control: no-cache` 또는 ETag/Last-Modified 기반 조건부 캐시

### 7.2 서비스 워커(선택)

반복 방문 시 정적 자산을 캐시하여 오프라인/느린 네트워크에서도 즉시 로드되도록 서비스 워커 도입을 고려합니다.

---

## 8. Core Web Vitals 목표

| 지표 | 목표 | 측정 도구 |
|------|------|-----------|
| LCP (Largest Contentful Paint) | ≤ 2.5초 | Lighthouse, Chrome UX Report |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | Lighthouse |
| INP (Interaction to Next Paint) | ≤ 200ms | Lighthouse, web-vitals |
| TTFB (Time to First Byte) | ≤ 600ms | Lighthouse |

### 8.1 측정 및 모니터링

- `web-vitals` 스크립트를 추가해 실제 사용자 모니터링(RUM)을 수행합니다.
- 정기적으로 Lighthouse 감사를 실행하고 회귀를 방지합니다.

```html
<script defer src="https://unpkg.com/web-vitals@4/dist/web-vitals.attribution.js"></script>
```

---

## 9. 체크리스트

- [ ] `app.js`에서 `getBoundingClientRect()`를 카드 생성 시 한 번만 계산하도록 수정
- [ ] `mousemove` 핸들러에 `{ passive: true }` 추가
- [ ] `will-change: transform` 상시 적용 제거, 상호작용 시 동적 추가/제거
- [ ] `backdrop-filter` blur 반경 축소 및 스크롤 시 간소화
- [ ] 정적 자산에 gzip/brotli 압축 및 캐시 헤더 적용
- [ ] 이미지 추가 시 WebP/AVIF + `loading="lazy"` 적용
- [ ] Lighthouse 점검: LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms
