"use client";
import { cn } from "../utils/cn";
import type { ReactNode, HTMLAttributes } from "react";

type StackProps = HTMLAttributes<HTMLDivElement> & {
  direction?: "vertical" | "horizontal";
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  wrap?: boolean;
  children: ReactNode;
};

const gapMap: Record<number, string> = {
  0: "gap-0", 1: "gap-1", 2: "gap-2", 3: "gap-3", 4: "gap-4",
  5: "gap-5", 6: "gap-6", 8: "gap-8", 10: "gap-10", 12: "gap-12",
};
const alignMap = {
  start: "items-start", center: "items-center", end: "items-end",
  stretch: "items-stretch", baseline: "items-baseline",
};
const justifyMap = {
  start: "justify-start", center: "justify-center", end: "justify-end",
  between: "justify-between", around: "justify-around", evenly: "justify-evenly",
};

export function Stack({
  direction = "vertical",
  gap = 3,
  align,
  justify,
  wrap,
  className,
  children,
  ...props
}: StackProps) {
  return (
    <div
      className={cn(
        "flex",
        direction === "vertical" ? "flex-col" : "flex-row",
        gapMap[gap],
        align && alignMap[align],
        justify && justifyMap[justify],
        wrap && "flex-wrap",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** 수평 Stack 숏컷 */
export function HStack(props: Omit<StackProps, "direction">) {
  return <Stack direction="horizontal" {...props} />;
}

/** 수직 Stack 숏컷 */
export function VStack(props: Omit<StackProps, "direction">) {
  return <Stack direction="vertical" {...props} />;
}
