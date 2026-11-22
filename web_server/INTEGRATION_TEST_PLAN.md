# OpenRouter 학습 문서 뷰어 — 통합 테스트 계획

대상: `web_server` (Express + 정적 프론트엔드)
테스트 도구: **agent-browser** CLI
테스트 언어: 한국어
서버 URL: `http://localhost:3000` (기본 포트, `PORT` 환경변수로 변경 가능)

---

## 1. 테스트 개요

OpenRouter 학습 문서 뷰어 웹 애플리케이션의 주요 사용자 시나리오를 agent-browser로 검증한다.

각 테스트 세션은 별도 브라우저 인스턴스로 실행하며, 세션 간 상태는 공유하지 않는다.

### agent-browser 주요 명령어

| 명령어 | 설명 | 예시 |
|--------|------|------|
| `agent-browser open <url>` | 지정된 URL을 연다 | `agent-browser open http://localhost:3000` |
| `agent-browser snapshot -i` | 현재 페이지 DOM 스냅샷을 찍고 요소 인덱스(eN)를 출력한다 | `agent-browser snapshot -i` |
| `agent-browser click @eN` | 인덱스 N인 요소를 클릭한다 | `agent-browser click @e3` |
| `agent-browser wait --text "텍스트"` | 지정한 텍스트가 나타날 때까지 기다린다 | `agent-browser wait --text "준비"` |
| `agent-browser fill @eN "텍스트"` | 인덱스 N인 입력 필드에 텍스트를 입력한다 | `agent-browser fill @e1 "claude"` |
| `agent-browser press Enter` | Enter 키를 누른다 | `agent-browser press Enter` |

---

## 2. 테스트 세션 목록

| 세션 | 이름 | 목표 |
|------|------|------|
| 1 | 페이지 오픈 및 제목/스킵 링크 확인 | 페이지 제목과 본문 건너뛰기 링크 노출 검증 |
| 2 | 폴더 탐색 및 빵부럼 업데이트 | 사이드바 폴더 이동 시 빵부럼(브레드크럼) 변경 검증 |
| 3 | 문서 열기 및 뷰어 콘텐츠 확인 | 문서 카드 클릭 후 뷰어 내용 출력 검증 |
| 4 | 뷰어 닫기 및 포커스 복원 | 뷰어 닫기 시 원래 포커스 위치로 복원 검증 |
| 5 | 문서 검색 및 결과 확인 | 검색어 입력 후 검색 결과 목록 노출 검증 |
| 6 | 키보드 탐색 (Tab, Enter, Escape) | 키보드만으로 탐색·열기·닫기 검증 |
| 7 | 다크/라이트 모드 토글 | 테마 전환 동작 및 적용 검증 |
| 8 | 정렬 및 페이지네이션 | 문서 정렬 및 페이지 이동 검증 |
| 9 | 즐겨찾기(스타) 토글 | 문서 스타 추가/제거 검증 |
| 10 | CSV/JSON 내보내기 | 검색 결과 또는 문서 목록 내보내기 검증 |

> 참고: 세션 7~10은 구현 범위에 따라 해당 기능이 없는 경우 "기능 미구현"으로 스킵 처리하고, 구현 시 테스트를 수행한다.

---

## 3. 세션별 상세 테스트 케이스

### 세션 1: 페이지 오픈, 제목 및 스킵 링크 확인

**목표**: 애플리케이션이 정상 로드되고, 페이지 제목과 스킵 링크가 화면에 노출되는지 확인한다.

**agent-browser 명령어 예시**

```bash
# 서버 시작 (별도 터미널)
cd C:\work\openrouter\web_server
npm start

# 테스트 세션 1 실행
agent-browser open http://localhost:3000
agent-browser snapshot -i
agent-browser wait --text "OpenRouter"
agent-browser wait --text "본문 콘텐츠로 건너뛰기"
```

**기대 결과**

- 페이지 제목(`<title>`)이 `OpenRouter 학습 문서 뷰어`로 표시됨
- `<h1>` 또는 브랜드 영역에 `OpenRouter` 텍스트 노출
- 스킵 링크(`href="#main"`)에 `본문 콘텐츠로 건너뛰기` 텍스트 노출
- 스냅샷 출력에 `eN` 인덱스 요소들이 할당됨

**합격/불합격 기준**

