"use client";
import { useState } from "react";
import { cn } from "@/ds/utils/cn";

export function CodeBlock({ code, language = "tsx" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre className={cn(
        "bg-gray-900 text-gray-100 rounded-xl p-4 pr-16 text-xs font-mono overflow-x-auto",
        "leading-relaxed",
      )}>
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        aria-label={copied ? "코드가 복사되었습니다" : "코드 복사"}
        className={cn(
          "absolute top-2 right-2 px-2 py-1 text-[10px] rounded-md cursor-pointer",
          "transition-all duration-200 active:scale-95",
          copied
            ? "bg-success text-white"
            : "bg-white/10 text-white/70 hover:bg-white/20",
        )}
      >
        {copied ? "✓ 복사됨" : "복사"}
      </button>
    </div>
  );
}
