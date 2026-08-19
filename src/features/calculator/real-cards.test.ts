import { describe, expect, it } from "vitest";
import { cards } from "@/features/cards/data";
import { calculateCardBenefit } from "./calculate";

/**
 * data/cards.seed.json에 반영된 실제 카드 4종(source.origin: "crawled")에
 * 대한 회귀 테스트. 각 케이스의 기대값은 브라우저에서 실제로 계산 결과를
 * 확인해 검증한 숫자를 그대로 고정한 것이다 (커밋 이력 참고). 이 카드들의
 * BenefitRule/PerformanceTier를 건드리거나 계산 엔진 로직을 바꿀 때, 의도한
 * 변경인지 여기서 바로 드러난다 — 합성 픽스처(calculate.test.ts)만으로는
 * 이 카드들의 실제 구조(그룹 겹침, 한도 최소구간 채택 등)를 검증하지 못한다.
 */
function getCard(id: string) {
  const card = cards.find((c) => c.id === id);
  if (!card) {
    throw new Error(
      `시드 데이터에서 "${id}" 카드를 찾을 수 없습니다. data/cards.seed.json이 바뀌었다면 이 테스트도 함께 갱신해주세요.`
    );
  }
  return card;
}

describe("실제 카드 회귀 테스트", () => {
  it("KB Easy all 티타늄카드", () => {
    const result = calculateCardBenefit(getCard("card-kb-easyall-titanium"), {
      dining: 300000,
      cafe: 100000,
      telecom: 50000,
      transport: 100000,
      online_shopping: 150000,
      mart_convenience: 100000,
      subscription: 20000,
      other: 100000,
    });

    expect(result.totalSpending).toBe(920000);
    expect(result.performanceRequirementMet).toBe(true);
    expect(result.appliedTier?.monthlyCapTotal).toBe(16000);
    expect(result.totalMonthlyBenefitBeforeCombinedCap).toBe(44000);
    expect(result.totalMonthlyBenefitAfterCombinedCap).toBe(16000);
    expect(result.netAnnualBenefit).toBe(162000);
  });

  it("신한카드 Deep Dream 체크", () => {
    const result = calculateCardBenefit(
      getCard("card-shinhan-deepdream-check"),
      {
        mart_convenience: 300000,
        cafe: 100000,
        telecom: 50000,
        other: 100000,
      }
    );

    expect(result.totalSpending).toBe(550000);
    expect(result.performanceRequirementMet).toBe(true);
    expect(result.appliedTier?.monthlyCapTotal).toBe(15000);
    expect(result.totalMonthlyBenefitAfterCombinedCap).toBe(3300);
    expect(result.netAnnualBenefit).toBe(39600);
  });

  it("하나카드 원더카드 2.0 FREE+", () => {
    const result = calculateCardBenefit(getCard("card-hana-wonder2-freeplus"), {
      dining: 200000,
      transport: 100000,
      online_shopping: 200000,
      other: 150000,
    });

    expect(result.totalSpending).toBe(650000);
    expect(result.performanceRequirementMet).toBe(true);
    expect(result.appliedTier?.monthlyCapTotal).toBeNull(); // 통합 한도 없음
    expect(result.totalMonthlyBenefitAfterCombinedCap).toBe(13200);
    expect(result.netAnnualBenefit).toBe(158400);
  });

  it("현대카드 체크(캐시백형)", () => {
    const result = calculateCardBenefit(
      getCard("card-hyundai-check-cashback"),
      {
        dining: 200000,
        cafe: 100000,
        mart_convenience: 100000,
        other: 150000,
      }
    );

    expect(result.totalSpending).toBe(550000);
    expect(result.performanceRequirementMet).toBe(true);
    expect(result.appliedTier?.monthlyCapTotal).toBe(5000);
    expect(result.totalMonthlyBenefitBeforeCombinedCap).toBe(10650);
    expect(result.totalMonthlyBenefitAfterCombinedCap).toBe(5000);
    expect(result.netAnnualBenefit).toBe(55000);
  });

  it("실제 카드는 모두 source.origin이 crawled다 (합성 카드와 혼동 방지)", () => {
    const realCardIds = [
      "card-kb-easyall-titanium",
      "card-shinhan-deepdream-check",
      "card-hana-wonder2-freeplus",
      "card-hyundai-check-cashback",
    ];
    for (const id of realCardIds) {
      expect(getCard(id).source.origin).toBe("crawled");
    }
  });
});
