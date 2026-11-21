# Vercel 배포 가이드 및 조사 자료

본 문서는 현재 프로젝트(`web_server` 및 정적 문서 사이트)를 Vercel에 배포하기 위한 조사 내용과 설정 가이드를 정리한 문서입니다.

## 1. Vercel 개요
- **Vercel**은 프론트엔드 및 서버리스 백엔드(Serverless Functions) 배포에 최적화된 클라우드 플랫폼입니다.
- GitHub, GitLab, Bitbucket 등 Git 저장소와 연동하여 푸시(`push`) 또는 PR(Pull Request) 발생 시 자동으로 빌드 및 배포(CI/CD)를 수행할 수 있습니다.
- 정적 파일(HTML, CSS, JS, Markdown 등) 호스팅은 물론, Node.js 기반의 Express 서버를 Serverless Function으로 변환하여 배포할 수 있습니다.

## 2. 배포 방식 비교

### A. Git 연동 배포 (권장)
1. [Vercel 대시보드](https://vercel.com/new)에 접속하여 Git 계정(GitHub 등)을 연동합니다.
2. 배포할 저장소(`open_router`)를 Import 합니다.
3. **Framework Preset** 및 **Root Directory**를 설정합니다.
   - 현재 프로젝트의 `web_server` 폴더를 배포 대상으로 지정할 경우, Root Directory를 `web_server`로 설정합니다.
4. **Build Command** 및 **Output Directory**를 설정합니다.
   - 정적 문서 사이트(`index.md` 렌더링 등)로 배포할 경우 별도의 빌드 과정 없이 루트 경로를 지정하거나, `public` 폴더를 출력 디렉터리로 지정합니다.
5. 배포 버튼(`Deploy`)을 클릭하면 자동으로 빌드 및 배포가 진행됩니다.

### B. Vercel CLI를 통한 배포
터미널에서 직접 배포하는 방식으로, 빠른 테스트나 CI/CD 파이프라인 구축 시 유용합니다.

```bash
# 1. Vercel CLI 설치
npm install -g vercel

# 2. Vercel 로그인
vercel login

# 3. 프로젝트 루트에서 배포 실행
vercel

# 4. 프로덕션 환경에 배포
vercel --prod
```

## 3. 현재 프로젝트(`web_server`) 배포 전략

현재 `web_server`는 Express.js(`src/server.js`)와 정적 파일(`public/`)로 구성되어 있습니다. Vercel은 Express 앱을 Vercel Functions로 실행할 수 있도록 지원합니다.

### 설정 방법 (`vercel.json`)
프로젝트 루트(`web_server` 또는 최상위)에 `vercel.json` 파일을 생성하여 빌드 및 라우팅 규칙을 정의합니다.

```json
{
  "version": 2,
  "builds": [
    {
      "src": "web_server/src/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "web_server/public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "web_server/src/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "web_server/public/$1"
    }
  ]
}
```

## 4. Vercel 배포 시 유의사항 및 최적화 팁

1. **Serverless Function 타임아웃**: Vercel의 무료(Hobby) 플랜은 함수 실행 시간이 제한적(예: 10초~60초)일 수 있으므로, 장시간 실행되는 작업은 백그라운드 작업(Queue/Cron)으로 분리해야 합니다.
2. **환경 변수 관리**: API 키 등 민감한 정보는 코드에 직접 작성하지 않고 Vercel 대시보드의 `Settings > Environment Variables`에 등록하여 사용합니다.
3. **Markdown 렌더링**: 현재 `web_server`에서 Markdown 파일을 읽어 HTML로 변환하는 로직이 포함되어 있다면, 파일 시스템 접근(`fs.readFile`) 대신 빌드 타임에 정적 HTML로 생성(SSG)하거나 Vercel의 Blob Storage/External API를 사용하는 것을 고려할 수 있습니다.
4. **비용 및 확장성**: 트래픽이 증가할 경우 Pro 플랜으로 업그레이드하거나, 데이터베이스(Vercel Postgres, Upstash Redis 등)를 연동하여 확장성을 확보할 수 있습니다.

## 5. 참고 링크
- [Vercel 공식 문서](https://vercel.com/docs)
- [Vercel CLI 가이드](https://vercel.com/docs/cli)
- [Node.js Express on Vercel 가이드](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)