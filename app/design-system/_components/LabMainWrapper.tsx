"use client";
import { usePathname } from "next/navigation";
import { cn } from "@/ds/utils/cn";

export function LabMainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLab = pathname === "/design-system/lab";

  return (
    <main
      className={cn(
        "flex-1 overflow-y-auto transition-colors duration-300",
        isLab ? "p-0 overflow-hidden" : "p-8",
      )}
    >
      {children}
    </main>
  );
}
