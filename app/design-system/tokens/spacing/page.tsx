"use client";
import { spacing } from "@/ds/tokens/spacing";

export default function SpacingPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">Spacing</h1>
      <p className="text-sm text-muted mb-6">4px 베이스 간격 스케일</p>

      <div className="bg-white border border-border rounded-xl p-6">
        <div className="flex flex-col gap-3">
          {Object.entries(spacing).map(([key, value]) => (
            <div key={key} className="flex items-center gap-4">
              <code className="text-xs font-mono text-muted w-10 shrink-0 text-right">{key}</code>
              <span className="text-xs text-muted-light w-20 shrink-0">{value}</span>
              <div className="flex items-center flex-1">
                <div
                  className="h-4 bg-primary/20 border border-primary/30 rounded-sm"
                  style={{ width: value }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
