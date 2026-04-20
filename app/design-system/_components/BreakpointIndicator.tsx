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

  const bp = width >= 1536 ? "2xl" : width >= 1280 ? "xl" : width >= 1024 ? "lg" : width >= 768 ? "md" : width >= 640 ? "sm" : "xs";

  return (
    <span className="text-[10px] font-mono text-white/30 tabular-nums" title={`${width}px`}>
      {bp} {width}
    </span>
  );
}
