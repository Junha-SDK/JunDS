"use client";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { BreakpointKey } from "../core/styleProps";
import { BREAKPOINTS } from "../core/styleProps";

export interface ShowProps {
  children: ReactNode;
  above?: BreakpointKey;
  below?: BreakpointKey;
}

export function Show({ children, above, below }: ShowProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (above && below) setVisible(w >= BREAKPOINTS[above] && w < BREAKPOINTS[below]);
      else if (above) setVisible(w >= BREAKPOINTS[above]);
      else if (below) setVisible(w < BREAKPOINTS[below]);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [above, below]);

  return visible ? <>{children}</> : null;
}

export function Hide({ children, above, below }: ShowProps) {
  return <Show above={below} below={above}>{children}</Show>;
}
