"use client";

import { SPENDING_CATEGORIES, SPENDING_CATEGORY_LABELS } from "@/features/cards/categories";
import { Card } from "@/components/ui/card";
import { useUserSelectionStore } from "@/lib/store";

export function CategorySpendingForm() {
  const categorySpending = useUserSelectionStore((s) => s.categorySpending);
  const setCategorySpending = useUserSelectionStore(
    (s) => s.setCategorySpending
  );

  return (
    <section>
      <h2 className="text-sm font-semibold text-zinc-500">
        카테고리별 예상 지출
      </h2>
      <Card className="mt-3 grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
        {SPENDING_CATEGORIES.map((category) => {
          const amount = categorySpending[category];
          return (
            <label key={category} className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {SPENDING_CATEGORY_LABELS[category]}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={amount ? amount : ""}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const parsed = raw === "" ? 0 : Number(raw);
                    setCategorySpending(
                      category,
                      Number.isNaN(parsed) ? 0 : Math.max(0, parsed)
                    );
                  }}
                  placeholder="0"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-zinc-700 dark:bg-zinc-900"
                />
                <span className="text-zinc-400">원</span>
              </div>
            </label>
          );
        })}
      </Card>
    </section>
  );
}