| 항목 | 합격 기준 |
|------|-----------|
| 페이지 로드 | HTTP 200, 빈 화면 아님, JS 오류 콘솔 미표시 |
| 제목 확인 | 스냅샷/페이지에 `OpenRouter 학습 문서 뷰어` 포함 |
| 스킵 링크 | `본문 콘텐츠로 건너뛰기` 링크 존재 및 클릭 가능 |

불합격 시: 제목 누락, 스킵 링크 없음, 콘솔에 JS 에러 발생.

---

### 세션 2: 폴더 탐색 및 빵부럼 업데이트

**목표**: 사이드바 폴더 버튼 클릭 시 문서 목록과 빵부럼이 올바르게 업데이트되는지 확인한다.

**agent-browser 명령어 예시**

```bash
agent-browser open http://localhost:3000
agent-browser wait --text "준비"
agent-browser snapshot -i
# 사이드바 폴더 버튼 클릭 (예: @e3 = study/01_skill_claude)
agent-browser click @e3
agent-browser wait --text "study/01_skill_claude"
agent-browser snapshot -i
# 빵부럼 업데이트 확인
agent-browser wait --text "study/01_skill_claude > "
```

**기대 결과**

- 사이드바의 폴더 버튼(`data-root`) 클릭 가능
- 클릭 후 `pageTitle` 및 `breadcrumb`가 해당 폴더 경로로 변경
- 그리드에 해당 폴더 하위 항목이 렌더링됨
- 상태 표시줄이 `준비`로 복귀

**합격/불합격 기준**

| 항목 | 합격 기준 |
|------|-----------|
| 폴더 클릭 | `agent-browser click @eN`로 사이드바 폴더 버튼 클릭 성공 |
| 빵부럼 변경 | 스냅샷에 새로운 폴더 경로 포함 (`> ` 구분자) |
| 목록 렌더링 | 그리드에 카드 하나 이상 노출 |
| 상태 | 상태 텍스트가 `준비`로 변경 |

불합격 시: 빵부럼 미변경, 목록 비어 있음, 클릭 후 상태가 `로드 중...`에 멈춤.

---

### 세션 3: 문서 열기 및 뷰어 콘텐츠 확인

**목표**: 문서 카드를 클릭하면 문서 뷰어 오버레이가 열리고 내용이 올바르게 표시되는지 확인한다.

**agent-browser 명령어 예시**

```bash
agent-browser open http://localhost:3000
agent-browser wait --text "준비"
agent-browser snapshot -i
# 문서 카드 클릭 (예: @e5)
agent-browser click @e5
agent-browser wait --text "닫기"
agent-browser snapshot -i
# 뷰어 콘텐츠 확인
agent-browser wait --text "OpenRouter"
```

**기대 결과**

- 문서 카드 클릭 시 뷰어 오버레이(`viewerOverlay`)가 `aria-hidden="false"`로 표시
- 뷰어 제목(`viewerTitle`)에 문서 파일명 표시
- 뷰어 콘텐츠(`viewerContent`)에 문서 내용(마크다운 렌더링/원문) 표시
- `닫기` 버튼 노출

**합격/불합격 기준**

| 항목 | 합격 기준 |
|------|-----------|
| 뷰어 오픈 | 오버레이 표시, `aria-hidden="false"` |
| 제목 표시 | 뷰어 제목에 파일명 포함 |
| 콘텐츠 표시 | 뷰어 영역에 문서 내용 텍스트 존재 |
| 닫기 버튼 | `닫기` 버튼(`aria-label="뷰어 닫기"`) 존재 |

불합격 시: 뷰어 미열림, 콘텐츠 비어 있음, 파일명과 제목 불일치.

---

### 세션 4: 뷰어 닫기 및 포커스 복원

**목표**: 뷰어를 닫았을 때 이전에 포커스된 요소로 포커스가 복원되는지 확인한다.

**agent-browser 명령어 예시**

```bash
agent-browser open http://localhost:3000
agent-browser wait --text "준비"
agent-browser snapshot -i
# 문서 카드에 포커스 후 뷰어 오픈
agent-browser click @e5
agent-browser wait --text "닫기"
agent-browser snapshot -i
# 뷰어 닫기 버튼 클릭
agent-browser click @eN  # @eN = 닫기 버튼
agent-browser wait --text "준비"
agent-browser snapshot -i
# 포커스 복원 확인 (스냅샷에서 activeElement 확인)
```

**기대 결과**

- `닫기` 버튼 클릭 또는 오버레이 외부 클릭/Escape로 뷰어 닫힘
- 뷰어 오버레이가 `aria-hidden="true"` 및 `display: none`
- 이전에 포커스된 문서 카드로 포커스 복원
- 뷰어 제목·콘텐츠 비워짐

