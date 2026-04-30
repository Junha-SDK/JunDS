"use client";
import { useEffect, useState, useCallback, useRef } from "react";

export function useIdle(timeout: number = 60000) {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleActivity = useCallback(() => {
    setIsIdle(false);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsIdle(true), timeout);
  }, [timeout]);

  useEffect(() => {
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"] as const;
    events.forEach((e) => document.addEventListener(e, handleActivity, { passive: true }));
    timerRef.current = setTimeout(() => setIsIdle(true), timeout);

    return () => {
      events.forEach((e) => document.removeEventListener(e, handleActivity));
      clearTimeout(timerRef.current);
    };
  }, [handleActivity, timeout]);

  return isIdle;
}
