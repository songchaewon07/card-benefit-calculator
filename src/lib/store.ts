"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SpendingCategory, UserSelection } from "@/features/cards/types";
import { sanitizeUserSelection } from "./sanitize-user-selection";

interface UserSelectionState extends UserSelection {
  toggleCard: (cardId: string) => void;
  setCategorySpending: (category: SpendingCategory, amount: number) => void;
  toggleSubscription: (subscriptionId: string) => void;
  reset: () => void;
}

const initialState: UserSelection = {
  selectedCardIds: [],
  categorySpending: {},
  selectedSubscriptionIds: [],
};

export const useUserSelectionStore = create<UserSelectionState>()(
  persist(
    (set) => ({
      ...initialState,
      toggleCard: (cardId) =>
        set((state) => ({
          selectedCardIds: state.selectedCardIds.includes(cardId)
            ? state.selectedCardIds.filter((id) => id !== cardId)
            : [...state.selectedCardIds, cardId],
        })),
      setCategorySpending: (category, amount) =>
        set((state) => ({
          categorySpending: { ...state.categorySpending, [category]: amount },
        })),
      toggleSubscription: (subscriptionId) =>
        set((state) => ({
          selectedSubscriptionIds: state.selectedSubscriptionIds.includes(
            subscriptionId
          )
            ? state.selectedSubscriptionIds.filter(
                (id) => id !== subscriptionId
              )
            : [...state.selectedSubscriptionIds, subscriptionId],
        })),
      reset: () => set(initialState),
    }),
    {
      name: "card-benefit-calculator:user-selection",
      // 서버 렌더링(빈 상태)과 클라이언트 최초 렌더링이 어긋나는 하이드레이션
      // 불일치를 막기 위해 자동 복원을 끄고, StoreHydration에서 마운트 후 수동 복원한다.
      skipHydration: true,
      // localStorage 값은 devtools로 직접 수정됐거나 손상됐을 수 있으므로
      // 형태를 신뢰하지 않고 필드별로 검증한 뒤 병합한다.
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...sanitizeUserSelection(persistedState),
      }),
    }
  )
);
