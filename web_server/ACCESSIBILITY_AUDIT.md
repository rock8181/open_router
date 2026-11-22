# OpenRouter 웹 서버 접근성 감사 보고서

**대상 디렉토리**: `web_server/public/`  
**대상 파일**: `index.html`, `style.css`, `app.js`  
**감사 기준**: WCAG 2.1 AA, 터치 타겟 44×44px, 스크린 리더 호환성  
**작성 일자**: 2026-11-21  
**감사자**: Kilo (접근성 전문가)

---

## 1. 개요

OpenRouter 스터디 문서 뷰어 프론트엔드 정적 파일 3개에 대한 접근성 감사를 수행했습니다. 전체적으로 의미론적 HTML, ARIA 속성, 키보드 네비게이션 기초가 잘 갖춰져 있으나, 명도 대비, 포커스 관리, 다이얼로그 포커스, 중첩 인터랙티브 요소, `prompt()` 사용 등 수정 필요한 항목이 다수 발견되었습니다.

---

## 2. WCAG 2.1 AA 준수 체크리스트

| # | 검사 항목 | 기준 | 상태 | 세부 내용 |
|---|-----------|------|------|-----------|
| 2.1 | 명도 대비 | 일반 텍스트 4.5:1, 대문자/큰 텍스트 3:1 | ⚠️ 부분 준수 | 일부 텍스트(부제목, 배지, 코드)가 4.5:1 미만 |
| 2.2 | 키보드 네비게이션 | 모든 대화형 요소 탭 순서 도달 가능 | ⚠️ 부분 준수 | 카드 `role="button"`는 키보드 처리됨. 뷰어 오버레이 `div.focus()`는 `tabindex` 없이 포커스 불가 |
| 2.3 | 포커스 표시 | `:focus-visible` 표시 필요 | ✅ 준수 | 버튼, 입력, 카드에 `focus-visible` 아웃라인 구현됨 |
| 2.4 | ARIA 라벨 및 역할 | 대화형 요소에 접근 가능한 이름 필요 | ✅ 준수 | 버튼에 `aria-label`, 영역에 `aria-label`, 다이얼로그에 `role="dialog" aria-modal` |
| 2.5 | 스킵 투 콘텐츠 링크 | 페이지 첫 포커스 가능 요소로 스킵 링크 | ✅ 준수 | `#grid`로 스킵 링크 구현됨 (`index.html:10`) |
| 2.6 | 언어 속성 | `<html lang>` 필요 | ✅ 준수 | `<html lang="ko">` (`index.html:2`) |
| 2.7 | 이미지 대체 텍스트 | `img`에 `alt` 필요 | NA | `index.html`에 `img` 태그 없음 |
| 2.8 | 폼 라벨 | 모든 입력에 라벨 필요 | ✅ 준수 | 검색 입력에 `<label>` + `aria-label` 중복 지정됨 |

### 2.1 명도 대비 상세

측정 가능한 정적 색상 조합 결과 (대략적):

| 텍스트 색상 | 배경 색상 | 추정 대비 | 비고 |
|-------------|-----------|-----------|------|
| `#94a3b8` (nav h3, brand p) | `#1e293b` (사이드바) | 약 2.8:1 | **미달** (4.5:1 필요) |
| `#94a3b8` (breadcrumb) | `#0f172a` (본문 배경) | 약 4.3:1 | **경미 미달** (4.5:1 필요) |
| `#475569` (type-badge 파일) | `#1e293b` (카드) | 약 1.4:1 | **심각 미달** |
| `#818cf8` (type-badge 폴더) | `#1e1b4b` (배지 배경) | 약 4.0:1 | **경미 미달** |
| `#f472b6` (코드 인라인) | `#334155` (코드 배경) | 약 1.8:1 | **심각 미달** |
| `#e2e8f0` (본문 텍스트) | `#0f172a` | 약 7.4:1 | ✅ 준수 |
| `#38bdf8` (악센트) | `#0f172a` / `#1e293b` | 약 5-8:1 | ✅ 준수 |

### 2.2 키보드 네비게이션 상세

