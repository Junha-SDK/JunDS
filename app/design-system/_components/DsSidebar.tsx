"use client";

import { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useKeyboard } from "@/ds/hooks/useKeyboard";
import { cn } from "@/ds/utils/cn";
import { DsSearch } from "./DsSearch";
import { DsNav } from "./DsNav";
import { DsCommandPalette } from "./DsCommandPalette";

export function DsSidebar() {
  const [search, setSearch] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const pathname = usePathname();

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  // Cmd+K (mac) / Ctrl+K (windows/linux) to open palette
  useKeyboard(
    [
      { key: "k", meta: true },
      { key: "k", ctrl: true },
    ],
    openPalette,
  );

  return (
    <>
      <DsSearch value={search} onChange={setSearch} onCmdK={openPalette} />
      <div className="px-3 pb-1">
        <Link
          href="/design-system/showcase"
          className={cn(
            "flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors",
            pathname === "/design-system/showcase"
              ? "bg-white/10 text-white"
              : "text-white/40 hover:text-white/70 hover:bg-white/5",
          )}
        >
          {/* Grid icon */}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="1" width="5" height="5" rx="1" />
            <rect x="8" y="1" width="5" height="5" rx="1" />
            <rect x="1" y="8" width="5" height="5" rx="1" />
            <rect x="8" y="8" width="5" height="5" rx="1" />
          </svg>
          컬렉션 보기
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <DsNav filter={search} />
      </div>
      <DsCommandPalette open={paletteOpen} onClose={closePalette} />
    </>
  );
}
