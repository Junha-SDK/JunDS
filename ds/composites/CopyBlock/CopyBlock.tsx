"use client";
import { useState, useCallback } from "react";
import { cn } from "../../utils/cn";

export interface CopyBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export function CopyBlock({ code, language, showLineNumbers = false, className }: CopyBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const lines = code.split("\n");

  return (
    <div className={cn("relative group rounded-xl overflow-hidden border border-border", className)}>
      {language && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-border">
          <span className="text-xs font-medium text-muted uppercase tracking-wider">{language}</span>
        </div>
      )}
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed bg-gray-950 text-gray-100">
        <code>
          {lines.map((line, i) => (
            <div key={i} className="flex">
              {showLineNumbers && (
                <span className="select-none text-gray-500 w-8 shrink-0 text-right mr-4">{i + 1}</span>
              )}
              <span>{line}</span>
            </div>
          ))}
        </code>
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          "absolute top-2 right-2 p-2 rounded-lg transition-all cursor-pointer",
          "opacity-0 group-hover:opacity-100",
          copied
            ? "bg-success text-white"
            : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white",
        )}
        aria-label={copied ? "복사됨" : "코드 복사"}
      >
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="4.5" y="4.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><path d="M9.5 4.5V3a1.5 1.5 0 00-1.5-1.5H3A1.5 1.5 0 001.5 3v5A1.5 1.5 0 003 9.5h1.5" stroke="currentColor" strokeWidth="1.5" /></svg>
        )}
      </button>
    </div>
  );
}
