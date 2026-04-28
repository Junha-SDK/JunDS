"use client";
import { useMemo } from "react";
import { cn } from "../../utils/cn";

export interface DiffViewerProps {
  oldText: string;
  newText: string;
  oldTitle?: string;
  newTitle?: string;
  className?: string;
}

interface DiffLine { type: "same" | "add" | "remove"; content: string; oldNum?: number; newNum?: number; }

function computeDiff(oldLines: string[], newLines: string[]): DiffLine[] {
  const result: DiffLine[] = [];
  let oi = 0, ni = 0;
  while (oi < oldLines.length || ni < newLines.length) {
    if (oi < oldLines.length && ni < newLines.length && oldLines[oi] === newLines[ni]) {
      result.push({ type: "same", content: oldLines[oi], oldNum: oi + 1, newNum: ni + 1 });
      oi++; ni++;
    } else if (oi < oldLines.length && (ni >= newLines.length || !newLines.includes(oldLines[oi]))) {
      result.push({ type: "remove", content: oldLines[oi], oldNum: oi + 1 });
      oi++;
    } else {
      result.push({ type: "add", content: newLines[ni], newNum: ni + 1 });
      ni++;
    }
  }
  return result;
}

const lineColors = { same: "", add: "bg-success/10 text-success", remove: "bg-danger/10 text-danger" };
const linePrefix = { same: " ", add: "+", remove: "-" };

export function DiffViewer({ oldText, newText, oldTitle, newTitle, className }: DiffViewerProps) {
  const diff = useMemo(() => computeDiff(oldText.split("\n"), newText.split("\n")), [oldText, newText]);

  return (
    <div className={cn("rounded-xl border border-border overflow-hidden text-sm font-mono", className)}>
      {(oldTitle || newTitle) && (
        <div className="flex border-b border-border bg-gray-50 text-xs text-muted">
          {oldTitle && <div className="flex-1 px-3 py-2 border-r border-border">{oldTitle}</div>}
          {newTitle && <div className="flex-1 px-3 py-2">{newTitle}</div>}
        </div>
      )}
      <div className="overflow-x-auto">
        {diff.map((line, i) => (
          <div key={i} className={cn("flex", lineColors[line.type])}>
            <span className="w-10 shrink-0 text-right pr-2 text-[10px] text-gray-400 select-none border-r border-border">{line.oldNum ?? ""}</span>
            <span className="w-10 shrink-0 text-right pr-2 text-[10px] text-gray-400 select-none border-r border-border">{line.newNum ?? ""}</span>
            <span className="w-5 shrink-0 text-center text-xs font-bold select-none">{linePrefix[line.type]}</span>
            <span className="flex-1 px-2 whitespace-pre">{line.content}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
