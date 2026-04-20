"use client";

import { cn } from "@/ds/utils/cn";
import { LabProvider } from "../_lib/lab-store";
import { LabToolbar } from "./LabToolbar";
import { TokenPanel } from "./TokenPanel";
import { LayoutPreview } from "./LayoutPreview";
import { StructurePanel } from "./StructurePanel";

/* ------------------------------------------------------------------ */
/*  LabShell — main layout wrapping everything in LabProvider          */
/* ------------------------------------------------------------------ */

export function LabShell() {
  return (
    <LabProvider>
      <div className="flex flex-col h-full">
        {/* Top toolbar */}
        <LabToolbar />

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Token panel */}
          <TokenPanel />

          {/* Center: Layout preview */}
          <LayoutPreview />

          {/* Right: Structure panel */}
          <StructurePanel />
        </div>
      </div>
    </LabProvider>
  );
}
