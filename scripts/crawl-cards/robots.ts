import robotsParser from "robots-parser";

// 실제 신원과 연락처를 밝히는 User-Agent. 검색엔진/AI 봇을 사칭하지 않는다 —
// 각 카드사 robots.txt는 봇 종류별로 다른 정책을 적용하므로, 사칭은 그 사이트가
// 실제로 허용하지 않은 접근을 허용된 것처럼 위장하는 셈이 되어 절대 하지 않는다.
export const CRAWLER_USER_AGENT =
  "CardBenefitCalculatorBot/0.1 (+https://github.com/songchaewon07/card-benefit-calculator; contact: songchaewon0507@gmail.com)";

export interface RobotsCheckResult {
  allowed: boolean | undefined;
  reason: string;
}

/**
 * robots.txt를 실행 시점에 다시 조회해 판단한다. targets.ts의 status는
 * 조사 시점의 스냅샷일 뿐이므로, 실제 요청 전에는 항상 이 함수로 재확인한다.
 */
export async function checkRobotsAllowed(
  robotsTxtUrl: string,
  targetUrl: string
): Promise<RobotsCheckResult> {
  const res = await fetch(robotsTxtUrl, {
    headers: { "User-Agent": CRAWLER_USER_AGENT },
  });

  if (!res.ok) {
    return {
      allowed: undefined,
      reason: `robots.txt 조회 실패 (HTTP ${res.status})`,
    };
  }

  const body = await res.text();
  const robots = robotsParser(robotsTxtUrl, body);
  const allowed = robots.isAllowed(targetUrl, CRAWLER_USER_AGENT);

  return {
    allowed,
    reason:
      allowed === undefined
        ? "robots.txt에서 이 URL에 대한 규칙을 판단할 수 없음"
        : allowed
          ? "robots.txt 허용"
          : "robots.txt에서 차단됨",
  };
}
