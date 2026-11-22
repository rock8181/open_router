# 접근성 요구사항 (Accessibility Requirements)

## 개요

본 문서는 OpenRouter Study Document Viewer 웹 애플리케이션의 접근성 요구사항을 정의합니다.
WCAG 2.1 AA 수준 준수를 목표로 하며, 스크린 리더 사용자 및 키보드 전용 사용자를 포함하여
모든 사용자가 문서 카드와 뷰어를 사용할 수 있도록 보장합니다.

---

## 1. WCAG 2.1 AA 체크리스트

### 1.4.3 대비 (최소) - Contrast (Minimum)
- 일반 텍스트 대비 비율 4.5:1 이상
- 대형 텍스트 (18pt 이상 또는 14pt 볼드 이상) 대비 비율 3:1 이상
- UI 컴포넌트 및 그래픽 객체의 대비 비율 3:1 이상
- 문서 카드의 파일명/폴더명은 반드시 가시 영역에 배치하고 최소 4.5:1 대비 유지
- `.gf-front` 요소의 `opacity: 0` 기본값 제거: 닫힌 카드에서도 파일명이 텍스트로 노출되어야 함

### 1.4.10 리플로우 (Reflow)
- 뷰포트 너비 320px 이에 상응하는 크기에서 가로 스크롤 없이 콘텐츠 제공
- 400% 확대 시에도 콘텐츠가 잘리지 않고 겹치지 않음
- 그리드 카드는 반응형 레이아웃으로 뷰포트 너비에 맞게 재배열됨

### 2.1.1 키보드 (Keyboard)
- 모든 기능이 키보드만으로 조작 가능
- 마우스 전용 기능 없음
- 커스텀 위젯(카드, 뷰어 다이얼로그, 검색창) 모두 키보드 인터랙션 지원

### 2.1.2 키보드 트랩 없음 (No Keyboard Traps)
- 키보드 포커스가 특정 요소에 갇히지 않음
- 모달/다이얼로그에서 Escape로 닫고 포커스가 트리거 버튼으로 복귀
- 키보드 사용자가 어떤 페이지 영역에도 진입/탈출 가능

### 2.4.7 포커스可见 (Focus Visible)
- 포커스 가능 요소에 시각적 포커스 인디케이터 표시
- 포커스 링 최소 2px, 대비 비율 3:1 이상
- `outline: none` 사용 시 대체 포커스 스타일 필수 적용

### 2.4.6 제목 및 레이블 (Headings and Labels)
- 섹션 제목과 폼 레이블이 목적과 내용을 명확히 설명
- 카드, 버튼, 검색창 등 상호작용 요소에 의미 있는 레이블 제공

### 2.5.3 이름에 레이블 포함 (Label in Name)
- 접근성 이름(accessible name)에 보이는 레이블 텍스트 포함
- 버튼의 보이는 텍스트가 aria-label/aria-labelledby와 일치 또는 포함
- 아이콘만 있는 버튼은 aria-label로 텍스트 대체 제공

### 4.1.2 이름, 역할, 값 (Name, Role, Value)
- 커스텀 위젯(카드, 그리드, 뷰어)에 적절한 ARIA 역할 할당
- 상태(확장/축소, 선택 등)는 aria-expanded, aria-pressed 등으로 노출
- 현재 값과 상태 변경이 보조 기술에 프로그램적으로 전달됨

### 4.1.3 상태 메시지 (Status Messages)
- 동적 콘텐츠 업데이트(검색 결과, 알림, 로딩 상태)에 `aria-live="polite"` 사용
- 스크린 리더 사용자가 상태 변경을 인지할 수 있도록 라이브 리전 구현
- 중요 상태 메시지는 `role="alert"` 또는 `aria-live="assertive"` 고려

---

## 2. 스크린 리더 테스트 계획

### 테스트 도구
| 도구 | 플랫폼 | 버전 |
|------|--------|------|
| NVDA | Windows | 최신 안정 버전 |
| JAWS | Windows | 최신 안정 버전 |
| VoiceOver | macOS / iOS | 시스템 기본 |
| TalkBack | Android | 시스템 기본 |

### 테스트 시나리오

#### NVDA (Windows)
- [ ] 문서 카드 목록에서 Tab 이동 시 카드명, 역할(버튼), 확장 상태 announce 확인
- [ ] 카드 활성화 시 뷰어 다이얼로그가 모달로 announce되고 포커스가 이동하는지 확인
- [ ] 검색 입력, 추가 버튼, 더보기 버튼에 aria-label이 올바르게 announce되는지 확인
- [ ] 상태 메시지(예: "파일 업로드 완료")가 polite 리전으로 announce되는지 확인
- [ ] Escape로 뷰어 닫기 시 이전 포커스 위치로 복귀하는지 확인

#### JAWS (Windows)
- [ ] 그리드 영역이 `region` 역할과 aria-label로 announce되는지 확인
- [ ] 카드 간 방향키 공간 탐색 시 카드명이 announce되는지 확인
- [ ] 가상 커서 모드와 포커스 모드 모두에서 카드 활성화 동작 확인
- [ ] 뷰어 다이얼로그가 `aria-modal="true"`로 차단 영역임을 announce하는지 확인

#### VoiceOver (macOS / iOS)
- [ ] VO 키 + Tab으로 모든 상호작용 요소에 접근 가능한지 확인
- [ ] 카드의 확장/축소 상태가 "collapsed"/"expanded"로 announce되는지 확인
- [ ] iOS에서 더블 탭으로 카드 활성화, 뷰어 닫기 동작 확인
- [ ] 로터(Rotor)로 제목, 링크, 폼 컨트롤 탐색 시 카드/버튼이 포함되는지 확인

