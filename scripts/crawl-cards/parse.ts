import type { Card } from "../../src/features/cards/types";

/**
 * 카드사별 페이지 파서.
 *
 * 실제 파싱 로직(셀렉터 등)은 아직 구현하지 않았다 — 각 카드사 페이지의
 * 실제 HTML 구조를 직접 확인하지 않고 추측으로 셀렉터를 작성하면, 페이지
 * 구조가 조금만 달라도 조용히 잘못된 혜택 데이터를 만들어낼 수 있어
 * "데이터 없음"보다 위험하다. 담당자가 실제 페이지를 확인한 뒤 이슈어별로
 * 이 함수를 채워 넣는 것을 전제로 한다.
 */
export function parseCardPage(issuerId: string, _html: string): Card[] {
  console.warn(
    `  [parseCardPage] ${issuerId}: 파서가 아직 구현되지 않았습니다. ` +
      `실제 페이지 구조를 확인한 뒤 이 함수를 구현해주세요.`
  );
  return [];
}
