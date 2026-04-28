"use client";
import { usePathname } from "next/navigation";
import { cn } from "@/ds/utils/cn";

export function LabMainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullWidth = pathname === "/design-system/lab" || pathname === "/design-system/showcase";

  return (
    <main
      data-jds-content
      className={cn(
        "flex-1 overflow-y-auto transition-colors duration-300",
        isFullWidth ? "p-0 overflow-hidden" : "p-8",
      )}
    >
      {children}
    </main>
  );
}
