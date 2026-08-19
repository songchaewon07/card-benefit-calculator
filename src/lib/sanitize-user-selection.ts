import type { UserSelection } from "@/features/cards/types";

export const EMPTY_USER_SELECTION: UserSelection = {
  selectedCardIds: [],
  categorySpending: {},
  selectedSubscriptionIds: [],
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isPlainNumberRecord(value: unknown): value is Record<string, number> {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }
  return Object.values(value).every((amount) => typeof amount === "number");
}

/**
 * localStorage에서 읽어온 값은 사용자가 devtools로 직접 편집했거나, 이전
 * 버전의 스키마로 저장됐거나, 파일이 손상됐을 수 있어 형태를 신뢰할 수 없다.
 * 필드별로 예상 타입을 검증하고, 어긋나면 해당 필드만 기본값으로 되돌린다.
 */
export function sanitizeUserSelection(value: unknown): UserSelection {
  const candidate = (
    value && typeof value === "object" ? value : {}
  ) as Partial<Record<keyof UserSelection, unknown>>;

  return {
    selectedCardIds: isStringArray(candidate.selectedCardIds)
      ? candidate.selectedCardIds
      : EMPTY_USER_SELECTION.selectedCardIds,
    categorySpending: isPlainNumberRecord(candidate.categorySpending)
      ? (candidate.categorySpending as UserSelection["categorySpending"])
      : EMPTY_USER_SELECTION.categorySpending,
    selectedSubscriptionIds: isStringArray(candidate.selectedSubscriptionIds)
      ? candidate.selectedSubscriptionIds
      : EMPTY_USER_SELECTION.selectedSubscriptionIds,
  };
}