- 사이드바 버튼(`.nav-item`), 검색 버튼, 툴바 버튼, 뷰어 버튼 모두 `<button>` 요소로 탭 순서에 포함됨 ✅
- 카드(`.gf-root`)는 `div`에 `role="button"`, `tabIndex=0`, Enter/Space 핸들러 구현됨 (`app.js:82-85,125-130`) ⚠️ (네이티브 `<button>` 사용 권장)
- 뷰어 오버레이(`viewerOverlay`)는 `role="dialog"`이나 `tabindex`가 없어 `viewerOverlay.focus()`가 작동하지 않음 (`app.js:197`) ❌
- 검색 입력 Enter 키 처리 구현됨 (`app.js:369-374`) ✅
- Escape 키로 뷰어 닫기 구현됨 (`app.js:395-399`) ✅

---

## 3. 터치 타겟 분석 (44×44px 최소)

| 요소 | 선택자 | 최소 크기 | 상태 | 비고 |
|------|--------|-----------|------|------|
| 사이드바 네비게이션 아이템 | `.nav-item` | `min-height: 44px` | ✅ | `style.css:83` |
| 검색 입력 | `.search-box input` | `min-height: 44px` | ✅ | `style.css:115` |
| 검색 버튼 | `.search-box button` | `min-height: 44px` | ✅ | `style.css:137` |
| 툴바 버튼 | `.toolbar button` | `min-width/height: 44px` | ✅ | `style.css:194-195` |
| 뷰어 액션 버튼 | `.viewer-actions button` | `min-width/height: 44px` | ✅ | `style.css:334-335` |
| 기어/메뉴 버튼 | `.gf-menu` | `44×44px` | ✅ | `style.css:615-618` |
| 추가/더보기 버튼 (카드 내부) | `.gf-btn-add`, `.gf-btn-more` | 미지정 | ❌ | 명시적 최소 크기 없음, 기본 브라우저 버튼 크기로 44px 미만일 수 있음 |
| 스킵 링크 | `.skip-link` | 패딩 8×16px | ⚠️ | 포커스 시 노출되지만 기본 터치 영역이 44px 미만일 수 있음 |

**결론**: 대부분의 주요 인터랙티브 요소는 44×44px를 만족하지만, 카드 내부의 `.gf-btn-add` / `.gf-btn-more` 버튼은 명시적 최소 터치 영역이 없어 모바일에서 터치하기 어려울 수 있습니다.

---

## 4. 스크린 리더 테스트 노트

### 양호한 점
- `<html lang="ko">`로 한국어 음성 합성 적용 ✅ (`index.html:2`)
- 스킵 링크 "문서 그리드로 건너뛰기"로 메인 콘텐츠로 빠르게 이동 ✅ (`index.html:10`)
- 사이드바에 `aria-label="폴더 네비게이션"` ✅ (`index.html:13`)
- 검색 입력에 `<label>`과 `aria-label="문서 검색"` ✅ (`index.html:24-25`)
- 상태 메시지에 `aria-live="polite"`로 동적 변경 사항 발표 ✅ (`index.html:28`)
- 뷰어 오버레이에 `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-hidden` ✅ (`index.html:47`)
- 그리드 영역에 `role="region"`, `aria-label="문서 목록"` ✅ (`index.html:45`)
- 카드에 `aria-label`(문서/폴더 이름) ✅ (`app.js:84`)

### 우려 사항 및 개선 필요
1. **`aria-expanded="false"`가 카드에 잘못 부여됨** (`app.js:85`) — 카드는 확장/축소 기능이 없으므로 `aria-expanded`는 misleading합니다. 제거해야 합니다.
2. **중첩 인터랙티브 요소** — `role="button"`인 카드(`div`) 내부에 실제 `<button>`(`.gf-btn-add`, `.gf-btn-more`)이 포함됨. 스크린 리더가 중첩 버튼을 혼란스럽게 해석할 수 있습니다. `stopPropagation`은 클릭 이벤트만 막으며, 가상 커서 탐색에는 영향을 미치지 않습니다.
3. **`prompt()` 사용** — `app.js:138, 152, 351, 358`에서 네이티브 `prompt()`를 사용. 스크린 리더에서 접근성이 낮고 키보드 전용 사용자에게 차단 요소가 됩니다. 모달 다이얼로그로 대체해야 합니다.
4. **검색 입력의 중복 이름 제공** — `<label for>`와 `aria-label`이 모두 존재. 중복은 해롭지 않지만 한 가지만 사용하는 것이 깨끗합니다.
5. **뷰어 오버레이 포커스 불가** — `div`에 `tabindex`가 없어 `.focus()`가 작동하지 않음. `tabindex="-1"` 추가 필요.
6. **동적 콘텐츠 알림** — `role="alert"`가 동적 `innerHTML` 삽입에 사용됨 (`app.js:64, 201, 232`). alert 역할은 적절하나, 콘텐츠가 그리드 안에 삽입되어 화면 낭독기가 즉시 읽지 못할 수 있습니다. `aria-live="assertive"` 지역을 별도 두는 것이 더 안전합니다.

