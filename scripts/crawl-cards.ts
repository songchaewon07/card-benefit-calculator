/**
 * 카드사 공식 페이지 크롤링 골격 (dry-run 전용).
 *
 * 지금 단계에서는 실제 카드/혜택 데이터를 대량으로 수집하지 않는다. 각
 * 카드사별로 robots.txt를 실행 시점에 재확인하고, "allowed"로 분류된
 * 대상에 한해 샘플 페이지 1건만 요청해 접근 가능 여부를 검증한다.
 * (data/README.md 참고: 실제 카드 데이터는 이 파이프라인이 완성된 뒤에만
 * 실제 데이터로 교체해야 한다.)
 *
 * 실행: npm run crawl:cards [issuerId]
 * 예: npm run crawl:cards shinhan
 */
import { CRAWL_TARGETS } from "./crawl-cards/targets";
import { checkRobotsAllowed, CRAWLER_USER_AGENT } from "./crawl-cards/robots";
import { createRateLimiter } from "./crawl-cards/rate-limiter";
import { parseCardPage } from "./crawl-cards/parse";

// 호스트당 최소 요청 간격. dry-run은 대상당 요청이 1건뿐이라 큰 의미는 없지만,
// 이후 페이지네이션 등으로 확장할 때도 기본값이 안전하도록 넉넉하게 둔다.
const MIN_REQUEST_INTERVAL_MS = 3000;

async function main() {
  const onlyIssuerId = process.argv[2];

  const candidates = CRAWL_TARGETS.filter(
    (target) => target.status === "allowed"
  ).filter((target) => !onlyIssuerId || target.issuerId === onlyIssuerId);

  const skipped = CRAWL_TARGETS.filter((target) => target.status !== "allowed");
  if (skipped.length > 0) {
    console.log("건너뛴 대상 (targets.ts에서 allowed가 아님):");
    for (const target of skipped) {
      console.log(`  - ${target.issuerName} (${target.status}): ${target.note}`);
    }
    console.log("");
  }

  if (candidates.length === 0) {
    console.log("실행 가능한(allowed) 대상이 없습니다.");
    return;
  }

  console.log(`대상 ${candidates.length}곳에 대해 접근 가능 여부 검증(dry-run)을 시작합니다.`);
  console.log(`User-Agent: ${CRAWLER_USER_AGENT}`);

  for (const target of candidates) {
    const wait = createRateLimiter(MIN_REQUEST_INTERVAL_MS);
    console.log(`\n[${target.issuerName}]`);

    console.log("  robots.txt 재확인 중...");
    const robotsCheck = await checkRobotsAllowed(
      target.robotsTxtUrl,
      target.sampleUrl
    );
    console.log(`  → ${robotsCheck.reason}`);

    if (robotsCheck.allowed !== true) {
      console.log("  ⚠ 허용이 확인되지 않아 이번 실행에서는 건너뜁니다.");
      continue;
    }

    await wait();
    console.log(`  요청: GET ${target.sampleUrl}`);

    let res: Response;
    try {
      res = await fetch(target.sampleUrl, {
        headers: { "User-Agent": CRAWLER_USER_AGENT },
      });
    } catch (error) {
      console.log(`  ⚠ 요청 실패: ${(error as Error).message}`);
      continue;
    }

    console.log(`  응답: HTTP ${res.status}`);
    if (!res.ok) {
      console.log("  ⚠ 정상 응답이 아니어서 건너뜁니다.");
      continue;
    }

    const html = await res.text();
    const cards = parseCardPage(target.issuerId, html);
    console.log(
      `  파싱 결과: 카드 ${cards.length}건 (파서 미구현 상태이므로 현재는 항상 0건)`
    );
  }

  console.log(
    "\n이 실행은 접근 가능 여부 검증용 dry-run입니다. 실제 데이터 수집은 " +
      "scripts/crawl-cards/parse.ts에 카드사별 파서를 구현한 뒤 별도로 진행하세요."
  );
}

main().catch((error) => {
  console.error("크롤러 실행 중 오류:", error);
  process.exitCode = 1;
});