**합격/불합격 기준**

| 항목 | 합격 기준 |
|------|-----------|
| 뷰어 닫기 | 오버레이 `aria-hidden="true"`, `display: none` |
| 포커스 복원 | 스냅샷에서 이전에 클릭한 카드가 포커스 상태 |
| 콘텐츠 초기화 | 뷰어 제목·콘텐츠 텍스트 비어 있음 |

불합격 시: 뷰어 미닫힘, 포커스가 body로 flyaway, 콘텐츠 잔류.

---

### 세션 5: 문서 검색 및 결과 확인

**목표**: 검색 입력 필드에 단어를 입력하고 검색 실행 시 검색 결과가 표시되는지 확인한다.

**agent-browser 명령어 예시**

```bash
agent-browser open http://localhost:3000
agent-browser wait --text "준비"
agent-browser snapshot -i
# 검색 입력 필드에 텍스트 입력 (예: @e4 = searchInput)
agent-browser fill @e4 "claude"
agent-browser press Enter
# 또는 검색 버튼 클릭
# agent-browser click @e5  # 검색 버튼
agent-browser wait --text "검색 결과"
agent-browser snapshot -i
# 결과 카드 확인
agent-browser wait --text "claude"
```

**기대 결과**

- 검색 입력에 텍스트 입력 가능
- 검색 실행 후 페이지 제목이 `검색: "claude"`로 변경
- 빵부럼이 `검색 결과`로 변경
- 검색 결과 카드 하나 이상 노출, 각 카드에 검색어 관련 스니펫 포함
- 결과 개수가 `docCount`에 표시됨

**합격/불합격 기준**

| 항목 | 합격 기준 |
|------|-----------|
| 검색 입력 | `agent-browser fill @eN "claude"` 성공 |
| 검색 실행 | Enter 또는 검색 버튼으로 검색 트리거 |
| 제목 변경 | 페이지 제목에 `검색: "claude"` 포함 |
| 결과 노출 | 그리드에 검색 결과 카드 하나 이상 |
| 결과 개수 | `docCount`에 `N개 결과` 표시 |

불합격 시: 검색어 미입력, 결과 없음(데이터가 있는 경우), 검색어 미반영.

---

### 세션 6: 키보드 탐색 (Tab, Enter, Escape)

**목표**: 마우스 없이 키보드만으로 탐색·문서 열기·뷰어 닫기가 가능한지 확인한다.

**agent-browser 명령어 예시**

```bash
agent-browser open http://localhost:3000
agent-browser wait --text "준비"
# 사이드바 폴더로 Tab 이동
agent-browser press Tab
agent-browser snapshot -i
# Enter로 폴더 열기
agent-browser press Enter
agent-browser wait --text "준비"
# 문서 카드로 Tab 이동 후 Enter로 뷰어 오픈
agent-browser press Tab
agent-browser press Enter
agent-browser wait --text "닫기"
# Escape로 뷰어 닫기
agent-browser press Escape
agent-browser wait --text "준비"
```

**기대 결과**

- Tab 키로 포커스가 순차적으로 이동 (스킵 링크 → 사이드바 → 검색 → 그리드 → 툴바)
- 포커스된 카드에서 Enter로 폴더 진입 또는 문서 뷰어 오픈
- 뷰어 오픈 상태에서 Escape로 뷰어 닫힘
- 뷰어 내부 Tab 순환(포커스 트랩) 동작

**합격/불합격 기준**

| 항목 | 합격 기준 |
|------|-----------|
| Tab 탐색 | 포커스가 가시적으로 이동, 스냅샷에서 activeElement 변경 |
| Enter 활성화 | 포커스된 요소에서 Enter로 동작 트리거 |
| Escape 닫기 | 뷰어에서 Escape로 뷰어 닫힘 |
| 포커스 트랩 | 뷰어 내부에서 Tab이 뷰어 요소 간 순환 |

불합격 시: Tab으로 포커스 이동 안 함, Enter 미작동, Escape로 뷰어 미닫힘.

---

### 세션 7: 다크/라이트 모드 토글

**목표**: 테마 토글 버튼이 존재하고 클릭 시 다크/라이트 모드가 전환되는지 확인한다.

> 해당 UI 요소가 구현되지 않은 경우 이 세션은 스킵하고 "기능 미구현"으로 기록한다.

**agent-browser 명령어 예시**

