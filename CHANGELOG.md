# Changelog

모든 주목할 만한 변경 사항은 이 파일에 기록됩니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따릅니다.
이 프로젝트는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

### Changed
- 프로젝트 폴더 구조 정리 및 문서 경로 변경
  - `doc/개발가이드/01_기본_사용_가이드.md` -> `doc/01_기본_사용_가이드.md`
  - `open_router/doc/01_apikey.md` -> `open_router/01_apikey.md`
  - `open_router/doc/02_aistudiokey.md` -> `open_router/02_aistudiokey.md`
  - `study/01_skill_claude/` 하위 문서들 -> `study/` 루트로 이동
  - `timelaps/doc/01_할일.md` -> `timelaps/01_할일.md`
  - `web_server/doc/` 하위 문서들 -> `web_server/` 루트로 이동

### Added
- 각 디렉터리별 `index.md` 문서 추가 및 링크 연결
  - `index.md` (최상위 루트 인덱스)
  - `doc/index.md`
  - `open_router/index.md`
  - `study/index.md`
  - `timelaps/index.md`
  - `web_server/index.md`
- OpenRouter 서비스 분석 문서 5개 추가
  - `study/01_분석_claude-mem.md` — Claude-Mem (1위)
  - `study/01_분석_freellmapi.md` — FreeLLAMAPI (2위)
  - `study/01_분석_claude-code-setup.md` — Claude Code Setup (3위)
  - `study/01_분석_elephant-goldfish.md` — Elephant-Goldfish Model (4위)
  - `study/01_분석_21st-mcp.md` — 21st.dev MCP (5위)
- 웹 서버 구축 (`web_server/`)
  - `src/server.js` — Express 백엔드 (문서 목록/뷰어/검색 API)
  - `public/index.html` — 다크 테마 문서 뷰어 UI
  - `public/style.css` — 스타일시트
  - `public/app.js` — 프론트엔드 로직
  - `01_architecture.md` — 시스템 아키텍처 설계
  - `02_frontend-ui.md` — 프론트엔드 UI 설계
  - `03_backend-api.md` — 백엔드 API 설계
  - `04_search-indexing.md` — 검색/인덱싱 설계
- 개발 가이드 문서 추가
  - `doc/01_기본_사용_가이드.md` — Git 사용 가이드
- `.gitignore` 추가 (node_modules, .env 제외)

### Changed
- `open_router/doc/01_apikey.md` — OpenRouter API 키 마스킹 처리
- `open_router/doc/02_aistudiokey.md` — Gemini API 키 마스킹 처리
- `study/01_skill_claude/01_분석_claude-mem.md` — OpenRouter API 키 마스킹 처리

### Security
- 민감 정보(API 키, 토큰) 커밋에서 제외 및 마스킹 처리

## [1.0.0] - 2026-11-21

### Added
- 초기 커밋: OpenRouter 스터디 문서 및 웹 서버
- GitHub 저장소 연결: https://github.com/rock8181/open_router.git

---

## 웹 서버 실행 방법

```powershell
# 의존성 설치
cd web_server
npm install

# 서버 실행
node src/server.js
```

접속: `http://localhost:3000`
