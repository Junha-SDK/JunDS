"use client";
import { useState, useEffect } from "react";

export function BreakpointIndicator() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const bp =
    width >= 1536
      ? "2xl"
      : width >= 1280
      ? "xl"
      : width >= 1024
      ? "lg"
      : width >= 768
      ? "md"
      : width >= 640
      ? "sm"
      : "xs";

  return (
    // white/30 은 어두운 레일 위에서 3:1 근처라 숫자를 읽을 수 없었다 — /55 가 하한이다
    <span
      className="text-[10px] font-mono text-white/55 tabular-nums whitespace-nowrap"
      title={`${width}px`}
    >
      {bp} {width}
    </span>
  );
}
