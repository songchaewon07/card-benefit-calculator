import { describe, expect, it } from "vitest";
import type { Card } from "@/features/cards/types";
import { calculateAllCards, calculateCardBenefit } from "./calculate";

const baseCard: Card = {
  id: "test-card",
  issuer: "테스트카드사",
  name: "테스트카드",
  cardType: "credit",
  annualFee: 12000,
  performanceTiers: [{ minSpend: 300000, monthlyCapTotal: 10000 }],
  benefitRules: [
    {
      id: "test-card-dining",
      cardId: "test-card",
      category: "dining",
      benefitType: "discount_rate",
      value: 10,
      monthlyCategoryCap: 8000,
    },
    {
      id: "test-card-cafe",
      cardId: "test-card",
      category: "cafe",
      benefitType: "reward_rate",
      value: 10,
      monthlyCategoryCap: 8000,
    },
  ],
  source: { origin: "manual", lastUpdatedAt: "2026-08-19" },
};

describe("calculateCardBenefit", () => {
  it("전월실적 미충족 시 모든 혜택이 0이 된다", () => {
    const result = calculateCardBenefit(baseCard, {
      dining: 100000,
      cafe: 100000,
    });

    expect(result.performanceRequirementMet).toBe(false);
    expect(result.appliedTier).toBeNull();
    expect(result.totalMonthlyBenefitAfterCombinedCap).toBe(0);
    expect(result.netAnnualBenefit).toBe(-baseCard.annualFee);
    for (const categoryResult of result.categoryResults) {
      expect(categoryResult.cappedBenefit).toBe(0);
    }
  });

  it("카테고리별 한도를 초과하면 한도만큼만 적용된다", () => {
    const result = calculateCardBenefit(baseCard, {
      dining: 300000, // raw benefit 30000 > cap 8000
      other: 0,
    });

    const diningResult = result.categoryResults.find(
      (r) => r.category === "dining"
    );
    expect(diningResult?.rawBenefit).toBe(30000);
    expect(diningResult?.cappedBenefit).toBe(8000);
  });

  it("통합 한도를 초과하면 통합 한도만큼만 적용된다 (카테고리별 한도는 충족)", () => {
    const result = calculateCardBenefit(baseCard, {
      dining: 100000, // capped benefit 8000 (< category cap after 10% = 10000 capped to 8000)
      cafe: 100000, // capped benefit 8000
      other: 150000, // 전월실적 충족용, 혜택 규칙 없음
    });

    expect(result.performanceRequirementMet).toBe(true);
    expect(result.totalSpending).toBe(350000);
    expect(result.totalMonthlyBenefitBeforeCombinedCap).toBe(16000);
    // 통합 한도 10000으로 클램프
    expect(result.totalMonthlyBenefitAfterCombinedCap).toBe(10000);
    expect(result.estimatedAnnualBenefit).toBe(120000);
    expect(result.netAnnualBenefit).toBe(120000 - baseCard.annualFee);
  });

  it("전월실적 기준금액이 0인 카드는 지출이 없어도 조건을 충족한다", () => {
    const zeroTierCard: Card = {
      ...baseCard,
      id: "check-card",
      performanceTiers: [{ minSpend: 0, monthlyCapTotal: 3000 }],
    };

    const result = calculateCardBenefit(zeroTierCard, {});

    expect(result.performanceRequirementMet).toBe(true);
    expect(result.totalMonthlyBenefitAfterCombinedCap).toBe(0);
  });

  it("카테고리별 한도가 null이면 무제한으로 적용된다", () => {
    const uncappedCategoryCard: Card = {
      ...baseCard,
      performanceTiers: [{ minSpend: 300000, monthlyCapTotal: 1000000 }],
      benefitRules: [
        {
          id: "uncapped-dining",
          cardId: "test-card",
          category: "dining",
          benefitType: "discount_rate",
          value: 10,
          monthlyCategoryCap: null,
        },
      ],
    };

    const result = calculateCardBenefit(uncappedCategoryCard, {
      dining: 500000,
    });

    // 500000 * 10% = 50000, 카테고리 한도가 없으므로 그대로 적용
    expect(result.categoryResults[0].cappedBenefit).toBe(50000);
    expect(result.totalMonthlyBenefitAfterCombinedCap).toBe(50000);
  });

  it("통합 한도가 null이면 무제한으로 적용된다 (0으로 축소되지 않는다)", () => {
    const uncappedCombinedCard: Card = {
      ...baseCard,
      performanceTiers: [{ minSpend: 300000, monthlyCapTotal: null }],
    };

    const result = calculateCardBenefit(uncappedCombinedCard, {
      dining: 300000, // raw 30000, 카테고리 한도 8000으로 클램프
      cafe: 300000, // raw 30000, 카테고리 한도 8000으로 클램프
    });

    expect(result.performanceRequirementMet).toBe(true);
    expect(result.appliedTier?.monthlyCapTotal).toBeNull();
    // 통합 한도가 없으므로 카테고리 합산(16000)이 그대로 유지되어야 한다
    expect(result.totalMonthlyBenefitAfterCombinedCap).toBe(16000);
  });

  it("여러 실적 구간 중 지출액에 맞는 최고 구간이 적용된다", () => {
    const tieredCard: Card = {
      ...baseCard,
      performanceTiers: [
        { minSpend: 300000, monthlyCapTotal: 10000 },
        { minSpend: 600000, monthlyCapTotal: 20000 },
      ],
    };

    const result = calculateCardBenefit(tieredCard, {
      dining: 400000,
      cafe: 400000,
    });

    expect(result.totalSpending).toBe(800000);
    expect(result.appliedTier?.monthlyCapTotal).toBe(20000);
    // dining/cafe 각각 카테고리 한도 8000으로 클램프 -> 합 16000, 통합한도 20000 이내
    expect(result.totalMonthlyBenefitAfterCombinedCap).toBe(16000);
  });
});

describe("calculateAllCards", () => {
  it("netAnnualBenefit 내림차순으로 정렬한다", () => {
    const lowBenefitCard: Card = {
      ...baseCard,
      id: "low-card",
      annualFee: 0,
      benefitRules: [],
    };

    const results = calculateAllCards([lowBenefitCard, baseCard], {
      dining: 100000,
      cafe: 100000,
      other: 150000,
    });

    expect(results.map((r) => r.card.id)).toEqual(["test-card", "low-card"]);
  });
});
