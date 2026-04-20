"use client";
import { useEffect } from "react";
import { restoreTheme } from "@/ds/tokens/themes";

/** 마운트 시 저장된 테마 복원 */
export function ThemeRestorer() {
  useEffect(() => {
    restoreTheme();
  }, []);
  return null;
}
