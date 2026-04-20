"use client";
import { useEffect } from "react";

type KeyCombo = {
  key: string;
  meta?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
};

/** 키보드 단축키 바인딩 */
export function useKeyboard(
  combo: KeyCombo | KeyCombo[],
  handler: (e: KeyboardEvent) => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;
    const combos = Array.isArray(combo) ? combo : [combo];
    const listener = (e: KeyboardEvent) => {
      const match = combos.some(
        (c) =>
          e.key.toLowerCase() === c.key.toLowerCase() &&
          !!c.meta === e.metaKey &&
          !!c.ctrl === e.ctrlKey &&
          !!c.shift === e.shiftKey &&
          !!c.alt === e.altKey,
      );
      if (match) {
        e.preventDefault();
        handler(e);
      }
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [combo, handler, enabled]);
}
