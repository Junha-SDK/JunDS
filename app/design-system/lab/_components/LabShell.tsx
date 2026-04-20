"use client";

import { LabProvider } from "../_lib/lab-store";
import { LabToolbar } from "./LabToolbar";
import { ComponentPalette } from "./ComponentPalette";
import { Canvas } from "./Canvas";
import { PropertyEditor } from "./PropertyEditor";

export function LabShell() {
  return (
    <LabProvider>
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <LabToolbar />

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Component palette */}
          <div className="w-56 shrink-0 border-r border-gray-200 overflow-y-auto bg-white">
            <ComponentPalette />
          </div>

          {/* Center: Canvas */}
          <Canvas />

          {/* Right: Property editor */}
          <div className="w-72 shrink-0 border-l border-gray-200 overflow-y-auto bg-white">
            <PropertyEditor />
          </div>
        </div>
      </div>
    </LabProvider>
  );
}
