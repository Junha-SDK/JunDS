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
      // e.key 는 IME 조합 중 / 일부 미디어 키에서 undefined 일 수 있음.
      // c.key 도 호출부가 잘못 넘기면 undefined — 둘 다 방어해야 globally 등록된 keydown
      // 리스너가 toLowerCase 에서 터지면서 페이지 전반 인터랙션이 막힌다.
      const eKey = e.key;
      if (typeof eKey !== "string") return;
      const eKeyLc = eKey.toLowerCase();
      const match = combos.some(
        (c) =>
          typeof c.key === "string" &&
          eKeyLc === c.key.toLowerCase() &&
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
