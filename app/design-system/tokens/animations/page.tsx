"use client";
import { useState } from "react";
import { animationClass } from "@/ds/tokens/animation";

export default function AnimationsPage() {
  const [replay, setReplay] = useState(0);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">Animations</h1>
      <p className="text-sm text-muted mb-4">CSS keyframe 기반 애니메이션 라이브러리</p>
      <button
        onClick={() => setReplay((r) => r + 1)}
        className="mb-6 px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover cursor-pointer"
      >
        전체 다시 재생
      </button>

      <div className="grid grid-cols-3 gap-4" key={replay}>
        {Object.entries(animationClass).map(([name, cls]) => (
          <div
            key={name}
            className="border border-border rounded-xl p-4 bg-white flex flex-col items-center gap-3"
          >
            <div className={`w-12 h-12 bg-primary rounded-lg ${cls}`} />
            <div className="text-center">
              <div className="text-xs font-semibold text-foreground">{name}</div>
              <code className="text-[10px] font-mono text-muted">{cls}</code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
