"use client";

import {
  SPENDING_CATEGORIES,
  SPENDING_CATEGORY_LABELS,
} from "@/features/cards/categories";
import { mergeSubscriptionSpending } from "@/features/calculator/merge-subscriptions";
import { subscriptionServices } from "@/features/subscriptions/data";
import { Card } from "@/components/ui/card";
import { useUserSelectionStore } from "@/lib/store";

export function SpendingSummary() {
  const categorySpending = useUserSelectionStore((s) => s.categorySpending);
  const selectedSubscriptionIds = useUserSelectionStore(
    (s) => s.selectedSubscriptionIds
  );

  const merged = mergeSubscriptionSpending(
    categorySpending,
    selectedSubscriptionIds,
    subscriptionServices
  );

  const entries = SPENDING_CATEGORIES.map((category) => ({
    category,
    amount: merged[category] ?? 0,
  })).filter((entry) => entry.amount > 0);

  const total = entries.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-zinc-500">
        총 지출 미리보기 (구독료 반영)
      </h2>
      {entries.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-400">
          아직 입력된 지출이 없어요.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-1.5 text-sm">
          {entries.map((entry) => (
            <li key={entry.category} className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">
                {SPENDING_CATEGORY_LABELS[entry.category]}
              </span>
              <span className="font-medium">
                {entry.amount.toLocaleString()}원
              </span>
            </li>
          ))}
          <li className="mt-2 flex justify-between border-t border-zinc-200 pt-3 text-base font-semibold dark:border-zinc-800">
            <span>합계</span>
            <span className="text-primary">{total.toLocaleString()}원</span>
          </li>
        </ul>
      )}
    </Card>
  );
}
