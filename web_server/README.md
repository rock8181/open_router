# OpenRouter 학습 문서 뷰어

OpenRouter 학습 문서를 웹 브라우저에서 탐색하고 읽을 수 있는 가벼운 정적 문서 뷰어입니다. Express 기반의 Node.js 웹 서버와 바닐라 JavaScript 프론트엔드로 구성되어 있으며, 마크다운 문서를 폴더 단위로 탐색하고 키워드 검색, 문서 뷰어, 클립보드 복사 기능을 제공합니다.

```
┌─────────────────────────────────────────────────────────────┐
│                    OpenRouter 학습 문서 뷰어                 │
├──────────┬───────────────────────────────────────────────────┤
│ 사이드바 │                                                   │
│          │  📄 문서 목록 (그리드)                             │
│ • open_router/doc │  ┌─────┐ ┌─────┐ ┌─────┐                │
│ • study/01_skill_claude │  │ 폴더│  │ .md │  │ .md │        │
│                          │ └─────┘ └─────┘ └─────┘        │
│ 🔍 검색창 │                                                   │
│ ┌─────────┐                                                   │
│ │ 검색... │  문서 제목 / 내용으로 검색                        │
│ └─────────┘                                                   │
│                                                              │
│ 상태: 준비                                                    │
├──────────┴───────────────────────────────────────────────────┤
│ 도구 모음 | 새로고침 | 추가 | 더보기 | 문서 0개 항목          │
└─────────────────────────────────────────────────────────────┘
```

## 주요 기능

- **문서 트리 탐색**: 사이드바에서 루트(`open_router`, `study`)를 선택하고 폴더와 파일을 계층적으로 탐색합니다.
- **마크다운 뷰어**: `.md` 파일을 클릭하면 오버레이 뷰어에서 원문과 렌더링된 HTML을 표시합니다.
- **키워드 검색**: 문서 제목과 내용 전체에서 키워드로 검색하고, 검색어 주변 스니펫을 확인합니다.
- **키보드 내비게이션**: 방향키, Enter, Escape, Tab 등으로 마우스 없이 모든 기능을 조작할 수 있습니다.
- **클립보드 복사**: 뷰어에서 문서 내용을 한 번에 클립보드로 복사합니다.
- **브라우저 기록 연동**: 뒤로/앞으로 버튼으로 탐색 이력을 오갈 수 있습니다.
- **접근성**: 스킵 링크, ARIA 라벨, 포커스 관리, 키보드 트랩을 지원합니다.
- **다크/라이트 모드**: 디자인 시스템에 따라 명도 대비를 맞춘 두 가지 모드를 지원합니다.

## 빠른 시작

### 사전 준비

- Node.js 18 이상이 설치되어 있어야 합니다.

### 설치 및 실행

```bash
# 프로젝트 디렉토리로 이동
cd C:\work\openrouter\web_server

# 의존성 설치
npm install

# 서버 시작
npm start
```

서버가 시작되면 콘솔에 다음과 같이 출력됩니다.

```
Web server running at http://localhost:3000
```

브라우저에서 `http://localhost:3000`에 접속합니다.

### 사용 가능한 npm 스크립트

| 스크립트 | 설명 |
|----------|------|
| `npm start` | 프로덕션용 서버 실행 (`node src/server.js`) |
| `npm run dev` | 개발용 서버 실행 (동일) |
| `npm run changelog` | 변경 이력 조회 |

## 키보드 단축키

| 단축키 | 동작 |
|--------|------|
| `Tab` | 상호작용 요소 간 이동 |
| `Enter` / `Space` | 포커스된 카드 또는 버튼 활성화 |
| `Escape` | 문서 뷰어 오버레이 닫기 |
| `Enter` (카드 포커스 시) | 폴더 열기 또는 문서 뷰어 열기 |

## 브라우저 호환성

| 브라우저 | 지원 버전 | 비고 |
|----------|-----------|------|
| Chrome | 90 이상 | 권장 |
| Edge | 90 이상 | Chromium 기반 |
| Firefox | 88 이상 | |
| Safari | 14 이상 | macOS/iOS |

모던 브라우저에서 최적으로 작동하며, `navigator.clipboard` API를 사용하므로 HTTPS 또는 localhost 환경에서 클립보드 복사가 가능합니다.

## 프로젝트 구조

```
web_server/
├── public/
│   ├── index.html       # 메인 HTML
│   ├── app.v2.js        # 프론트엔드 애플리케이션 로직
│   ├── app.js           # 구버전 프론트엔드 (호환용)
│   └── style.css        # 스타일시트
├── src/
│   └── server.js        # Express 백엔드 서버
├── package.json
├── README.md            # 본 문서
├── API_DOCS.md          # API 엔드포인트 상세 명세
├── USER_GUIDE.md        # 사용자 가이드
├── DESIGN_SYSTEM.md     # 디자인 시스템 및 컴포넌트 스펙
├── DEPLOYMENT.md        # 배포 가이드
├── CONTRIBUTING.md      # 기여 가이드
└── 01_architecture.md
    02_frontend-ui.md
    03_backend-api.md
    04_search-indexing.md
    ACCESSIBILITY_AUDIT.md
    MOBILE_RESPONSIVE.md
    PERFORMANCE.md
    SECURITY.md
    TESTING.md
```

## 라이선스

이 프로젝트는 내부 학습 및 문서 공개를 목적으로 제작되었습니다.

---

관련 문서:
- [API_DOCS.md](./API_DOCS.md) - API 엔드포인트 명세
- [USER_GUIDE.md](./USER_GUIDE.md) - 사용자 가이드
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - 디자인 시스템
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 배포 가이드
- [CONTRIBUTING.md](./CONTRIBUTING.md) - 기여 가이드
