"use client";

import { useState, useCallback } from "react";
import { useKeyboard } from "@/ds/hooks/useKeyboard";
import { DsSearch } from "./DsSearch";
import { DsNav } from "./DsNav";
import { DsCommandPalette } from "./DsCommandPalette";

export function DsSidebar() {
  const [search, setSearch] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  // Cmd+K to open palette
  useKeyboard({ key: "k", meta: true }, openPalette);

  return (
    <>
      <DsSearch value={search} onChange={setSearch} onCmdK={openPalette} />
      <div className="flex-1 overflow-y-auto">
        <DsNav filter={search} />
      </div>
      <DsCommandPalette open={paletteOpen} onClose={closePalette} />
    </>
  );
}
