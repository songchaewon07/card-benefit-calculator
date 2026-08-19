"use client";

import { useEffect } from "react";
import { useUserSelectionStore } from "@/lib/store";

/** 마운트 후 로컬스토리지에서 저장된 선택 상태를 복원한다. (SSR 하이드레이션 불일치 방지) */
export function StoreHydration() {
  useEffect(() => {
    useUserSelectionStore.persist.rehydrate();
  }, []);

  return null;
}
