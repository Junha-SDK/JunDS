"use client";
import { useEffect, useState } from "react";

/**
 * 키보드 사용자 여부 추적 (CSS :focus-visible 폴리필 보조).
 * 키 입력이 발생하면 true, 마우스/터치 입력이 발생하면 false.
 * @example
 * const isKeyboard = useFocusVisible();
 * <button className={isKeyboard ? "ring-2" : ""}>x</button>
 */
export function useFocusVisible(): boolean {
  const [keyboard, setKeyboard] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.altKey || e.ctrlKey) return;
      setKeyboard(true);
    };
    const onPointer = () => setKeyboard(false);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("mousedown", onPointer, true);
    window.addEventListener("pointerdown", onPointer, true);
    window.addEventListener("touchstart", onPointer, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("mousedown", onPointer, true);
      window.removeEventListener("pointerdown", onPointer, true);
      window.removeEventListener("touchstart", onPointer, true);
    };
  }, []);

  return keyboard;
}