---

## 5. 특정 파일:줄 이슈 및 수정 필요사항

### index.html

| 파일:줄 | 이슈 | WCAG 기준 | 심각도 | 수정 필요 내용 |
|---------|------|-----------|--------|---------------|
| `index.html:25` | 검색 입력에 `<label>`과 `aria-label` 중복 | 2.4.7 (라벨) | P3 | `<label>` 또는 `aria-label` 중 하나만 유지 |
| `index.html:119` | `input:focus { outline: none; }` | 2.4.7 (포커스 표시) | P2 | `:focus`에서 아웃라인 제거하지 말 것. `:focus-visible`만 사용 |

### style.css

| 파일:줄 | 이슈 | WCAG 기준 | 심각도 | 수정 필요 내용 |
|---------|------|-----------|--------|---------------|
| `style.css:65-68` | `.nav h3` 색상 `#94a3b8` 배경 `#1e293b`, 대비 약 2.8:1 | 1.4.3 (명도 대비) | P1 | 텍스트 색상을 더 밝은 색(예: `#cbd5e1`)으로 변경 |
| `style.css:171-174` | `.breadcrumb` 색상 `#94a3b8` 배경 `#0f172a`, 대비 약 4.3:1 | 1.4.3 | P2 | `#cbd5e1`로 상향 |
| `style.css:279-282` | `.card.type-file .type-badge` 배경 `#475569` 텍스트 `#e2e8f0` 대비 약 1.4:1 | 1.4.3 | P1 | 배경/텍스트 대비 대폭 상향 |
| `style.css:274-277` | `.card.type-directory .type-badge` 배경 `#818cf8` 텍스트 `#1e1b4b` 대비 약 4.0:1 | 1.4.3 | P2 | 텍스트를 `#ffffff` 또는 `#f8fafc`로 |
| `style.css:389` | `.viewer-content code` 색상 `#f472b6` 배경 `#334155`, 대비 약 1.8:1 | 1.4.3 | P1 | 코드 텍스트를 `#f8fafc`로 변경 |
| `style.css:719-725` | `button:focus-visible` 등에 아웃라인 적용 (양호) | 2.4.7 | — | 유지 (참고용) |

### app.js

| 파일:줄 | 이슈 | WCAG 기준 | 심각도 | 수정 필요 내용 |
|---------|------|-----------|--------|---------------|
| `app.js:82-86` | `div`에 `role="button"`, `aria-expanded="false"` (확장 기능 아님) | 4.1.2 (역할) | P2 | `aria-expanded` 제거. 네이티브 `<button>` 고려 |
| `app.js:91-104` | `role="button"` 카드 내부에 `<button>` 중첩 | 4.1.2 | P2 | 카드를 `<button>`으로 변경하거나 내부 버튼을 카드 밖으로 분리 |
| `app.js:138` | `prompt()`로 새 문서/폴더 이름 입력 | 2.1.1 (키보드) | P1 | 접근 가능한 모달 폼으로 대체 |
| `app.js:152` | `prompt()`로 더보기 동작 | 2.1.1 | P1 | 모달 다이얼로그로 대체 |
| `app.js:197` | `viewerOverlay.focus()` 하지만 `tabindex` 없음 | 2.1.1, 2.4.7 | P1 | `tabindex="-1"` 추가 |
| `app.js:351` | `prompt()`로 추가 동작 | 2.1.1 | P1 | 모달로 대체 |
| `app.js:358` | `prompt()`로 전체 작업 | 2.1.1 | P1 | 모달로 대체 |

---

## 6. 수정 우선순위

### P1 (치명적) — 즉시 수정 필요

