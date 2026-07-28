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
      {/* bg-gray-900 은 의도적인 어두운 코드 크롬이다 — 라이트/다크 양쪽에서 같은 색을
          유지해야 코드가 문서 본문과 구분된다. 토큰으로 옮기지 않는다 */}
      <pre
        className={cn(
          "bg-gray-900 text-gray-100 rounded-xl p-4 pr-16 text-xs font-mono",
          "overflow-x-auto overscroll-x-contain leading-relaxed",
        )}
      >
        <code>{code}</code>
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "코드가 복사되었습니다" : "코드 복사"}
        className={cn(
          "absolute top-2 right-2 px-2 py-1 text-[10px] rounded-lg cursor-pointer",
          // transition-all 은 padding·radius 까지 대상으로 삼는다 — 실제로 바뀌는
          // 색과 scale 만 지목해 매 프레임 리플로우를 없앤다
          "transition-[background-color,color,transform] duration-200 active:scale-95",
          // 어두운 코드 크롬 위라 primary 링은 묻힌다 — 흰 링 + 크롬과 같은 offset
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
          copied ? "bg-success text-white" : "bg-white/10 text-white/70 hover:bg-white/20",
        )}
      >
        {copied ? "✓ 복사됨" : "복사"}
      </button>
    </div>
  );
}
