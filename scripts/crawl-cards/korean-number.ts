/**
 * 카드사 페이지에 자주 나오는 한글 숫자 표기("3만원", "2만 3천원",
 * "1만 5천 포인트")를 정수로 변환한다. "적립제한 없이", "-" 처럼 숫자가
 * 아닌 값은 null을 반환한다 (추측해서 0 등으로 채우지 않는다).
 */
export function parseKoreanWon(text: string): number | null {
  const normalized = text
    .replace(/\(.*?\)/g, "")
    .replace(/(이상|이하|미만|초과)/g, "")
    .replace(/[,\s]/g, "");

  // 만/천 단위가 전혀 없는 순수 아라비아 숫자 (예: "500", "1000원")
  const plainDigits = normalized.match(/^(\d+)(원|포인트)?$/);
  if (plainDigits) {
    return Number(plainDigits[1]);
  }

  // "2만3천원", "1만5천포인트", "80만원", "3만원" 등
  const unitPattern = /^(?:(\d+)억)?(?:(\d+)만)?(?:(\d+)천)?(?:(\d+)백)?(?:(\d+))?(원|포인트)?$/;
  const match = normalized.match(unitPattern);
  if (!match) {
    return null;
  }

  const [, eok, man, cheon, baek, rest] = match;
  if (!eok && !man && !cheon && !baek && !rest) {
    return null;
  }

  return (
    Number(eok ?? 0) * 100_000_000 +
    Number(man ?? 0) * 10_000 +
    Number(cheon ?? 0) * 1_000 +
    Number(baek ?? 0) * 100 +
    Number(rest ?? 0)
  );
}
