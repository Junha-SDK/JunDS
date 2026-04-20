"use client";

import { useMemo, useState, useCallback } from "react";
import { cn } from "@/ds/utils/cn";
import { Portal } from "@/ds/primitives/Portal";
import { useLab } from "../_lib/lab-store";
import { generateCode } from "../_lib/code-generator";

interface CodeExporterProps {
  onClose: () => void;
}

export function CodeExporter({ onClose }: CodeExporterProps) {
  const { state } = useLab();
  const [copied, setCopied] = useState(false);

  const generated = useMemo(() => generateCode(state), [state]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(generated.full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generated.full]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([generated.full], { type: "text/tsx" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "LabPreview.tsx";
    a.click();
    URL.revokeObjectURL(url);
  }, [generated.full]);

  return (
    <Portal>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="relative w-full max-w-2xl max-h-[80vh] mx-4 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                코드 내보내기
              </h2>
              <p className="text-[11px] text-gray-400 mt-0.5">
                캔버스의 컴포넌트를 React 코드로 변환합니다
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Code */}
          <div className="flex-1 overflow-auto">
            <pre className="bg-gray-900 text-gray-100 px-5 py-4 text-xs font-mono leading-relaxed whitespace-pre-wrap">
              <code>{generated.full}</code>
            </pre>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={handleDownload}
              className="h-8 px-4 text-xs font-medium text-gray-700 border border-gray-200 rounded-md bg-white hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              다운로드 (.tsx)
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                "h-8 px-4 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5",
                copied
                  ? "bg-green-500 text-white"
                  : "bg-blue-500 text-white hover:bg-blue-600",
              )}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {copied ? (
                  <polyline points="20 6 9 17 4 12" />
                ) : (
                  <>
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </>
                )}
              </svg>
              {copied ? "복사됨!" : "복사"}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