#### TalkBack (Android)
- [ ] 탐색 동작으로 모든 카드와 버튼에 접근 가능한지 확인
- [ ] 카드명, 역할, 상태가 announce되는지 확인
- [ ] 뷰어 다이얼로그가 모달로 동작하고 외부 터치가 차단되는지 확인
- [ ] TalkBack 제스처로 검색 입력에 포커스하고 텍스트 입력 가능 여부 확인

---

## 3. 키보드 네비게이션 계획

### Tab 순서
1. 건너뛰기 링크 (Skip to main content)
2. 내비게이션 버튼
3. 검색 입력 필드
4. 그리드 카드 (문서/폴더 카드)
5. 뷰어 다이얼로그 (열렸을 때)
6. 뷰어 내 컨트롤 (닫기, 다운로드, etc.)

### 그리드 내 공간 탐색 (방향키)
- `→` / `↓`: 다음 카드로 포커스 이동
- `←` / `↑`: 이전 카드로 포커스 이동
- 그리드 끝에서 첫 번째 카드로 순환 (또는 경계 정지)

### 카드 활성화
- `Enter` 또는 `Space`: 카드 열기 / 뷰어 표시
- 카드는 `role="button"`으로 마크업되어 Enter/Space에 반응

### 뷰어 제어
- `Escape`: 뷰어 다이얼로그 닫기, 포커스가 트리거 카드로 복귀

### 단축키
- `Ctrl + F`: 검색 입력 필드에 포커스
- `Ctrl + N`: 새 폴더 생성 다이얼로그 열기
- `/`: 검색 입력 필드에 포커스 (즉시 검색 모드)

---

## 4. ARIA 요구사항

### 그리드 영역
- 그리드 컨테이너에 `role="region"` 및 `aria-label="문서 그리드"` 또는 `aria-label="폴더 목록"` 부여
- 각 카드에 `role="button"`, `aria-expanded="false|true"` (닫힘/열림 상태), `aria-label` 또는 `aria-labelledby`로 카드명 제공

### 아이콘 전용 버튼
- 추가 버튼 (`+`): `aria-label="추가"` 또는 `aria-label="새 문서"`
- 더보기 버튼 (`···`): `aria-label="더보기"` 또는 `aria-label="옵션"`
- 모든 아이콘 전용 버튼에 텍스트 대체 필수

### 상태 메시지
- 동적 상태 메시지 영역에 `aria-live="polite"` 부여
- 검색 결과 개수, 업로드 완료, 오류 메시지 등에 적용

### 뷰어 다이얼로그
- 뷰어 모달에 `role="dialog"` 및 `aria-modal="true"` 부여
- `aria-labelledby`로 뷰어 제목 연결
- 모달 열릴 때 포커스가 다이얼로그 내로 이동, 닫힐 때 트리거 요소로 복귀

### 메타 정보
- 카드의 메타 정보(파일 크기, 수정 날짜, 작성자 등)에 `aria-describedby` 사용
- 카드명(`aria-labelledby`)과 메타 정보(`aria-describedby`)를 별도로 연결하여 중복 announce 방지

---

## 5. 닫힌 카드 공백 문제 수정 (Blank Cards Fix)

### 문제
- `.gf-front` 요소에 `opacity: 0`이 기본값으로 적용되어 닫힌 카드의 파일명/폴더명이 화면에 표시되지 않음
- 스크린 리더 사용자가 카드명을 전혀 인식할 수 없음
- 시각적 사용자도 닫힌 카드 내용을 확인할 수 없음

### 수정 요구사항
1. 파일/폴더명은 반드시 가시 DOM에 존재해야 함 (`opacity: 0`, `visibility: hidden`, `display: none` 금지)
2. 닫힌 상태에서도 카드명은 텍스트로 노출되어야 하며, 최소 4.5:1 대비 비율 유지
3. 카드 열림/닫힘 상태는 시각적 스타일(예: 배경색, 테두리, 아이콘 회전)으로만 구분하며, 콘텐츠 가시성은 영향 받지 않음
4. `aria-expanded` 속성으로 확장 상태를 보조 기술에 전달

### 예시 마크업
```html
<div role="button" tabindex="0" aria-expanded="false" aria-label="문서명.pdf" aria-describedby="card-meta-1">
  <div class="gf-front">
    <span class="card-title">문서명.pdf</span>
  </div>
  <div id="card-meta-1" class="card-meta">
    2.4 MB · 2026-11-22 수정
  </div>
</div>
```

### CSS 가이드라인
- `.gf-front { opacity: 1; }` (기본값 변경)
- 카드 제목 색상: 배경 대비 4.5:1 이상
- 포커스 가능 카드에 `:focus-visible` 스타일 적용

---

## 6. 구현 우선순위

| 우선순위 | 항목 | 관련 WCAG |
|----------|------|-----------|
| P0 | 닫힌 카드 파일명 가시 노출 및 대비 확보 | 1.4.3, 4.1.2 |
| P0 | 키보드 Tab 순서 및 Enter/Space 활성화 | 2.1.1 |
| P0 | 포커스 표시 스타일 | 2.4.7 |
| P1 | ARIA 역할 및 상태 (region, button, expanded) | 4.1.2 |
| P1 | 아이콘 전용 버튼 aria-label | 2.5.3, 4.1.2 |
| P1 | 상태 메시지 aria-live | 4.1.3 |
| P2 | 스크린 리더 테스트 (NVDA, JAWS, VoiceOver, TalkBack) | 전체 |
| P2 | 320px 리플로우 테스트 | 1.4.10 |
