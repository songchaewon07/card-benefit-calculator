import type { BenefitRule, Card, PerformanceTier } from "@/features/cards/types";
import type { SpendingCategory } from "@/features/cards/categories";

export interface CategoryBenefitResult {
  category: SpendingCategory;
  spending: number;
  rule: BenefitRule | null;
  /** 카테고리별 한도 적용 전 혜택액 */
  rawBenefit: number;
  /** 카테고리별 한도 적용 후 혜택액 (전월실적 미충족 시 0) */
  cappedBenefit: number;
}

export interface CardCalculationResult {
  card: Card;
  /** 입력된 카테고리별 지출 합계 (전월실적 판정에 사용) */
  totalSpending: number;
  performanceRequirementMet: boolean;
  appliedTier: PerformanceTier | null;
  categoryResults: CategoryBenefitResult[];
  /** 통합 한도 적용 전 월 혜택 합계 */
  totalMonthlyBenefitBeforeCombinedCap: number;
  /** 통합 한도 적용 후 월 혜택 합계 */
  totalMonthlyBenefitAfterCombinedCap: number;
  /** 월 혜택 * 12 */
  estimatedAnnualBenefit: number;
  /** 연 혜택 - 연회비 */
  netAnnualBenefit: number;
}
