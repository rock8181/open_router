# MOTION_DESIGN.md — Glass Folder Cards 애니메이션 설계서

대상 컴포넌트: `components/ui/glass-folder-cards.tsx` (Next.js 14 + React 18 + Tailwind)
작성 언어: 한국어

---

## 0. 개요

폴더 카드는 "실제 물체"처럼 보여야 한다. 유저가 보는 건 정지된 그림이 아니라, 상태가 변할 때 물리적으로 반응하는 오브젝트다. 모션은 장식이 아니라 상태 변화를 알리는 신호이며, 과하지 않게 한 개만 강조하고 나머지는 정숙하게 둔다.

현 문제:
- `+` 글리프의 자동 회전(gf-turn): 유저 트리거 없는 모션 = 일반적인 디폴트
- 메타 텍스트의 흔들림(gf-roll): 산발적인 입장 모션
- 모든 폴더에 적용되는 단계별 입장(reveal): 과도한 스태거링
- `prefers-reduced-motion` 미지원
- 모든 트랜지션에 하나의 지속 시간 적용

---

## 1. 애니메이션 원칙

### 1.1 상황 인식 타이밍 (Context-aware timing)

동작의 지속 시간과 이징은 "무엇이" "왜" 변하는지에 따라 달라져야 한다.

| 상태 변화 | 의미 | 지속 시간 | 예 |
|---|---|---|---|
| 입장(appear) | 새로 나타남 | 200–300 ms | 폴더 첫 노출, 메뉴 열림 |
| 퇴장(exit) | 사라짐 | 100–150 ms | 폴더 닫힘, 메뉴 닫힘 |
| 호버/포커스 | 상호작용 대기 | 150–200 ms | 카드 기울기, 파일 부상 |
| 사용자 트리거(클릭/Enter/Space) | 의도적 상태 변경 | 250–350 ms | 폴더 열기/닫기, 파일 추가 |
| 정적 주변 요소 | 배경/장식 | anim 하지 않음 | 리미, 그림자, 아트워크 |

동일 지속 시간을 모두에 적용하지 않는다. 입장은 사용자가 인지할 시간을 줘야 하므로 길게, 퇴장은 인지 부담을 줄여야 하므로 짧게 둔다.

### 1.2 모션이 의미를 전달한다 (Motion conveys meaning)

모션은 장식이 아니라 상태 신호다.

- **열림/닫힘**: 전면 패널이 아래쪽 힌지를 축으로 회전(3D 폴더 플립). 이 한 가지만 입체적으로 움직여 "폴더가 열렸다/닫혔다"를 전달한다.
- **파일 추가**: 추가된 파일만 떨어지는 모션(gf-drop). 기존 파일은 가만히 있어 "무엇이 새로 추가됐는가"를 구별하게 한다.
- **호버/포커스**: 앞면 패널이 살짝 앞으로 기울고 파일들이 살짝 떠오름. "여기 인터랙션 가능"을 알린다.
- **글리프(+ / ···)**: 클릭 시에만 눌림/눌림 해제. 자동 회전이나 pulse는 제거한다.

### 1.3 공간적 연속성 (Spatial continuity)

- 폴더를 열고 닫을 때 전면 패널은 같은 힌지 축(`bottom edge`)을 공유하며 회전한다. 축이 바뀌지 않음.
- 파일 팬(fan)은 슬롯(index)에 고정되고, 열림/닫힘 시에만 부채꼴로 펼쳐진다. 슬롯 순서가 갑자기 바뀌지 않음.
- 입장 시 전판→파일→그림자 순서로 나타내되, 폴더당 스태거는 최대 1개만 둔다(전체 행이 연쇄적으로 튀어나오지 않음).

---

## 2. 지속 시간 사양 (Duration specifications)

