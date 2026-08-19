export const SPENDING_CATEGORIES = [
  "dining",
  "cafe",
  "telecom",
  "transport",
  "online_shopping",
  "mart_convenience",
  "subscription",
  "other",
] as const;

export type SpendingCategory = (typeof SPENDING_CATEGORIES)[number];

export const SPENDING_CATEGORY_LABELS: Record<SpendingCategory, string> = {
  dining: "외식",
  cafe: "카페",
  telecom: "통신",
  transport: "교통",
  online_shopping: "온라인쇼핑",
  mart_convenience: "마트/편의점",
  subscription: "구독/OTT",
  other: "기타",
};
