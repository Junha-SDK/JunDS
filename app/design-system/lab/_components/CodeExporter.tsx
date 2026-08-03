"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/ds/utils/cn";
import { useLab } from "../_lib/store";
import { generateCode } from "../_lib/code-generator";

export function CodeExporter({ onClose }: { onClose: () => void }) {
  const { state } = useLab();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  const code = useMemo(() => generateCode(state), [state]);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* Copy to clipboard */
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback */
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  /* Download as .tsx */
  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: "text/tsx;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Page.tsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [code]);

  /* Close on Escape */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  /* Close on backdrop click */
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === backdropRef.current) onClose();
    },
    [onClose],
  );

  if (!mounted) return null;

  return createPortal(
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-black/50 backdrop-blur-sm",
      )}
    >
      <div
        className={cn(
          "w-full max-w-2xl max-h-[80vh] mx-4 flex flex-col",
          "bg-[#1a1726] rounded-xl border border-[#2a2744] shadow-2xl overflow-hidden",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2744]">
          <h3 className="text-sm font-semibold text-white/90">생성된 코드</h3>
          <div className="flex items-center gap-2">
            {/* Copy */}
            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                "text-xs font-medium px-3 py-1.5 rounded-lg transition-colors",
                copied
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-white/10 text-white/70 hover:text-white hover:bg-white/15",
              )}
            >
              {copied ? "복사됨!" : "복사"}
            </button>
            {/* Download */}
            <button
              type="button"
              onClick={handleDownload}
              className={cn(
                "text-xs font-medium px-3 py-1.5 rounded-lg",
                "bg-white/10 text-white/70 hover:text-white hover:bg-white/15",
                "transition-colors",
              )}
            >
              다운로드
            </button>
            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "p-1.5 rounded-lg",
                "text-white/50 hover:text-white hover:bg-white/10",
                "transition-colors",
              )}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Code body */}
        <div className="flex-1 overflow-auto p-4">
          <pre className="text-xs leading-relaxed font-mono text-emerald-300/90 whitespace-pre-wrap break-words">
            {code}
          </pre>
        </div>
      </div>
    </div>,
    document.body,
  );
}
