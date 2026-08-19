"use client";

import { subscriptionServices } from "@/features/subscriptions/data";
import { useUserSelectionStore } from "@/lib/store";

export function SubscriptionChecklist() {
  const selectedSubscriptionIds = useUserSelectionStore(
    (s) => s.selectedSubscriptionIds
  );
  const toggleSubscription = useUserSelectionStore((s) => s.toggleSubscription);

  return (
    <section>
      <h2 className="text-sm font-semibold text-zinc-500">구독 서비스</h2>
      <p className="mt-1 text-sm text-zinc-400">
        선택한 구독료는 구독/OTT 카테고리 지출에 자동으로 더해져요.
      </p>
      <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {subscriptionServices.map((service) => {
          const isChecked = selectedSubscriptionIds.includes(service.id);
          return (
            <li key={service.id}>
              <label
                className={
                  "flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors " +
                  (isChecked
                    ? "border-primary/30 bg-primary/5"
                    : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700")
                }
              >
                <span className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleSubscription(service.id)}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="text-sm font-medium">{service.name}</span>
                </span>
                <span className="text-sm text-zinc-500">
                  {service.monthlyPrice.toLocaleString()}원
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
