# 웹 서버 보안 및 오류 처리 가이드

본 문서는 `web_server/` (Express 백엔드 + 프론트엔드 뷰어) 애플리케이션의 보안 및 오류 처리 정책을 정의한다.

## 1. API 키 관리

- `.env` 파일에 `git_token`, `git_email`, `21st-mcp_api_key` 등 민감한 API 키를 저장한다.
- `.env` 파일은 반드시 `.gitignore`에 등록하여 git 저장소에 커밋하지 않는다.
- `.mcp.json`에 포함된 21st API 키 역시 `.gitignore`에 등록하여 추적 대상에서 제외한다.
- 실제 키 값은 배포 환경의 환경 변수 또는 시크릿 매니저를 통해 주입한다.
- 로컬 개발 시 `.env.example` 템플릿만 저장소에 관리하고 실제 값은 포함하지 않는다.

## 2. Content Security Policy (CSP) 헤더

- Express 응답에 `Content-Security-Policy` 헤더를 추가하여 XSS 및 데이터 주입 공격을 방지한다.
- 권장 정책 예시:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self';
```

- 인라인 스크립트 실행은 최소화하며, 필요한 경우 nonce 또는 hash 기반 허용 목록을 사용한다.
- 프론트엔드 HTML 응답(CSP 적용 대상)에도 동일 헤더를 적용한다.

## 3. 마크다운 사니타이징 (XSS 방지)

- `marked` 라이브러리로 마크다운을 HTML 변환 시 기본적으로 XSS 위험이 존재한다.
- 변환 결과를 브라우저에 삽입하기 전에 DOMPurify 등 사니타이저로 HTML을 정화한다.
- `viewerContent`에 `innerHTML` 대신 `textContent` 또는 사니타이즈된 HTML만 주입한다.
- 사용자 제공 마크다운 내 `<script>`, `javascript:`, `on*` 이벤트 속성 제거를 보장한다.

## 4. React 에러 바운더리

- 프론트엔드가 React로 구성될 경우, 컴포넌트 트리에서 발생한 JavaScript 오류를 잡고 폴백 UI를 보여주는 에러 바운더리를 최상단에 배치한다.
- `componentDidCatch` / `getDerivedStateFromError`를 구현하여 오류를 로깅하고 사용자에게 복구 옵션을 제공한다.
- 에러 바운더리는 전역 오류 핸들러와 함께 작동하며, 민감 정보를 누출하지 않는다.

## 5. Express 오류 처리 미들웨어

- 모든 라우트 등록 후 마지막에 4개 인자 `(err, req, res, next)`를 받는 오류 처리 미들웨어를 등록한다.
- 미처捕捉되지 않은 예외, 404 경로, 검증 실패에 대해 일관된 JSON 오류 응답을 반환한다.
- 스택 트레이스 등 내부 구현詳細は 프로덕션 환경에서 클라이언트에 노출하지 않는다.
- 비동기 라우트 핸들러 오류는 `express-async-errors` 또는 `try/catch`로 `next(err)`에 전달한다.

## 6. 입력 검증

- 모든 쿼리 파라미터(`root`, `dir`, `file`, `q`) 및 요청 본문을 검증한다.
- 경로 traversal(`..`, 심볼릭 링크, 절대 경로 조작) 시도를 차단하고 허용된 루트 디렉토리 하위 경로만 접근 가능하다.
- 파일 확장자(`.md`, `.markdown`) 및 파일 크기 상한을 제한한다.
- 검증 실패 시 HTTP 400 Bad Request 또는 403 Forbidden을 반환하고 상세 시스템 경로를 노출하지 않는다.

## 7. 의존성 취약점 스캐닝

- 정기적으로 `npm audit`를 실행하여 취약한 의존성을 점검한다.
- `marked`, `express` 등 주요 라이브러리는 최신 안정 버전으로 유지한다.
- CI 파이프라인에 취약점 스캔 단계를 추가하고, 임계 취약점 발견 시 빌드를 중단한다.
- 사용하지 않는 의존성은 제거하여 공격 표면을 줄인다.
