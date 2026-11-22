# 프로젝트 보안 및 오류 처리 가이드 (루트)

본 문서는 `C:\work\openrouter` 루트 및 연계 애플리케이션(`open_router/`, `web_server/`) 전반의 보안 및 오류 처리 정책을 정의한다.

## 1. API 키 관리

- 루트의 `.env` 파일에 `git_token`, `git_email`, `21st-mcp_api_key` 민감 정보가 포함되어 있다.
- `.env` 파일을 반드시 `.gitignore`에 등록하여 git 저장소에 커밋하지 않는다.
- `.mcp.json`에 포함된 21st API 키 역시 `.gitignore`에 등록하여 추적 대상에서 제외한다.
- 이미 커밋된 키는 즉시 폐기(로테이션)하고 신규 키를 발급한다.
- 실제 키 값은 배포 환경의 환경 변수 또는 시크릿 매니저를 통해 주입하고, `.env.example` 템플릿만 관리한다.

## 2. Content Security Policy (CSP) 헤더

- 웹 서버(`web_server/`)가 반환하는 모든 HTML 응답에 `Content-Security-Policy` 헤더를 추가한다.
- 권장 정책 예시:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self';
```

- 인라인 스크립트 실행은 최소화하며, nonce 또는 hash 기반 허용 목록을 사용한다.

## 3. 마크다운 사니타이징 (XSS 방지)

- `marked`로 변환된 마크다운 HTML을 브라우저에 삽입하기 전에 DOMPurify 등 사니타이저로 정화한다.
- `viewerContent` 등 렌더링 대상에 `innerHTML` 대신 사니타이즈된 HTML 또는 `textContent`를 사용한다.
- 사용자 제공 마크다운 내 `<script>`, `javascript:`, `on*` 이벤트 속성을 제거한다.

## 4. React 에러 바운더리

- 프론트엔드가 React로 구성될 경우, 최상단에 에러 바운더리를 배치해 컴포넌트 트리 오류를 잡고 폴백 UI를 보여준다.
- `componentDidCatch` / `getDerivedStateFromError`를 구현해 오류를 로깅하고 사용자 복구 옵션을 제공한다.
- 민감 정보를 누출하지 않는 범위에서만 오류 정보를 출력한다.

## 5. Express 오류 처리 미들웨어

- 모든 라우트 등록 후 마지막에 4개 인자 `(err, req, res, next)`를 받는 오류 처리 미들웨어를 등록한다.
- 미처捕捉되지 않은 예외, 404 경로, 검증 실패에 대해 일관된 JSON 오류 응답을 반환한다.
- 프로덕션 환경에서는 스택 트레이스 등 내부 구현詳細을 클라이언트에 노출하지 않는다.
- 비동기 라우트 핸들러 오류는 `next(err)`로 전달하여 중앙집중 처리한다.

## 6. 입력 검증

- 모든 쿼리 파라미터(`root`, `dir`, `file`, `q`) 및 요청 본문을 검증한다.
- 경로 traversal(`..`, 심볼릭 링크, 절대 경로 조작)을 차단하고 허용된 루트 디렉토리 하위 경로만 접근 가능하다.
- 파일 확장자(`.md`, `.markdown`) 및 파일 크기 상한을 제한한다.
- 검증 실패 시 HTTP 400 Bad Request 또는 403 Forbidden을 반환하고 상세 시스템 경로를 노출하지 않는다.

## 7. 의존성 취약점 스캐닝

- 정기적으로 `npm audit`를 실행하여 취약한 의존성을 점검한다.
- `marked`, `express` 등 주요 라이브러리는 최신 안정 버전으로 유지한다.
- CI 파이프라인에 취약점 스캔 단계를 추가하고, 임계 취약점 발견 시 빌드를 중단한다.
- 사용하지 않는 의존성은 제거하여 공격 표면을 줄인다.
