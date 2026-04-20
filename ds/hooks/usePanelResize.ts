"use client";
import { useEffect, useRef, useState } from "react";

export interface UsePanelResizeOptions {
  initialWidth?: number;
  min?: number;
  max?: number;
}

/**
 * 패널 리사이즈 훅
 * 마우스 드래그로 패널 너비를 조절합니다.
 *
 * @example
 * const { width, startResize } = usePanelResize({ initialWidth: 400, min: 280, max: 600 });
 * <div style={{ width }}>
 *   <div onMouseDown={startResize} className="w-1 cursor-col-resize" />
 *   content
 * </div>
 */
export function usePanelResize(options?: UsePanelResizeOptions) {
  const initialWidth = options?.initialWidth ?? 400;
  const min = options?.min ?? 280;
  const max = options?.max ?? 720;

  const [width, setWidth] = useState(initialWidth);
  const resizingRef = useRef(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;
      const vw = window.innerWidth;
      const newW = Math.max(min, Math.min(max, vw - e.clientX));
      setWidth(newW);
    };
    const onUp = () => {
      if (!resizingRef.current) return;
      resizingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [min, max]);

  const startResize = () => {
    resizingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  return { width, startResize };
}
