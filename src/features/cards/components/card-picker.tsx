"use client";

import { useMemo, useState } from "react";
import { cards } from "@/features/cards/data";
import type { CardType } from "@/features/cards/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUserSelectionStore } from "@/lib/store";

const CARD_TYPE_LABELS: Record<CardType, string> = {
  credit: "신용카드",
  check: "체크카드",
};

type CardTypeFilter = "all" | CardType;

export function CardPicker() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<CardTypeFilter>("all");

  const selectedCardIds = useUserSelectionStore((s) => s.selectedCardIds);
  const toggleCard = useUserSelectionStore((s) => s.toggleCard);

  const selectedCards = useMemo(
    () => cards.filter((card) => selectedCardIds.includes(card.id)),
    [selectedCardIds]
  );

  const filteredCards = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return cards.filter((card) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        card.name.toLowerCase().includes(normalizedQuery) ||
        card.issuer.toLowerCase().includes(normalizedQuery);
      const matchesType = typeFilter === "all" || card.cardType === typeFilter;
      return matchesQuery && matchesType;
    });
  }, [query, typeFilter]);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="text-sm font-semibold text-zinc-500">
          내 카드 ({selectedCards.length})
        </h2>
        {selectedCards.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-400">
            아직 등록된 카드가 없어요. 아래 목록에서 카드를 선택해주세요.
          </p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {selectedCards.map((card) => (
              <li key={card.id}>
                <button
                  type="button"
                  onClick={() => toggleCard(card.id)}
                  className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                >
                  <span>
                    {card.issuer} {card.name}
                  </span>
                  <span aria-hidden>✕</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="카드사 또는 카드명 검색"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-zinc-700 dark:bg-zinc-900 sm:max-w-xs"
          />
          <div className="flex gap-1 rounded-full bg-zinc-100 p-1 dark:bg-zinc-800">
            {(["all", "credit", "check"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTypeFilter(type)}
                className={
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors " +
                  (typeFilter === type
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white")
                }
              >
                {type === "all" ? "전체" : CARD_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        <ul className="flex flex-col gap-2">
          {filteredCards.map((card) => {
            const isSelected = selectedCardIds.includes(card.id);
            return (
              <li key={card.id}>
                <Card className="flex items-center justify-between px-4 py-3.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {card.issuer} · {card.name}
                      </p>
                      <Badge tone="neutral">
                        {CARD_TYPE_LABELS[card.cardType]}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-zinc-500">
                      연회비 {card.annualFee.toLocaleString()}원
                    </p>
                    {card.note && (
                      <p className="mt-1.5 max-w-md text-xs text-amber-600 dark:text-amber-400">
                        ⚠ {card.note}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant={isSelected ? "secondary" : "primary"}
                    size="sm"
                    onClick={() => toggleCard(card.id)}
                  >
                    {isSelected ? "제외하기" : "추가하기"}
                  </Button>
                </Card>
              </li>
            );
          })}
          {filteredCards.length === 0 && (
            <li className="text-sm text-zinc-400">검색 결과가 없어요.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
