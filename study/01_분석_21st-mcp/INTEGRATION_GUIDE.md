# Glass Folder Cards — 통합 가이드

21st.dev MCP에서 가져온 Glass Folder Cards 컴포넌트를 shadcn/ui + Tailwind CSS + TypeScript 프로젝트에 통합하는 가이드입니다.

---

## 프로젝트 구조

```
study/01_분석_21st-mcp/
├── app/
│   ├── globals.css        # Tailwind CSS + CSS 변수
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 메인 페이지 (데모)
├── components/
│   └── ui/
│       └── glass-folder-cards.tsx  # 메인 컴포넌트
├── public/
│   └── images/            # Unsplash 이미지 자산
├── next.config.js         # Next.js 설정
├── tailwind.config.ts     # Tailwind CSS 설정
├── postcss.config.js      # PostCSS 설정
├── tsconfig.json          # TypeScript 설정
├── package.json           # 의존성
└── .mcp.json              # 21st.dev MCP 설정
```

---

## 1. 프로젝트 전제 조건

이 컴포넌트는 다음과 같은 스택을 전제로 합니다:

| 항목 | 버전 | 상태 |
|------|------|------|
| Next.js | 14.2.x | ✅ 설치됨 |
| React | 18.2.x | ✅ 설치됨 |
| TypeScript | 5.x | ✅ 설치됨 |
| Tailwind CSS | 3.4.x | ✅ 설치됨 |
| lucide-react | 0.300.x | ✅ 설치됨 |

### 기존 프로젝트가 없는 경우 (신규 설치)

```powershell
# Next.js + TypeScript + Tailwind CSS 초기화
npx create-next-app@latest my-app --typescript --tailwind --eslint
cd my-app

# shadcn/ui 초기화
npx shadcn@latest init

# 의존성 설치
npm install lucide-react clsx tailwind-merge
```

---

## 2. 컴포넌트 경로 결정

### 기본 경로: `/components/ui`

shadcn/ui의 기본 컴포넌트 경로는 **`/components/ui`**입니다. 이 경로를 사용해야 하는 이유:

| 이유 | 설명 |
|------|------|
| **관례 준수** | shadcn/ui 생태계의 표준 경로로, 다른 개발자가 예상하는 위치 |
| **import 편의성** | `@/components/ui/glass-folder-cards`로 일관된 import 경로 |
| **구성 요소 분리** | UI 컴포넌트와 비즈니스 로직 컴포넌트를 명확히 구분 |
| **재사용성** | 다른 프로젝트로 쉽게 복사·이동 가능 |

만약 다른 경로(`/components/folders` 등)를 사용하려면:
1. import 경로를 모두 변경해야 함
2. 팀원들과 경로 규칙을 문서화해야 함
3. shadcn/ui CLI와 호환성 문제가 발생할 수 있음

**권장:** 기본 경로 `/components/ui` 사용

---

## 3. 컴포넌트 복사

### 2.1 glass-folder-cards.tsx

`components/ui/glass-folder-cards.tsx` 파일을 생성하고 다음 코드를 복사합니다:

이 컴포넌트는 다음 기능을 포함합니다:
- `GlassFolder` — 메인 폴더 컴포넌트 (휴리스틱 글라스 효과, 애니메이션, 상호작용)
- `ART_PRESETS` — 5가지 기본 아트 프리셋 (aurora, ember, dusk, glacier, verdant)
- `GlassFolderProps` — 모든 Props 타입 정의
- `ArtCanvas` — 캔버스 기반 생성 아트 렌더러

### 2.2 demo.tsx (데모 페이지)

`app/page.tsx`에 GlassFolder를 3개 인스턴스로 배치한 데모 페이지를 구성합니다:

```tsx
import GlassFolder from "@/components/ui/glass-folder-cards"

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 py-16">
      <GlassFolder label="My Files" art="aurora" seed={3} appearDelay={0} />
      <GlassFolder
        label="Archives"
        art="none"
        action="more"
        labelPlacement="top-left"
        appearDelay={140}
        files={[
          { name: "Lookbook 2024", meta: "38 images", art: "dusk" },
          { name: "Invoices", meta: "12 PDFs" },
          { name: "Shoot — Lisbon", meta: "RAW · 2.1 GB", art: "ember" },
          { name: "Contract.pdf", meta: "PDF · 320 KB" },
        ]}
        menu={[{ label: "Rename" }, { label: "Share…" }, { label: "Move to Trash", danger: true }]}
      />
      <GlassFolder
        label="My Files"
        meta="Wed 19 Aug"
        tone="dark"
        art="ember"
        seed={11}
        action="none"
        labelPlacement="top-right"
        appearDelay={280}
        files={[
          { name: "Stills", meta: "64 images", art: "verdant" },
          { name: "Edit notes", meta: "TXT · 4 KB" },
          { name: "Grade v3", meta: "DRX · 18 MB", art: "aurora" },
        ]}
      />
    </main>
  )
}
```