```bash
agent-browser open http://localhost:3000
agent-browser wait --text "준비"
agent-browser snapshot -i
# 테마 토글 버튼 클릭 (예: @eN)
agent-browser click @eN
agent-browser snapshot -i
# 다크 모드 클래스/속성 확인 (예: [data-theme="dark"] 또는 .dark)
agent-browser wait --text "다크"  # 또는 다크 모드 관련 텍스트
```

**기대 결과**

- 테마 토글 버튼 존재 및 클릭 가능
- 클릭 시 `html` 또는 `body`에 다크 모드 마커(클래스 또는 data attribute) 추가/제거
- 텍스트 대비 및 배경색이 다크 모드로 시각적 변경
- 재클릭 시 라이트 모드로 복귀

**합격/불합격 기준**

| 항목 | 합격 기준 |
|------|-----------|
| 토글 버튼 존재 | 스냅샷에 테마 토글 요소 존재 |
| 모드 전환 | 다크 모드 마커 클래스/속성 토글 확인 |
| 시각적 변경 | 배경/텍스트 색상 변경 (스냅샷 DOM 스타일) |
| 되돌리기 | 두 번째 클릭 시 라이트 모드 복귀 |

불합격 시: 토글 버튼 없음, 클래스 미변경, 시각적 변경 없음.

---

### 세션 8: 정렬 및 페이지네이션

**목표**: 문서 목록 정렬 및 페이지네이션 동작을 확인한다.

> 페이지네이션이 구현되지 않은 경우 이 세션은 스킵하고 "기능 미구현"으로 기록한다.

**agent-browser 명령어 예시**

```bash
agent-browser open http://localhost:3000
agent-browser wait --text "준비"
agent-browser snapshot -i
# 정렬 버튼 클릭 (예: 이름/날짜/크기 정렬)
agent-browser click @eN
agent-browser wait --text "준비"
agent-browser snapshot -i
# 정렬 순서 확인 (카드 순서 변경)
# 페이지네이션 버튼 클릭 (예: 다음 페이지)
agent-browser click @eM
agent-browser wait --text "준비"
agent-browser snapshot -i
```

**기대 결과**

- 정렬 컨트롤 존재 및 클릭 가능
- 정렬 적용 시 그리드 카드 순서 변경 (이름 가나다順, 날짜 최신순 등)
- 페이지네이션 존재 시 페이지 이동 시 해당 페이지 항목 표시
- 현재 페이지 표시기 업데이트

**합격/불합격 기준**

| 항목 | 합격 기준 |
|------|-----------|
| 정렬 컨트롤 | 정렬 버튼 존재 및 클릭 성공 |
| 순서 변경 | 정렬 전·후 스냅샷 카드 순서 변경 확인 |
| 페이지 이동 | 페이지네이션 클릭 시 해당 페이지 항목 표시 |
| 페이지 표시 | 현재 페이지/전체 페이지 텍스트 업데이트 |

불합격 시: 정렬 버튼 없음, 순서 미변경, 페이지 이동 안 됨.

---

### 세션 9: 즐겨찾기(스타) 토글

**목표**: 문서 카드의 스타(즐겨찾기) 버튼으로 추가/제거가 가능한지 확인한다.

> 스타 기능이 구현되지 않은 경우 이 세션은 스킵하고 "기능 미구현"으로 기록한다.

**agent-browser 명령어 예시**

```bash
agent-browser open http://localhost:3000
agent-browser wait --text "준비"
agent-browser snapshot -i
# 문서 카드의 스타 버튼 클릭 (예: @eN)
agent-browser click @eN
agent-browser snapshot -i
# 스타 추가 상태 확인 (예: aria-checked="true" 또는 스타 채움 아이콘)
agent-browser wait --text "추가"  # 또는 스타 관련 상태 텍스트
# 다시 클릭하여 제거
agent-browser click @eN
agent-browser snapshot -i
```

**기대 결과**

- 스타 버튼이 문서 카드에 존재
- 클릭 시 스타 추가 상태(`aria-checked="true"` 또는 filled 아이콘)
- 상태 표시줄에 "추가" 또는 즐겨찾기 추가 메시지
- 재클릭 시 스타 제거 상태(`aria-checked="false"` 또는 outlined 아이콘)

**합격/불합격 기준**

| 항목 | 합격 기준 |
|------|-----------|
| 스타 버튼 존재 | 카드 내 스타 버튼 요소 존재 |
| 추가 토글 | 첫 클릭 시 스타 추가 상태 |
| 제거 토글 | 두 번째 클릭 시 스타 제거 상태 |
| 피드백 | 상태 표시줄 또는 토스트 메시지 표시 |