| 항목 | 값 | 비고 |
|---|---|---|
| 입장(entrance) | 200–300 ms | `prefers-reduced-motion` 시 즉시(0 ms) |
| 퇴장(exit) | 100–150 ms | 빠르게 사라져 인지 부하 감소 |
| 호버/포커스(hover/focus) | 150–200 ms | 즉각적인 피드백 |
| 폴더 열기/닫기(플립) | 300–350 ms | 가장 느리고 명확한 주 모션 |
| 파일 추가(gf-drop) | 350–450 ms | 물리적 낙하 감, 단 추가된 파일만 |
| 글리프 눌림(active) | 100–120 ms | 터치처럼 즉각적 |
| 메뉴 열림/닫힘 | 120–180 ms | 입장보다 퇴장 짧음 |

모든 `transition-duration`을 하나의 상수로 통일하지 않는다. 요소별로 개별 지정한다.

---

## 3. 이징 함수 (Easing functions)

CSS 커스텀 프로퍼티로 중앙 집중 관리(`--gf-ease-*`).

```css
:root {
  --gf-ease-standard: cubic-bezier(0.2, 0, 0, 1);        /* ease: 빠르고 깔끔한 시작, 감속 마무리 */
  --gf-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);   /* spring: overshoot 포함 탄성 있는 도착 */
  --gf-ease-hinge: cubic-bezier(0.45, 0.05, 0.55, 0.95); /* hinge: 힌지 회전, 일정 속도 감속 */
  --gf-ease-drop: cubic-bezier(0.17, 0.67, 0.83, 0.67);  /* drop: 가속 후 튕김 없이 정지 */
  --gf-ease-reduced: linear;                             /* reduced motion */
}
```

- **ease** (`cubic-bezier(0.2, 0, 0, 1)`): 호버, 포커스, 메뉴, 일반적인 상태 전환.
- **spring** (`cubic-bezier(0.34, 1.56, 0.64, 1)`): 파일 추가, 전면 패널 플립. 탄성이 필요한 물리적 반응.
- **hinge** (`cubic-bezier(0.45, 0.05, 0.55, 0.95)`): 전면 패널 힌지 회전. 문처럼 일정한 회전 흐름.

`steps()`나 `linear`는 일반 트랜지션에 사용하지 않으며, `prefers-reduced-motion`에서만 `linear`/`0s`를 적용한다.

---

## 4. 선호 축소 동작(Prefer-reduced-motion) 정책

`support: @media (prefers-reduced-motion: reduce)`

- 모든 `animation`을 `none !important`로 해제.
- 모든 `transition-duration`과 `transition-delay`를 `0s !important`로 설정.
- `translate`, `rotate`, `scale` 등 위치/회전 변형은 즉시 적용(중간 프레임 생략).
- 포인터 팔라락스(`--gf-px`, `--gf-py`)는 정지(회전/기울기 제거).
- 전면 패널 플립, 파일 팬, 입장 스태거 모두 비활성화. 상태만 즉시 반영.
- 키보드 포커스 리ング, 눌림(active) 피드백은 유지(접근성 피드백은 제거하지 않음).

---

## 5. 하나의 대담한 모션 요소 vs 정숙한 주변 요소

### 5.1 대담한 요소(하나만): 3D 폴더 플립

전면 유리 패널(`gf-front`)이 아래쪽 힌지를 축으로 열림/닫힘 시 회전하는 것이 이 컴포넌트의 **유일한 입체 모션**이다.

- 지속 시간: 300–350 ms
- 이징: `--gf-ease-hinge`
- 축: 하단(`transform-origin: 50% 100%`)
- 여닫힘 시에만 작동. 호버에서는 작동하지 않음(혼란 방지).

### 5.2 정숙한 주변 요소

다음은 **움직이지 않거나 극도로 제한**한다.

- 리미(path), 그림자, 틴트, 스페큘러: 정적. 포인터 팔라락스만 아주 미세하게.
- 아트워크(canvas): 페이드인만, 회전/롤 없음.
- 메타 텍스트, 타이틀: 스캐터/롤 애니메이션 제거.
- 파일 목록: 폴더 닫힘 시 정지. 열릴 때만 팬(fan)으로 펼쳐지며, 슬롯 고정.
- 글리프(`+`): 자동 회전 제거. 클릭/활성 시에만 눌림 효과.

원칙: **한 번에 하나의 요소가 움직인다.** 동시 다발 모션은 금지.

---