---

## 4. 외부 의존성 설치

| 패키지 | 용도 | 설치 명령 |
|--------|------|-----------|
| lucide-react | 아이콘 (선택사항) | `npm install lucide-react` |
| clsx | 조건부 클래스 병합 | `npm install clsx` |
| tailwind-merge | Tailwind 클래스 병합 | `npm install tailwind-merge` |

현재 프로젝트에는 이미 설치되어 있습니다:

```powershell
npm install lucide-react clsx tailwind-merge
```

---

## 5. 이미지 자산 (Unsplash)

컴포넌트는 생성된 아트를 기본으로 사용하지만, 사용자 이미지를 연결할 수 있습니다:

```tsx
<GlassFolder
  label="Photos"
  image="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=80"
  art="none"
/>
```

추천 Unsplash 이미지 URL:

| 용도 | URL |
|------|-----|
| 자연/풍경 | https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80 |
| 건축물 | https://images.unsplash.com/photo-1486325212027-8081e485225e?w=400&q=80 |
| 추상적 | https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80 |

---

## 6. Props 레퍼런스

| Props | 타입 | 기본값 | 설명 |
|-------|------|--------|------|
| label | string | "My Files" | 폴더 라벨 |
| meta | string | 파일 개수 | 두 번째 줄 텍스트 |
| tone | "light" \| "dark" | "light" | 글라스 톤 |
| art | FolderArt | "aurora" | 배경 아트 (preset/recipe/none) |
| seed | number | 3 | 아트 시드 |
| image | string | undefined | 사용자 이미지 URL |
| files | FolderFile[] | 샘플 파일 3개 | 폴더 내부 파일 목록 |
| action | "add" \| "more" \| "none" | "add" | 우측 키 버튼 동작 |
| onAdd | (files) => FolderFile \| void | undefined | 새 파일 추가 콜백 |
| onFilesChange | (files) => void | undefined | 파일 목록 변경 콜백 |
| menu | FolderMenuItem[] | [] | "more" 액션 메뉴 아이템 |
| labelPlacement | "bottom-left" \| "top-left" \| "top-right" | "bottom-left" | 라벨 위치 |
| open | boolean | undefined | 제어 컴포넌트: 열린 상태 |
| defaultOpen | boolean | false | 비제어 컴포넌트: 기본 열린 상태 |
| onOpenChange | (open) => void | undefined | 열림/닫힘 콜백 |
| onFileSelect | (file, index) => void | undefined | 파일 선택 콜백 |
| width | number | 340 | 폴더 너비 (px) |
| appear | boolean | true | 입장 애니메이션 |
| appearDelay | number | 0 | 입장 애니메이션 지연 (ms) |

---

## 7. 실행 방법

```powershell
# 개발 서버 시작
npm run dev

# 브라우저에서 http://localhost:3000 접속
```

```powershell
# 프로덕션 빌드
npm run build

# 프로덕션 서버 시작
npm start
```

---

## 8. 21st.dev MCP 연동

이 컴포넌트는 21st.dev MCP에서 검색한 React 컴포넌트 패턴을 기반으로 합니다.

MCP 도구로 추가 컴포넌트 검색:

```powershell
# 21st.dev CLI로 컴포넌트 검색
21st search "glass folder" --limit 10 --api-key $API_KEY_21ST

# 컴포넌트 코드 가져오기
21st get <component-id> --api-key $API_KEY_21ST
```

---

## 9. 팀 에이전트별 체크리스트

| 팀 | 확인 항목 |
|----|----------|
| 제품팀 | 글라스 폴더 UX가 사용자 파일 관리 흐름에 적합한가? |
| 개발팀 | TypeScript 타입 안전성, Props 인터페이스 검증 완료 |
| 디자인팀 | Tailwind CSS 클래스, 글라스모피즘 시각적 품질 확인 |
| QA팀 | 호버/클릭/오픈 상태별 애니메이션 동작 테스트 |
| 운영팀 | Next.js 빌드 성공, 정적 페이지 생성 확인 |
| 보안팀 | `.env`, `.mcp.json` 등 API 키 파일 `.gitignore` 등록 확인 |

---

## 10. 참고 링크

- 21st.dev 공식 사이트: https://21st.dev/
- 21st.dev MCP 소개: https://21st.dev/mcp
- shadcn/ui 문서: https://ui.shadcn.com/
- Tailwind CSS 문서: https://tailwindcss.com/
- Next.js 문서: https://nextjs.org/docs
