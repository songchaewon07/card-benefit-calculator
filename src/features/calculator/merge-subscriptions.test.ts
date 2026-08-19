import { describe, expect, it } from "vitest";
import type { SubscriptionService } from "@/features/subscriptions/types";
import { mergeSubscriptionSpending } from "./merge-subscriptions";

const services: SubscriptionService[] = [
  { id: "netflix", name: "넷플릭스", category: "subscription", monthlyPrice: 13500 },
  { id: "youtube", name: "유튜브 프리미엄", category: "subscription", monthlyPrice: 14900 },
];

describe("mergeSubscriptionSpending", () => {
  it("선택한 구독 서비스의 월 요금을 해당 카테고리에 합산한다", () => {
    const result = mergeSubscriptionSpending(
      { subscription: 5000 },
      ["netflix", "youtube"],
      services
    );

    expect(result.subscription).toBe(5000 + 13500 + 14900);
  });

  it("존재하지 않는 구독 id는 무시한다", () => {
    const result = mergeSubscriptionSpending({}, ["unknown"], services);
    expect(result.subscription).toBeUndefined();
  });

  it("원본 categorySpending 객체를 변경하지 않는다", () => {
    const original = { subscription: 1000 };
    mergeSubscriptionSpending(original, ["netflix"], services);
    expect(original.subscription).toBe(1000);
  });
});
