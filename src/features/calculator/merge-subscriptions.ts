import type { SpendingCategory } from "@/features/cards/categories";
import type { SubscriptionService } from "@/features/subscriptions/types";

/**
 * 사용자가 직접 입력한 카테고리별 지출액에, 선택한 구독 서비스의 월 구독료를
 * 해당 서비스의 카테고리에 더해 반환한다. (원본 categorySpending은 변경하지 않음)
 */
export function mergeSubscriptionSpending(
  categorySpending: Partial<Record<SpendingCategory, number>>,
  selectedSubscriptionIds: string[],
  subscriptionServices: SubscriptionService[]
): Partial<Record<SpendingCategory, number>> {
  const merged = { ...categorySpending };

  for (const subscriptionId of selectedSubscriptionIds) {
    const service = subscriptionServices.find((s) => s.id === subscriptionId);
    if (!service) continue;

    merged[service.category] =
      (merged[service.category] ?? 0) + service.monthlyPrice;
  }

  return merged;
}