1. **명도 대비 심각 미달**
   - `style.css:279-282`: 파일 타입 배지 텍스트 대비 약 1.4:1
   - `style.css:389`: 인라인 코드 텍스트 대비 약 1.8:1
   - 시각 장애 사용자가 텍스트를 읽을 수 없음

2. **`prompt()` 사용 (키보드 차단)**
   - `app.js:138, 152, 351, 358`: 네이티브 `prompt()`는 스크린 리더 및 키보드 전용 사용자에게 접근 불가

3. **뷰어 오버레이 포커스 불가**
   - `app.js:197`: `tabindex` 없이 `div.focus()` 호출, 모달 오픈 시 포커스 이동 실패

### P2 (높음) — 단기 내 수정

1. **명도 대비 경미 미달**
   - `style.css:65-68`: `.nav h3` 대비 약 2.8:1
   - `style.css:171-174`: breadcrumb 대비 약 4.3:1
   - `style.css:274-277`: 폴더 타입 배지 대비 약 4.0:1

2. **중첩 인터랙티브 요소**
   - `app.js:82-104`: `role="button"` div 내부의 `<button>` 요소

3. **`aria-expanded` 오용**
   - `app.js:85`: 카드에 확장/축소 기능 없음에도 `aria-expanded="false"`

4. **`:focus`에서 아웃라인 제거**
   - `style.css:119`: `input:focus { outline: none; }`

### P3 (중간) — 중장기 개선

1. **검색 입력 라벨 중복**
   - `index.html:24-25`: `<label>`과 `aria-label` 중복 지정

2. **카드 네이티브 버튼화**
   - `app.js:82-86`: `div role="button"`을 `<button>`으로 변경 권장

3. **터치 타겟 명시**
   - 카드 내 `.gf-btn-add`, `.gf-btn-more`에 `min-height: 44px` 추가

4. **동적 콘텐츠 live 지역 분리**
   - `app.js:64, 201, 232`: `role="alert"` 대신 전용 `aria-live="assertive"` 지역 사용 고려

---

## 7. 수정 예시 (코드 스니펫)

### style.css — 대비 개선 예시

```css
.nav h3 {
  color: #cbd5e1; /* #94a3b8 → #cbd5e1 */
  ...
}

.breadcrumb {
  color: #cbd5e1; /* #94a3b8 → #cbd5e1 */
  ...
}

.card.type-file .type-badge {
  background: #38bdf8;
  color: #0f172a;
  ...
}

.card.type-directory .type-badge {
  background: #818cf8;
  color: #ffffff; /* #1e1b4b → #ffffff */
  ...
}

.viewer-content code {
  color: #f8fafc; /* #f472b6 → #f8fafc */
  ...
}
```

### app.js — 뷰어 오버레이 포커스 수정

```javascript
// index.html:47에 tabindex="-1" 추가
<div class="viewer-overlay glass" id="viewerOverlay" role="dialog" aria-modal="true" aria-labelledby="viewerTitle" aria-hidden="true" tabindex="-1">

// app.js:197 이미 viewerOverlay.focus() 호출 중, tabindex 추가로 작동
viewerOverlay.focus();
```

### app.js — aria-expanded 제거

```javascript
card.setAttribute('role', 'button');
card.setAttribute('aria-label', item.name);
// card.setAttribute('aria-expanded', 'false');  // 제거
```

---

## 8. 결론

본 감사 결과, OpenRouter 웹 뷰어는 키보드 네비게이션, ARIA 라벨, 스킵 링크, 언어 속성 등 WCAG 2.1 AA의 기초 항목 대부분을 잘 준수하고 있습니다. 그러나 **명도 대비(P1, 3건)**와 **`prompt()` 사용(P1, 4건)**, **뷰어 오버레이 포커스 불가(P1)**는 즉각적인 사용자 차단 요인이므로 최우선 수정 대상이 됩니다. P2 항목(명도 경미 미달, 중첩 인터랙티브 요소, 포커스 스타일)은 단기 스프린트 내 해결을 권장하며, P3 항목은 지속적 개선 과제로 관리하시기 바랍니다.

수정 후에는 실제 스크린 리더(NVDA, JAWS, VoiceOver) 및 키보드 전용 테스트를 통해 재검증하시기 바랍니다.
