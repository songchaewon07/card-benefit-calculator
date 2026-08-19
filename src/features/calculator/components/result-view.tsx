"use client";

import { useMemo } from "react";
import { cards } from "@/features/cards/data";
import {
  SPENDING_CATEGORY_LABELS,
  type SpendingCategory,
} from "@/features/cards/categories";
import { calculateAllCards } from "@/features/calculator/calculate";
import { mergeSubscriptionSpending } from "@/features/calculator/merge-subscriptions";
import { subscriptionServices } from "@/features/subscriptions/data";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUserSelectionStore } from "@/lib/store";

export function ResultView() {
  const selectedCardIds = useUserSelectionStore((s) => s.selectedCardIds);
  const categorySpending = useUserSelectionStore((s) => s.categorySpending);
  const selectedSubscriptionIds = useUserSelectionStore(
    (s) => s.selectedSubscriptionIds
  );

  const selectedCards = useMemo(
    () => cards.filter((card) => selectedCardIds.includes(card.id)),
    [selectedCardIds]
  );

  const effectiveSpending = useMemo(
    () =>
      mergeSubscriptionSpending(
        categorySpending,
        selectedSubscriptionIds,
        subscriptionServices
      ),
    [categorySpending, selectedSubscriptionIds]
  );

  const results = useMemo(
    () => calculateAllCards(selectedCards, effectiveSpending),
    [selectedCards, effectiveSpending]
  );

  const relevantCategories = useMemo(() => {
    const set = new Set<SpendingCategory>();
    for (const card of selectedCards) {
      for (const rule of card.benefitRules) {
        set.add(rule.category);
      }
    }
    return Array.from(set);
  }, [selectedCards]);

  if (selectedCards.length === 0) {
    return (
      <Card className="border-dashed p-10 text-center">
        <p className="text-zinc-500">아직 등록된 카드가 없어요.</p>
        <LinkButton href="/cards" className="mt-4">
          카드 선택하러 가기
        </LinkButton>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="text-sm font-semibold text-zinc-500">
          카드별 총 혜택 금액
        </h2>
        <ul className="mt-3 flex flex-col gap-2">
          {results.map((result, index) => (
            <li key={result.card.id}>
              <Card className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  {index === 0 && result.netAnnualBenefit > 0 && (
                    <Badge tone="primary">최고 혜택</Badge>
                  )}
                  <div>
                    <p className="font-medium">
                      {result.card.issuer} · {result.card.name}
                    </p>
                    <Badge
                      tone={
                        result.performanceRequirementMet ? "positive" : "neutral"
                      }
                      className="mt-1"
                    >
                      {result.performanceRequirementMet
                        ? "전월실적 조건 충족"
                        : "전월실적 조건 미충족"}
                    </Badge>
                  </div>
                </div>
                <p
                  className={
                    "text-lg font-semibold " +
                    (result.netAnnualBenefit >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-500")
                  }
                >
                  연 {result.netAnnualBenefit.toLocaleString()}원
                </p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-zinc-500">
          카드별 혜택 비교
        </h2>
        <Card className="mt-3 overflow-x-auto p-0">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60">
                <th className="whitespace-nowrap px-4 py-3 font-medium">카드</th>
                {relevantCategories.map((category) => (
                  <th key={category} className="px-4 py-3 text-right font-medium">
                    {SPENDING_CATEGORY_LABELS[category]}
                  </th>
                ))}
                <th className="px-4 py-3 text-center font-medium">전월실적</th>
                <th className="px-4 py-3 text-right font-medium">한도 소진율</th>
                <th className="px-4 py-3 text-right font-medium">월 혜택</th>
                <th className="px-4 py-3 text-right font-medium">연회비</th>
                <th className="px-4 py-3 text-right font-medium">순혜택(연)</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => {
                // null은 "통합 한도 없음(무제한)"이므로 0으로 취급하면 안 된다.
                const combinedCap = result.appliedTier
                  ? result.appliedTier.monthlyCapTotal
                  : null;
                const capUsageLabel = !result.performanceRequirementMet
                  ? "-"
                  : combinedCap === null
                    ? "무제한"
                    : combinedCap === 0
                      ? "0%"
                      : `${Math.round(
                          (result.totalMonthlyBenefitAfterCombinedCap /
                            combinedCap) *
                            100
                        )}%`;

                return (
                  <tr
                    key={result.card.id}
                    className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium">
                      {result.card.issuer} {result.card.name}
                    </td>
                    {relevantCategories.map((category) => {
                      const matchingRules = result.categoryResults.filter(
                        (r) => r.category === category
                      );
                      const categoryTotal = matchingRules.reduce(
                        (sum, r) => sum + r.cappedBenefit,
                        0
                      );
                      return (
                        <td key={category} className="px-4 py-3 text-right tabular-nums">
                          {matchingRules.length > 0
                            ? `${categoryTotal.toLocaleString()}원`
                            : "-"}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center">
                      <Badge
                        tone={
                          result.performanceRequirementMet ? "positive" : "neutral"
                        }
                      >
                        {result.performanceRequirementMet ? "충족" : "미충족"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-500">
                      {capUsageLabel}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {result.totalMonthlyBenefitAfterCombinedCap.toLocaleString()}
                      원
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-500">
                      {result.card.annualFee.toLocaleString()}원
                    </td>
                    <td
                      className={
                        "px-4 py-3 text-right font-semibold tabular-nums " +
                        (result.netAnnualBenefit >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-500")
                      }
                    >
                      {result.netAnnualBenefit.toLocaleString()}원
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </section>

      <p className="text-xs text-zinc-400">
        본 계산 결과는 참고용이며, 실제 카드사 조건과 다를 수 있습니다.
        정확한 혜택은 카드사 공식 채널에서 확인해주세요.
      </p>
    </div>
  );
}
