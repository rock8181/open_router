# OpenRouter 문서 뷰어 기여 가이드

OpenRouter 학습 문서 뷰어 프로젝트에 기여해 주셔서 감사합니다. 버그 수정, 기능 추가, 문서 개선 등 모든 기여를 환영합니다.

---

## 1. 기여하기 전

- 기존 이슈(Issue)를 검색해 중복되지 않도록 확인합니다.
- 새로운 기능이나 중요한 변경 사항은 이슈로 먼저 논의해 주세요.
- 이 프로젝트는 한국어로 작성되어 있으며, 모든 문서와 커밋 메시지는 한국어를 기본으로 합니다.

---

## 2. 개발 환경 설정

### 사전 준비

- Node.js 18 이상
- npm (또는 yarn)

### 설치

```bash
# 저장소 클론
git clone <저장소 URL>
cd C:\work\openrouter\web_server

# 의존성 설치
npm install

# 서버 실행 (개발)
npm run dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

---

## 3. 프로젝트 구조

```
web_server/
├── public/
│   ├── index.html       # 메인 HTML
│   ├── app.v2.js        # 프론트엔드 애플리케이션 로직 (현재 사용 중)
│   ├── app.js           # 구버전 프론트엔드 (호환용)
│   └── style.css        # 스타일시트
├── src/
│   └── server.js        # Express 백엔드 서버
├── package.json
├── README.md
├── API_DOCS.md
├── USER_GUIDE.md
├── DESIGN_SYSTEM.md
├── DEPLOYMENT.md
├── CONTRIBUTING.md
└── 01_architecture.md ...
```

---

## 4. 코딩 컨벤션

### JavaScript

- 들여쓰기: 공백 2칸
- 세미콜론 사용
- 변수명은 camelCase, 상수는 대문자 스네이크 케이스
- JSDoc 주석은 선택사항이나 복잡한 함수에는 작성 권장
- `var` 대신 `const`, `let` 사용

### CSS

- BEM-like 네이밍 권장
- 디자인 시스템(`DESIGN_SYSTEM.md`)의 토큰(`--color-*`, `--space-*` 등) 사용
- 원색 헥스 코드 직접 사용 금지
- `transition: all 0.2s`와 같은 광범위한 트랜지션 금지

### HTML

- 시맨틱 태그 사용 (`<main>`, `<aside>`, `<nav>`, `<section>` 등)
- 접근성: `aria-label`, `role`, `aria-hidden` 등 ARIA 속성 적절히 사용
- 모든 폼 입력에 연결된 `<label>` 또는 `aria-label` 필수

### 커밋 메시지

한국어로 작성하며, 다음과 같은 접두사를 사용합니다.

| 접두사 | 의미 |
|--------|------|
| `feat:` | 새 기능 추가 |
| `fix:` | 버그 수정 |
| `docs:` | 문서 추가/수정 |
| `style:` | 코드 포맷팅, 세미콜론 등 (기능 변경 없음) |
| `refactor:` | 코드 리팩토링 |
| `test:` | 테스트 추가/수정 |
| `chore:` | 빌드 설정, 패키지 등 기타 변경 |

예시:
```
feat: 문서 검색 결과에 스니펫 표시 추가
fix: 뷰어 닫기 시 포커스 복원 버그 수정
docs: API_DOCS.md에 검색 엔드포인트 예시 추가
```

---

## 5. 풀 리퀘스트(PR) 프로세스

1. 저장소를 포크합니다.
2. 새 브랜치를 생성합니다 (`git checkout -b feat/기능명`).
3. 변경 사항을 커밋합니다.
4. 브랜치를 푸시합니다 (`git push origin feat/기능명`).
5. 풀 리퀘스트를 생성합니다.
6. maintainer가 리뷰 후 병합합니다.

PR 설명에는 다음을 포함해 주세요.

- 변경 목적과 내용
- 관련된 이슈 번호
- 테스트 방법 (어떻게 확인했는지)
- 스크린샷 (UI 변경 시)

---

## 6. 버그 신고

버그를 발견하면 이슈에 다음 정보를 포함해 제출해 주세요.

- OS 및 브라우저 버전
- 재현 단계
- 예상 동작과 실제 동작
- 스크린샷 또는 콘솔 에러 로그

---

## 7. 문서 기여

프로젝트 문서는 한국어로 작성됩니다. 다음 문서를 업데이트할 수 있습니다.

- `README.md` - 프로젝트 개요
- `USER_GUIDE.md` - 사용자 가이드
- `API_DOCS.md` - API 명세
- `DESIGN_SYSTEM.md` - 디자인 시스템
- `DEPLOYMENT.md` - 배포 가이드

새 문서를 추가할 때는 `index.md`에 목차를 업데이트해 주세요.

---

## 8. 라이선스

이 프로젝트는 내부 학습 및 문서 공개를 목적으로 제작되었습니다. 기여한 코드 역시 동일한 취지로 사용됩니다.

---

## 9. 연락처

프로젝트에 대한 문의는 저장소의 이슈 탭을 이용해 주세요.
