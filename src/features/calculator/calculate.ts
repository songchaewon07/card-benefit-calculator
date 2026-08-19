import type { SpendingCategory } from "@/features/cards/categories";
import type { BenefitType, Card, PerformanceTier } from "@/features/cards/types";
import type { CardCalculationResult, CategoryBenefitResult } from "./types";

function findAppliedTier(
  card: Card,
  totalSpending: number
): PerformanceTier | null {
  const sortedTiers = [...card.performanceTiers].sort(
    (a, b) => a.minSpend - b.minSpend
  );

  let applied: PerformanceTier | null = null;
  for (const tier of sortedTiers) {
    if (totalSpending >= tier.minSpend) {
      applied = tier;
    } else {
      break;
    }
  }
  return applied;
}

function calculateRawBenefit(
  benefitType: BenefitType,
  value: number,
  spending: number
): number {
  switch (benefitType) {
    case "discount_rate":
    case "reward_rate":
      return spending * (value / 100);
    case "flat_discount":
      return spending > 0 ? value : 0;
  }
}

/**
 * 카드 하나에 대해, 입력된 카테고리별 지출을 이 카드 하나로 모두 사용했다고
 * 가정했을 때의 혜택을 계산한다. (여러 카드에 지출을 분산하는 시나리오는 다루지 않음)
 */
export function calculateCardBenefit(
  card: Card,
  categorySpending: Partial<Record<SpendingCategory, number>>
): CardCalculationResult {
  const totalSpending = Object.values(categorySpending).reduce<number>(
    (sum, amount) => sum + (amount ?? 0),
    0
  );

  const appliedTier = findAppliedTier(card, totalSpending);
  const performanceRequirementMet = appliedTier !== null;
  // null은 "통합 한도 없음(무제한)"을 의미하므로 0으로 취급하면 안 된다.
  const combinedCap = appliedTier ? appliedTier.monthlyCapTotal : null;

  const categoryResults: CategoryBenefitResult[] = card.benefitRules.map(
    (rule) => {
      const spending = categorySpending[rule.category] ?? 0;
      const rawBenefit = calculateRawBenefit(
        rule.benefitType,
        rule.value,
        spending
      );
      const cappedByCategory =
        rule.monthlyCategoryCap != null
          ? Math.min(rawBenefit, rule.monthlyCategoryCap)
          : rawBenefit;
      const cappedBenefit = performanceRequirementMet ? cappedByCategory : 0;

      return {
        category: rule.category,
        spending,
        rule,
        rawBenefit,
        cappedBenefit,
      };
    }
  );

  const totalMonthlyBenefitBeforeCombinedCap = categoryResults.reduce(
    (sum, result) => sum + result.cappedBenefit,
    0
  );

  const totalMonthlyBenefitAfterCombinedCap = !performanceRequirementMet
    ? 0
    : combinedCap === null
      ? totalMonthlyBenefitBeforeCombinedCap
      : Math.min(totalMonthlyBenefitBeforeCombinedCap, combinedCap);

  const estimatedAnnualBenefit = totalMonthlyBenefitAfterCombinedCap * 12;
  const netAnnualBenefit = estimatedAnnualBenefit - card.annualFee;

  return {
    card,
    totalSpending,
    performanceRequirementMet,
    appliedTier,
    categoryResults,
    totalMonthlyBenefitBeforeCombinedCap,
    totalMonthlyBenefitAfterCombinedCap,
    estimatedAnnualBenefit,
    netAnnualBenefit,
  };
}

/** netAnnualBenefit 내림차순으로 정렬된 카드별 계산 결과 목록 */
export function calculateAllCards(
  cards: Card[],
  categorySpending: Partial<Record<SpendingCategory, number>>
): CardCalculationResult[] {
  return cards
    .map((card) => calculateCardBenefit(card, categorySpending))
    .sort((a, b) => b.netAnnualBenefit - a.netAnnualBenefit);
}
