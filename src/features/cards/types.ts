import type { SpendingCategory } from "./categories";

export type CardType = "credit" | "check";

export type BenefitType = "discount_rate" | "reward_rate" | "flat_discount";

export type CardDataOrigin = "manual" | "official_api" | "crawled";

/**
 * 전월실적 구간. minSpend 이상을 충족해야 해당 구간의 통합(전체) 월 한도가 적용된다.
 * minSpend: 0인 구간은 "실적 조건 없음"을 의미한다 (체크카드 등).
 * monthlyCapTotal: null은 "통합 한도 없음(무제한)"을 의미한다.
 */
export interface PerformanceTier {
  minSpend: number;
  monthlyCapTotal: number | null;
}

export interface BenefitRule {
  id: string;
  cardId: string;
  category: SpendingCategory;
  benefitType: BenefitType;
  /** discount_rate/reward_rate는 %, flat_discount는 원 단위 */
  value: number;
  /** 카테고리별 월 한도(원). 한도가 없으면 null */
  monthlyCategoryCap: number | null;
  /** 계산 로직에 반영하기 어려운 예외 조항(특정 가맹점 제외 등) 메모 */
  note?: string;
}

export interface CardDataSource {
  origin: CardDataOrigin;
  lastUpdatedAt: string;
  referenceUrl?: string;
}

export interface Card {
  id: string;
  issuer: string;
  name: string;
  cardType: CardType;
  /** 연회비(원) */
  annualFee: number;
  imageUrl?: string;
  /**
   * 오름차순 정렬된 전월실적 구간 목록. 최소 1개 이상 있어야 하며, 실적
   * 조건이 없는 카드는 minSpend: 0인 구간을 넣어 표현한다. (빈 배열이면
   * 어떤 지출로도 조건을 충족할 수 없는 카드가 되므로 사용하지 않는다.)
   */
  performanceTiers: PerformanceTier[];
  benefitRules: BenefitRule[];
  source: CardDataSource;
}

export interface UserSelection {
  selectedCardIds: string[];
  categorySpending: Partial<Record<SpendingCategory, number>>;
  selectedSubscriptionIds: string[];
}

export type { SpendingCategory };
