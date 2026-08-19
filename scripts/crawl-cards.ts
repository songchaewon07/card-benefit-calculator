/**
 * 카드사 공식 페이지 크롤링 골격.
 *
 * 각 카드사별로 robots.txt를 실행 시점에 재확인하고, "allowed"로 분류된
 * 대상에 한해 샘플 페이지 1건만 요청한다. 페이지에서 <table>(연회비,
 * 전월실적 구간 등)을 구조적으로 추출해 CardExtractionDraft로 저장한다.
 *
 * 이 결과물은 "초안(draft)"이지 최종 Card 데이터가 아니다. 카테고리별
 * 할인율/적립률은 대개 자유 문장(prose)으로 쓰여 있어 신뢰할 수 있게
 * 자동으로 구조화할 수 없다 — 잘못 추측하면 "데이터 없음"보다 위험한
 * "그럴듯하지만 틀린 혜택 데이터"가 되기 때문에, 그 부분은 사람이 draft의
 * tables를 보고 data/cards.seed.json에 직접 반영해야 한다.
 *
 * 실행: npm run crawl:cards [issuerId]
 * 예: npm run crawl:cards shinhan
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { CRAWL_TARGETS } from "./crawl-cards/targets";
import { checkRobotsAllowed, CRAWLER_USER_AGENT } from "./crawl-cards/robots";
import { createRateLimiter } from "./crawl-cards/rate-limiter";
import { extractCardDraft } from "./crawl-cards/extract";
import { fetchText } from "./crawl-cards/http-fetch";

// 호스트당 최소 요청 간격. dry-run은 대상당 요청이 1건뿐이라 큰 의미는 없지만,
// 이후 페이지네이션 등으로 확장할 때도 기본값이 안전하도록 넉넉하게 둔다.
const MIN_REQUEST_INTERVAL_MS = 3000;
const OUTPUT_DIR = path.join(__dirname, "crawl-cards", "output");

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

  console.log(`대상 ${candidates.length}곳에서 샘플 페이지 1건씩 추출합니다.`);
  console.log(`User-Agent: ${CRAWLER_USER_AGENT}`);

  mkdirSync(OUTPUT_DIR, { recursive: true });

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

    let res: { ok: boolean; status: number; text: string };
    try {
      res = await fetchText(target.sampleUrl, {
        "User-Agent": CRAWLER_USER_AGENT,
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

    const html = res.text;
    const draft = extractCardDraft(target.issuerId, target.sampleUrl, html);

    console.log(`  페이지 제목: ${draft.pageTitle ?? "(없음)"}`);
    console.log(
      `  연회비: ${
        draft.annualFee
          ? `${draft.annualFee.sourceText}${
              draft.annualFee.won !== null ? ` (${draft.annualFee.won.toLocaleString()}원)` : " (숫자 해석 실패)"
            }`
          : "표를 찾지 못함"
      }`
    );
    console.log(`  표 ${draft.tables.length}개 발견:`);
    for (const table of draft.tables) {
      console.log(`    - "${table.caption ?? "(caption 없음)"}" (${table.rows.length}행)`);
    }
    for (const warning of draft.warnings) {
      console.log(`  ⚠ ${warning}`);
    }

    const outputPath = path.join(OUTPUT_DIR, `${target.issuerId}.json`);
    writeFileSync(outputPath, JSON.stringify(draft, null, 2), "utf-8");
    console.log(`  → 추출 결과 저장: ${path.relative(process.cwd(), outputPath)}`);
  }

  console.log(
    "\n저장된 draft는 참고용 초안입니다. 카테고리별 할인율/적립률은 자유 " +
      "문장으로 되어 있어 자동으로 신뢰할 수 있게 구조화하지 않았습니다 — " +
      "draft의 tables를 보고 사람이 data/cards.seed.json에 직접 반영해주세요."
  );
}

main().catch((error) => {
  console.error("크롤러 실행 중 오류:", error);
  process.exitCode = 1;
});
