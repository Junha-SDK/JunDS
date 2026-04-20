"use client";

import { useState, useCallback } from "react";
import { useKeyboard } from "@/ds/hooks/useKeyboard";
import { DsSearch } from "./DsSearch";
import { DsNav } from "./DsNav";
import { DsCommandPalette } from "./DsCommandPalette";

export function DsSidebar() {
  const [search, setSearch] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "visual">("list");

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  // Cmd+K to open palette
  useKeyboard({ key: "k", meta: true }, openPalette);

  return (
    <>
      <DsSearch value={search} onChange={setSearch} onCmdK={openPalette} />
      <div className="flex items-center justify-end gap-1 px-3 py-1">
        <button
          type="button"
          onClick={() => setViewMode("list")}
          className={`p-1 rounded transition-colors ${viewMode === "list" ? "text-white/80 bg-white/10" : "text-white/30 hover:text-white/50"}`}
          aria-label="리스트 뷰"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="3" width="12" height="1.5" rx="0.5" fill="currentColor" />
            <rect x="2" y="7.25" width="12" height="1.5" rx="0.5" fill="currentColor" />
            <rect x="2" y="11.5" width="12" height="1.5" rx="0.5" fill="currentColor" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setViewMode("visual")}
          className={`p-1 rounded transition-colors ${viewMode === "visual" ? "text-white/80 bg-white/10" : "text-white/30 hover:text-white/50"}`}
          aria-label="비주얼 뷰"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1.5" y="1.5" width="5" height="5" rx="1" fill="currentColor" />
            <rect x="9.5" y="1.5" width="5" height="5" rx="1" fill="currentColor" />
            <rect x="1.5" y="9.5" width="5" height="5" rx="1" fill="currentColor" />
            <rect x="9.5" y="9.5" width="5" height="5" rx="1" fill="currentColor" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <DsNav filter={search} viewMode={viewMode} />
      </div>
      <DsCommandPalette open={paletteOpen} onClose={closePalette} />
    </>
  );
}
