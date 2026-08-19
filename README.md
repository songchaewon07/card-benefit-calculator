# 카드혜택 계산기 (가칭)

보유한 카드와 소비 패턴을 입력하면 전월실적 조건과 한도까지 반영해 카드별 실제 혜택 금액을 계산해주는 웹 서비스입니다. 로그인 없이 바로 사용할 수 있습니다.

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

`data/cards.seed.json`, `data/subscriptions.seed.json`은 **실제 카드사 상품이 아닌 계산 엔진 검증용 가상 데이터**입니다 (자세한 내용은 [data/README.md](./data/README.md)).

실제 카드사 데이터로 교체하는 작업(공식 API/공공데이터 조사, 필요 시 크롤링 보조)은 아직 진행 전이며, [DEV_PROMPTS.md](./DEV_PROMPTS.md)의 Step 2에서 다룹니다. 데이터가 교체되면:

1. `data/cards.seed.json`, `data/subscriptions.seed.json`을 새 데이터로 교체
2. [src/features/cards/types.ts](./src/features/cards/types.ts)의 `Card`/`BenefitRule`/`PerformanceTier` 형태를 그대로 따르는지 확인
3. `npm run test`로 계산 엔진 회귀 테스트 통과 확인

현재는 수동 교체 방식이며, 자동 스케줄링/크롤러/관리자 화면은 v2 로드맵입니다.

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

Vercel 배포를 기준으로 구성되어 있습니다 (별도 서버 설정이나 환경변수 없이 정적 빌드로 배포 가능).

1. GitHub 등 원격 저장소에 푸시
2. [Vercel](https://vercel.com)에서 저장소를 Import
3. Framework Preset은 자동으로 Next.js로 인식됨, 빌드 커맨드는 `next build` 기본값 그대로 사용