불합격 시: 스타 버튼 없음, 토글 미작동, 상태 미표시.

---

### 세션 10: CSV/JSON 내보내기

**목표**: 문서 목록 또는 검색 결과를 CSV/JSON 형식으로 내보내는 기능을 확인한다.

> 내보내기 기능이 구현되지 않은 경우 이 세션은 스킵하고 "기능 미구현"으로 기록한다.

**agent-browser 명령어 예시**

```bash
agent-browser open http://localhost:3000
agent-browser wait --text "준비"
agent-browser snapshot -i
# 내보내기 버튼 클릭 (예: @eN)
agent-browser click @eN
# 내보내기 형식 선택 (CSV/JSON) 후 다운로드
agent-browser click @eM  # CSV 내보내기 또는 JSON 내보내기
agent-browser wait --text "다운로드"  # 또는 내보내기 완료 텍스트
agent-browser snapshot -i
```

**기대 결과**

- 내보내기 버튼 존재 및 클릭 가능
- CSV 또는 JSON 형식 선택 가능
- 다운로드 시작 또는 내보내기 완료 메시지 표시
- 다운로드된 파일의 내용이 현재 표시 중인 문서 목록과 일치

**합격/불합격 기준**

| 항목 | 합격 기준 |
|------|-----------|
| 내보내기 버튼 | 내보내기 버튼 존재 및 클릭 성공 |
| 형식 선택 | CSV/JSON 중 선택 가능 |
| 다운로드 완료 | 다운로드 시작 또는 완료 메시지 표시 |
| 내용 일치 | 내보내기 파일이 화면 문서 목록과 일치 |

불합격 시: 내보내기 버튼 없음, 다운로드 미시작, 내용 불일치.

---

## 4. 전체 테스트 실행 스크립트 예시

PowerShell (Windows):

```powershell
# 1. 서버 시작
cd C:\work\openrouter\web_server
npm start

# 2. 각 세션 실행 (별도 터미널 또는 순차 실행)
agent-browser open http://localhost:3000
agent-browser snapshot -i
agent-browser wait --text "준비"
# ... (위 세션별 명령어 순차 실행)
```

---

## 5. 테스트 환경 준비

| 항목 | 값 |
|------|-----|
| OS | Windows |
| Node.js | `node -v` 확인 |
| 서버 실행 | `cd web_server && npm start` |
| 서버 URL | `http://localhost:3000` |
| 테스트 도구 | agent-browser CLI |
| 브라우저 | agent-browser 기본 내장 브라우저 |

**실행 전 확인 사항**

1. `C:\work\openrouter\web_server` 디렉터리에 `package.json` 및 `node_modules` 존재
2. `npm start`로 서버가 `http://localhost:3000`에 기동되는지 확인
3. `agent-browser` CLI가 설치되고 PATH에 등록되어 있는지 확인
4. 테스트 대상 문서(`open_router/doc`, `study/01_skill_claude`)가 존재하여 목록이 비어 있지 않은지 확인

---

## 6. 테스트 결과 기록 양식

| 세션 | 테스트명 | 결과 | 불합격 사유 | 비고 |
|------|----------|------|-------------|------|
| 1 | 페이지 오픈, 제목/스킵 링크 | □ Pass □ Fail | | |
| 2 | 폴더 탐색, 빵부럼 업데이트 | □ Pass □ Fail | | |
| 3 | 문서 열기, 뷰어 콘텐츠 | □ Pass □ Fail | | |
| 4 | 뷰어 닫기, 포커스 복원 | □ Pass □ Fail | | |
| 5 | 문서 검색, 결과 확인 | □ Pass □ Fail | | |
| 6 | 키보드 탐색 (Tab/Enter/Escape) | □ Pass □ Fail | | |
| 7 | 다크/라이트 모드 토글 | □ Pass □ Fail □ Skip | | 기능 미구현 시 Skip |
| 8 | 정렬 및 페이지네이션 | □ Pass □ Fail □ Skip | | 기능 미구현 시 Skip |
| 9 | 즐겨찾기(스타) 토글 | □ Pass □ Fail □ Skip | | 기능 미구현 시 Skip |
| 10 | CSV/JSON 내보내기 | □ Pass □ Fail □ Skip | | 기능 미구현 시 Skip |

---

**작성자**: Agent 20 - Integration Tester
**작성일**: 2026-11-22
**프로젝트**: OpenRouter Study Document Viewer web_server
