# 카드혜택 계산기 (가칭)

보유한 카드와 소비 패턴을 입력하면 전월실적 조건과 한도까지 반영해 카드별 실제 혜택 금액을 계산해주는 웹 서비스입니다. 로그인 없이 바로 사용할 수 있습니다.

배포: https://card-benefit-calculator.vercel.app

기획 배경과 전체 요구사항은 [PRD.md](./PRD.md), 단계별 개발 진행 기록은 [DEV_PROMPTS.md](./DEV_PROMPTS.md)를 참고하세요.

## 실행 방법

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

### 기타 명령어

```bash
npm run build   # 프로덕션 빌드
npm run start   # 빌드 결과 실행
npm run lint    # ESLint
npm run test    # vitest 단위 테스트 (계산 엔진, 스토어 안전장치 등)
```

## 환경변수

현재 별도의 환경변수가 필요하지 않습니다. 모든 카드/구독 데이터는 `data/*.seed.json` 정적 파일에서 불러옵니다.

## 데이터 갱신

`data/cards.seed.json`은 대부분 계산 엔진 검증용 가상 데이터이지만, 신한카드·KB국민카드·하나카드·현대카드는 실제 카드사 공식 페이지를 크롤링해 반영한 실제 카드입니다 (자세한 내용/근사치 처리는 [data/README.md](./data/README.md)).

공식 API/공공데이터를 조사한 결과 카드 혜택 상세를 다루는 데이터는 없어, 카드사 공식 페이지 크롤링이 필요합니다 (조사 결과는 [data/README.md의 "Step 2 진행 상황"](./data/README.md) 참고).

```bash
npx playwright install chromium   # 최초 1회: 헤드리스 브라우저 설치 (JS 렌더링 사이트용)
npm run crawl:cards               # robots.txt 허용된 대상(신한/KB/현대/하나/우리)에서 표 추출
npm run crawl:cards shinhan       # 특정 카드사만 실행
```

현대카드·우리카드는 카드 상세 정보가 자바스크립트로 렌더링돼 일반 fetch로는 못 얻어 Playwright 헤드리스 브라우저를 사용합니다 (`scripts/crawl-cards/browser-fetch.ts`). 현대카드는 이 방식으로 실제 데이터를 얻었고, 우리카드는 robots.txt가 허용하는 카드 페이지 2곳이 파라미터 없이는 애플리케이션 오류를 반환해 아직 데이터를 얻지 못했습니다 (자세한 내용은 [data/README.md](./data/README.md) 참고).

- 대상/허용여부 목록: [scripts/crawl-cards/targets.ts](./scripts/crawl-cards/targets.ts)
- 표 추출 로직: [scripts/crawl-cards/extract.ts](./scripts/crawl-cards/extract.ts) — 연회비 표, 전월실적 구간 표 등을 구조화해 `scripts/crawl-cards/output/<issuerId>.json`에 저장 (참고용 초안, git에는 커밋되지 않음)
- **카테고리별 할인율/적립률의 `data/cards.seed.json` 반영은 자동화하지 않았습니다** — 카드마다 문장 구조가 달라 자동 변환 시 잘못된 숫자를 만들 위험이 커서, 추출된 표를 보고 사람이 직접 반영해야 합니다 (자세한 이유는 [data/README.md](./data/README.md) 참고)

데이터가 갱신되면:

1. `data/cards.seed.json`, `data/subscriptions.seed.json`을 새 데이터로 교체
2. [src/features/cards/types.ts](./src/features/cards/types.ts)의 `Card`/`BenefitRule`/`PerformanceTier` 형태를 그대로 따르는지 확인
3. `npm run test`로 계산 엔진 회귀 테스트 통과 확인

자동 스케줄링/관리자 화면은 v2 로드맵입니다.

## 프로젝트 구조

```
src/
  app/                  라우트 (/ , /cards, /spending, /result)
  components/ui/        공용 UI 컴포넌트 (Button, Card, Badge)
  features/
    cards/              카드 타입, 시드 데이터, 카드 선택/지출 입력 UI
    subscriptions/       구독 서비스 타입, 시드 데이터, 체크리스트 UI
    calculator/          혜택 계산 엔진, 결과 화면
  lib/                   Zustand 스토어(로컬스토리지 영속화), sanitize 로직
data/                    카드/구독 시드 데이터 (JSON)
```

## 배포

GitHub 저장소([songchaewon07/card-benefit-calculator](https://github.com/songchaewon07/card-benefit-calculator))와 Vercel을 연동해 배포되어 있습니다: https://card-benefit-calculator.vercel.app

master 브랜치에 푸시하면 Vercel이 자동으로 재배포합니다 (별도 서버 설정이나 환경변수 불필요).

새로 배포하려면:

1. GitHub 등 원격 저장소에 푸시
2. [Vercel](https://vercel.com)에서 저장소를 Import
3. Framework Preset은 자동으로 Next.js로 인식됨, 빌드 커맨드는 `next build` 기본값 그대로 사용
