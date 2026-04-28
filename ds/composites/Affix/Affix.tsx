"use client";
import { cn } from "../../utils/cn";
import type { ReactNode, CSSProperties } from "react";

export interface AffixProps {
  children: ReactNode;
  position?: { top?: number; bottom?: number; left?: number; right?: number };
  zIndex?: number;
  className?: string;
}

export function Affix({ children, position = { bottom: 20, right: 20 }, zIndex = 40, className }: AffixProps) {
  const style: CSSProperties = { position: "fixed", zIndex, ...position };
  return (
    <div className={cn(className)} style={style}>
      {children}
    </div>
  );
}
