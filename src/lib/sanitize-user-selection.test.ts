import { describe, expect, it } from "vitest";
import { sanitizeUserSelection } from "./sanitize-user-selection";

describe("sanitizeUserSelection", () => {
  it("정상적인 값은 그대로 통과시킨다", () => {
    const input = {
      selectedCardIds: ["card-1", "card-2"],
      categorySpending: { dining: 10000, cafe: 5000 },
      selectedSubscriptionIds: ["sub-1"],
    };

    expect(sanitizeUserSelection(input)).toEqual(input);
  });

  it("undefined/null 입력은 빈 기본값으로 대체한다", () => {
    expect(sanitizeUserSelection(undefined)).toEqual({
      selectedCardIds: [],
      categorySpending: {},
      selectedSubscriptionIds: [],
    });
    expect(sanitizeUserSelection(null)).toEqual({
      selectedCardIds: [],
      categorySpending: {},
      selectedSubscriptionIds: [],
    });
  });

  it("selectedCardIds가 배열이 아니면 빈 배열로 대체한다", () => {
    const result = sanitizeUserSelection({
      selectedCardIds: "card-1",
      categorySpending: {},
      selectedSubscriptionIds: [],
    });
    expect(result.selectedCardIds).toEqual([]);
  });

  it("selectedCardIds 배열에 문자열이 아닌 값이 섞여 있으면 빈 배열로 대체한다", () => {
    const result = sanitizeUserSelection({
      selectedCardIds: ["card-1", 42, null],
      categorySpending: {},
      selectedSubscriptionIds: [],
    });
    expect(result.selectedCardIds).toEqual([]);
  });

  it("categorySpending이 객체가 아니면 빈 객체로 대체한다", () => {
    const result = sanitizeUserSelection({
      selectedCardIds: [],
      categorySpending: "not-an-object",
      selectedSubscriptionIds: [],
    });
    expect(result.categorySpending).toEqual({});
  });

  it("categorySpending 값에 숫자가 아닌 값이 섞여 있으면 빈 객체로 대체한다", () => {
    const result = sanitizeUserSelection({
      selectedCardIds: [],
      categorySpending: { dining: "많이" },
      selectedSubscriptionIds: [],
    });
    expect(result.categorySpending).toEqual({});
  });

  it("categorySpending이 배열이면 빈 객체로 대체한다", () => {
    const result = sanitizeUserSelection({
      selectedCardIds: [],
      categorySpending: [1, 2, 3],
      selectedSubscriptionIds: [],
    });
    expect(result.categorySpending).toEqual({});
  });

  it("완전히 다른 형태(문자열)의 입력에도 안전하게 기본값을 반환한다", () => {
    const result = sanitizeUserSelection("corrupted-json-string");
    expect(result).toEqual({
      selectedCardIds: [],
      categorySpending: {},
      selectedSubscriptionIds: [],
    });
  });
});
