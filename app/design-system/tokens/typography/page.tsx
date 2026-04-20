"use client";
import { fontSize, fontWeight } from "@/ds/tokens/typography";

export default function TypographyPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">Typography</h1>
      <p className="text-sm text-muted mb-6">Geist Sans/Mono 기반 타이포그래피 스케일</p>

      <div className="bg-white border border-border rounded-xl p-6 mb-6">
        <h2 className="text-base font-semibold mb-4">Font Size Scale</h2>
        <div className="flex flex-col gap-4">
          {Object.entries(fontSize).map(([key, value]) => (
            <div key={key} className="flex items-baseline gap-4">
              <code className="text-xs font-mono text-muted w-12 shrink-0">{key}</code>
              <span className="text-xs text-muted-light w-16 shrink-0">{value}</span>
              <span style={{ fontSize: value }} className="text-foreground">
                디자인 시스템 Typography — {key}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl p-6 mb-6">
        <h2 className="text-base font-semibold mb-4">Font Weight</h2>
        <div className="flex flex-col gap-3">
          {Object.entries(fontWeight).map(([key, value]) => (
            <div key={key} className="flex items-baseline gap-4">
              <code className="text-xs font-mono text-muted w-20 shrink-0">{key}</code>
              <span className="text-xs text-muted-light w-12 shrink-0">{value}</span>
              <span style={{ fontWeight: value }} className="text-lg text-foreground">
                가나다라마바사 ABCDEFG 123456
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl p-6">
        <h2 className="text-base font-semibold mb-4">Font Family</h2>
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-xs text-muted mb-1">Sans (Geist Sans)</div>
            <p className="text-lg font-sans">The quick brown fox jumps over the lazy dog. 가나다라마바사아자차카</p>
          </div>
          <div>
            <div className="text-xs text-muted mb-1">Mono (Geist Mono)</div>
            <p className="text-lg font-mono">const foo = &quot;bar&quot;; // 0123456789</p>
          </div>
        </div>
      </div>
    </div>
  );
}
