"use client";

import { useState, useCallback } from "react";
import { cn } from "@/ds/utils/cn";
import { Portal } from "@/ds/primitives/Portal";
import { useLab } from "../_lib/lab-store";
import { generateCode } from "../_lib/code-generator";

/* ------------------------------------------------------------------ */
/*  CodeExporter modal                                                 */
/* ------------------------------------------------------------------ */

type TabId = "component" | "tokens";

export function CodeExporter({ onClose }: { onClose: () => void }) {
  const { state } = useLab();
  const generated = generateCode(state);

  const hasTokns = generated.tokens.length > 0;
  const [activeTab, setActiveTab] = useState<TabId>("component");
  const [copied, setCopied] = useState<TabId | null>(null);

  const currentCode =
    activeTab === "component" ? generated.full : generated.tokens;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(activeTab);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // fallback
    }
  }, [currentCode, activeTab]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([generated.full], { type: "text/tsx" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${state.templateId}-layout.tsx`;
    a.click();
    URL.revokeObjectURL(url);
  }, [generated.full, state.templateId]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  return (
    <Portal>
      {/* Backdrop */}
      <div
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        {/* Modal */}
        <div className="relative w-full max-w-3xl max-h-[80vh] mx-4 flex flex-col rounded-lg border border-border bg-gray-900 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <h3 className="text-sm font-semibold text-gray-100">
              코드 내보내기
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:text-gray-100 hover:bg-gray-700 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-0.5 px-4 pt-2 border-b border-gray-700">
            <button
              type="button"
              onClick={() => setActiveTab("component")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-t transition-colors",
                activeTab === "component"
                  ? "bg-gray-800 text-gray-100 border border-b-0 border-gray-700"
                  : "text-gray-400 hover:text-gray-200",
              )}
            >
              컴포넌트
            </button>
            {hasTokns && (
              <button
                type="button"
                onClick={() => setActiveTab("tokens")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-t transition-colors",
                  activeTab === "tokens"
                    ? "bg-gray-800 text-gray-100 border border-b-0 border-gray-700"
                    : "text-gray-400 hover:text-gray-200",
                )}
              >
                토큰
              </button>
            )}
          </div>

          {/* Code area */}
          <div className="flex-1 overflow-auto p-4">
            <pre className="text-[13px] leading-relaxed text-gray-100 font-mono whitespace-pre-wrap">
              {currentCode}
            </pre>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-700">
            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors",
                copied === activeTab
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-gray-200 hover:bg-gray-600",
              )}
            >
              {copied === activeTab ? "복사됨!" : "복사"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
            >
              .tsx 다운로드
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