## 6. glass-folder-cards.tsx에 필요한 구체적 CSS/JS 변경

### 6.1 변수 블록 갱신 (line ~906–912)

기존 단일 `--gf-ease` / `--gf-spring`을 역할별로 분할하고, durations를 개별 변수로 분리한다.

```css
.gf-root {
  --gf-dur-enter: 240ms;
  --gf-dur-exit: 120ms;
  --gf-dur-hover: 170ms;
  --gf-dur-flip: 320ms;
  --gf-dur-drop: 400ms;
  --gf-ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --gf-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --gf-ease-hinge: cubic-bezier(0.45, 0.05, 0.55, 0.95);
  --gf-ease-drop: cubic-bezier(0.17, 0.67, 0.83, 0.67);
  --gf-hinge: 0deg;
  --gf-lift: 42px;
  --gf-spread: 0px;
  --gf-fan: 0deg;
  --gf-stack: 15px;
  ...
}
```

### 6.2 제거할 모션 (Current problems 해결)

| 제거 대상 | 위치 | 이유 |
|---|---|---|
| `+` 글리프 자동 회전(gf-turn) | `.gf-glyph--plus` 관련 keyframe/animation | 유저 트리거 없는 모션 |
| 메타 텍스트 흔들림(gf-roll) | `.gf-meta` 애니메이션 | 산발적 입장 모션 |
| 모든 폴더 단계별 입장(staged reveal) | `.gf-root:not([data-entered])` 다중 요소 스태거 | 과도한 연쇄 reveal |
| 모든 트랜지션 단일 지속 시간 | `.9s`, `1s`, `1.1s`, `1.2s` 등 고정값 | 역할별 duration 부재 |

구체적 삭제/수정:
1. `gf-turn` keyframe(있다면) 삭제, `.gf-glyph--plus`에서 `animation` 제거. `+`는 클릭/활성 시에만 `transform: scale(.93)` (기존 `.gf-key:active` 유지).
2. `gf-roll` 관련 메타 텍스트 애니메이션 제거. `.gf-meta`는 `transition: color var(--gf-dur-hover) var(--gf-ease-standard)`만 유지.
3. `.gf-root:not([data-entered])`의 다중 요소(`back`, `sheet`, `front`, `key`, `shadow`) 동시 스태거를 단순화: 폴더당 입장은 **전면 패널 1개만** 200–300 ms, 나머지는 즉시 표시 또는 1개만 지연.

### 6.3 전면 패널 플립(3D folder flip) — 단일 대담 모션

`.gf-front`를 열림/닫힘 시에만 회전. 기존 `.gf-root:hover`에서 `--gf-hinge: -11deg`를 제거(호버에서는 회전하지 않음).

```css
.gf-front {
  transform-origin: 50% 100%;
  transform: perspective(760px) rotateX(var(--gf-hinge));
  transition: transform var(--gf-dur-flip) var(--gf-ease-hinge),
              opacity var(--gf-dur-exit) var(--gf-ease-standard);
}
.gf-root[data-open] { --gf-hinge: -24deg; }
.gf-root:hover, .gf-root:focus-within { --gf-hinge: 0deg; /* 호버 시 회전 안 함 */ }
```

호버/포커스는 파일 부상(`--gf-lift`, `--gf-spread`, `--gf-fan`)만 담당하고, 회전은 `data-open`에만 반응하게 한다.

### 6.4 파일 트랜지션 개선

`.gf-sheet`의 transition을 역할별로 분할:

```css
.gf-sheet {
  transition:
    transform var(--gf-dur-flip) var(--gf-ease-spring) calc(var(--gf-depth) * 40ms),
    box-shadow var(--gf-dur-hover) var(--gf-ease-standard),
    opacity var(--gf-dur-exit) var(--gf-ease-standard);
}
```

- `calc(var(--gf-depth) * 40ms)` 스태거는 **폴더 내부 파일 간 최소 간격**으로 유지하되, 폴더 간 연쇄는 제거.
- `translate`/`opacity`를 `1s`에서 `var(--gf-dur-exit)` / `var(--gf-dur-hover)`로 단축.

### 6.5 파일 추가(gf-drop) — 추가된 파일만

