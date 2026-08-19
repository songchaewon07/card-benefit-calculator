import type { SpendingCategory } from "@/features/cards/categories";

export interface SubscriptionService {
  id: string;
  name: string;
  category: SpendingCategory;
  /** 참고용 평균 월 구독료(원). 사용자가 체크하면 해당 카테고리 지출에 자동 합산된다. */
  monthlyPrice: number;
}
