"use client";
import { shadows } from "@/ds/tokens/shadows";

export default function ShadowsPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">Shadows</h1>
      <p className="text-sm text-muted mb-6">Elevation 기반 그림자 시스템</p>

      <div className="grid grid-cols-2 gap-6">
        {Object.entries(shadows).map(([key, value]) => (
          <div key={key} className="flex flex-col items-center gap-3 p-6">
            <div
              className="w-24 h-24 bg-white rounded-xl flex items-center justify-center"
              style={{ boxShadow: value }}
            >
              <code className="text-xs font-mono text-muted">{key}</code>
            </div>
            <code className="text-[10px] font-mono text-muted-light text-center max-w-[200px] break-all">
              {value}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
}
