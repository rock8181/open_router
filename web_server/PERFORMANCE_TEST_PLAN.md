# 성능 테스트 계획서

OpenRouter Study Document Viewer 웹 서버의 성능 테스트를 위한 계획서입니다.

## 1. Core Web Vitals 목표

| 지표 | 목표값 | 측정 도구 |
|------|--------|----------|
| LCP (Largest Contentful Paint) | 2.5초 미만 | Lighthouse, WebPageTest |
| FID (First Input Delay) | 100ms 미만 | Chrome DevTools, WebPageTest |
| CLS (Cumulative Layout Shift) | 0.1 미만 | Lighthouse, Chrome DevTools |

## 2. API 성능 목표

| API 엔드포인트 | 목표 응답 시간 | 측정 방법 |
|----------------|---------------|----------|
| 문서 목록 API | 200ms 미만 | Chrome DevTools Network 패널 |
| 문서 조회 API | 300ms 미만 | Chrome DevTools Network 패널 |
| 검색 API | 500ms 미만 | Chrome DevTools Network 패널 |

## 3. 애니메이션 성능 목표

| 애니메이션 | 목표 시간 | 테스트 방법 |
|------------|----------|------------|
| 카드 입장 애니메이션 | 300ms 미만 | Chrome DevTools Performance 패널 |
| 폴더 열기/닫기 | 350ms 미만 | Chrome DevTools Performance 패널 |
| 호버 효과 | 200ms 미만 | Chrome DevTools Performance 패널 |
| 패럴럭스 레이아웃 트래싱 없음 | - | Chrome DevTools Performance 패널 (Layout Shift 확인) |

## 4. 테스트 시나리오

### 4.1 콜드 로드 (첫 방문)
- 브라우저 캐시 삭제 후 최초 페이지 접속
- LCP, FID, CLS 측정
- 문서 목록 API 응답 시간 측정

### 4.2 웜 로드 (캐시됨)
- 브라우저 캐시 적용 상태에서 페이지 재접속
- 페이지 로드 시간 측정
- 정적 리소스 캐시 히트율 확인

### 4.3 대용량 폴더 (50개 이상의 문서)
- 50개 이상 문서가 포함된 폴더 열기
- 폴더 로드 시간 측정
- 스크롤 성능 확인 (프레임 드롭 없음)
- 문서 목록 API 응답 시간 측정

### 4.4 느린 네트워크 (3G 시뮬레이션)
- Chrome DevTools 네트워크 스로틀링: Slow 3G (다운로드 1.6 Mbps, 업로드 768 Kbps, RTT 400ms)
- 페이지 로드 시간 측정
- LCP 측정 (느린 네트워크 환경)

### 4.5 다중 빠른 상호작용
- 연속된 폴더 열기/닫기 작업
- 빠른 검색어 입력 및 검색 실행
- 문서 목록 탐색 중 메모리 누수 확인
- FID 측정 (입력 지연 확인)

## 5. 테스트 도구

| 도구 | 사용 목적 |
|------|----------|
| Lighthouse | Core Web Vitals 측정, 성능 감사 보고서 생성 |
| WebPageTest | 실제 브라우저 환경에서 성능 측정, 물결차트 분석 |
| Chrome DevTools Performance 패널 | 애니메이션 성능, 메인 스레드 블로킹, 레이아웃 트래싱 분석 |
| Chrome DevTools Network 패널 | API 응답 시간, 리소스 로드 시간 측정 |

## 6. 테스트 절차

1. **테스트 환경 준비**
   - Chrome 브라우저 최신 버전 설치
   - Chrome DevTools 열기 (F12)
   - 네트워크 조건 설정 (필요 시)

2. **측정 실행**
   - 각 테스트 시나리오별로 3회 이상 반복 측정
   - 평균값 및 최댓값 기록

3. **결과 분석**
   - 목표값 초과 항목 식별
   - 병목 지점 분석 (Performance 패널)

4. **보고**
   - 측정 결과를 성능 테스트 보고서에 기록
   - 개선 사항 도출 및 우선순위 결정

## 7. 합격/불합격 기준

- 모든 Core Web Vitals 지표가 목표값 이내인 경우 합격
- 모든 API 응답 시간이 목표값 이내인 경우 합격
- 모든 애니메이션이 목표 시간 이내이며 레이아웃 트래싱이 없는 경우 합격
- 하나라도 초과 시 불합격으로 판단하고 성능 최적화 수행