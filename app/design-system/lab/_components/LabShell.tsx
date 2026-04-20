"use client";

import { cn } from "@/ds/utils/cn";
import { LabProvider } from "../_lib/store";
import { LabToolbar } from "./LabToolbar";
import { ComponentPalette } from "./ComponentPalette";
import { BuilderCanvas } from "./BuilderCanvas";
import { PropsPanel } from "./PropsPanel";

export function LabShell() {
  return (
    <LabProvider>
      <div className={cn("flex flex-col h-full bg-background")}>
        <LabToolbar />
        <div className="flex flex-1 overflow-hidden">
          <ComponentPalette />
          <BuilderCanvas />
          <PropsPanel />
        </div>
      </div>
    </LabProvider>
  );
}
