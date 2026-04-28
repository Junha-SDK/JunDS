"use client";
import { useRef, useCallback } from "react";

export interface UseLongPressOptions {
  threshold?: number;
  onStart?: () => void;
  onCancel?: () => void;
}

export function useLongPress(callback: () => void, options: UseLongPressOptions = {}) {
  const { threshold = 500, onStart, onCancel } = options;
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const isPressed = useRef(false);

  const start = useCallback(() => {
    isPressed.current = true;
    onStart?.();
    timerRef.current = setTimeout(() => {
      if (isPressed.current) callback();
    }, threshold);
  }, [callback, threshold, onStart]);

  const cancel = useCallback(() => {
    isPressed.current = false;
    clearTimeout(timerRef.current);
    onCancel?.();
  }, [onCancel]);

  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: cancel,
  };
}