```css
.gf-sheet--drop {
  animation: gf-drop var(--gf-dur-drop) var(--gf-ease-drop) both;
}
@keyframes gf-drop {
  0% { translate: 0 -190px; rotate: -9deg; opacity: 0; }
  35% { opacity: 1; }
  72% { translate: 0 10px; rotate: 1deg; }
  100% { translate: 0 0; rotate: 0deg; opacity: 1; }
}
```

`id === dropped`인 파일만 `gf-sheet--drop` 클래스를 부여하고, `onAnimationEnd`로 해제(기존 로직 유지).

### 6.6 입장(appear) 단순화

`appear`/`appearDelay`는 유지하되, 폴더당 **하나의 요소만** 지연 입장:

```css
.gf-root:not([data-entered]) .gf-front { translate: 0 46px; opacity: 0; }
.gf-root:not([data-entered]) .gf-back,
.gf-root:not([data-entered]) .gf-sheet,
.gf-root:not([data-entered]) .gf-key,
.gf-root:not([data-entered]) .gf-shadow { opacity: 0; translate: none; }

.gf-root[data-entered] .gf-front {
  transition: translate var(--gf-dur-enter) var(--gf-ease-standard),
              opacity var(--gf-dur-enter) var(--gf-ease-standard);
}
```

스태거(`calc(var(--gf-depth) * 40ms)` 등)를 입장에서 제거해 "모든 폴더가 연쇄로 튀어나오는" 현상을 없앤다.

### 6.7 prefers-reduced-motion 블록 강화 (line ~1314)

기존 블록을 다음과 같이 대체:

```css
@media (prefers-reduced-motion: reduce) {
  .gf-root *, .gf-root *::before, .gf-root *::after {
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    animation: none !important;
  }
  .gf-tilt { transform: none !important; }
  .gf-front { transform: none !important; }
  .gf-sheet { transform: none !important; }
  .gf-shadow, .gf-art, .gf-spec { transform: none !important; }
  .gf-root[data-open] .gf-sheet { transition-delay: 0s; }
}
```

### 6.8 JS 변경 사항

1. **`entered` 상태 단순화**: `IntersectionObserver`는 유지하되, `appearDelay`는 폴더당 1회만 적용. 전역 스태거 제거.
2. **`bump` 상태**: `gf-front--bump` 애니메이션은 전면 패널 범프에만 유지, `+` 글리프와 연결하지 않음. `key={bump}`는 전면 패널에만.
3. **`dropped`/`gf-sheet--drop`**: 추가된 파일만 애니메이션 대상. 기존 파일은 건드리지 않음.
4. **호버 핸들러**: 포인터 팔라락스(`--gf-px`, `--gf-py`)는 유지하되, `prefers-reduced-motion`일 때는 `requestAnimationFrame` 루프를 정지(선택적 최적화).

### 6.9 메뉴(`.gf-menu`) 지속 시간

```css
.gf-menu {
  transition: opacity var(--gf-dur-enter) var(--gf-ease-standard),
              transform var(--gf-dur-flip) var(--gf-ease-spring),
              visibility 0s var(--gf-dur-flip);
}
.gf-menu[data-open] { transition-delay: 0s; }
```

입장 200–300 ms, 퇴장 100–150 ms로 적용.

---

## 7. 적용 후 검증 체크리스트

- [ ] `+` 글리프에 자동 회전/애니메이션 없음
- [ ] 메타 텍스트에 `gf-roll` 산발 모션 없음
- [ ] 폴더 입장이 폴더당 1개 요소만 지연, 연쇄 스태거 없음
- [ ] `@media (prefers-reduced-motion: reduce)`에서 모든 애니메이션 `none`, transition `0s`
- [ ] 전면 패널 플립만 300–350 ms, 나머지 트랜지션은 항목별 개별 지속 시간
- [ ] 호버/포커스 150–200 ms, 퇴장 100–150 ms, 입장 200–300 ms
- [ ] 이징: ease / spring / hinge / drop 4종 cubic-bezier 정의 및 사용
- [ ] `npm run lint` 통과, `next build` 성공
