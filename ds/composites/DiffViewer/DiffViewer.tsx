"use client";
import { useMemo } from "react";
import { cn } from "../../utils/cn";

export interface DiffViewerProps {
  /** 이전 텍스트 */
  oldText: string;
  /** 새 텍스트 */
  newText: string;
  /** 이전 제목 라벨 */
  oldTitle?: string;
  /** 새 제목 라벨 */
  newTitle?: string;
  /** 추가 클래스 */
  className?: string;
}

interface DiffLine {
  type: "same" | "add" | "remove";
  content: string;
  oldNum?: number;
  newNum?: number;
}

function computeDiff(oldLines: string[], newLines: string[]): DiffLine[] {
  const result: DiffLine[] = [];
  let oi = 0,
    ni = 0;
  while (oi < oldLines.length || ni < newLines.length) {
    if (oi < oldLines.length && ni < newLines.length && oldLines[oi] === newLines[ni]) {
      result.push({ type: "same", content: oldLines[oi], oldNum: oi + 1, newNum: ni + 1 });
      oi++;
      ni++;
    } else if (
      oi < oldLines.length &&
      (ni >= newLines.length || !newLines.includes(oldLines[oi]))
    ) {
      result.push({ type: "remove", content: oldLines[oi], oldNum: oi + 1 });
      oi++;
    } else {
      result.push({ type: "add", content: newLines[ni], newNum: ni + 1 });
      ni++;
    }
  }
  return result;
}

const lineColors = {
  same: "",
  add: "bg-success/10 text-success",
  remove: "bg-danger/10 text-danger",
};
const linePrefix = { same: " ", add: "+", remove: "-" };

/**
 * 두 텍스트 간 차이를 강조 표시하는 diff 뷰어.
 * @example
 * <DiffViewer oldText={prev} newText={next} oldTitle="v1" newTitle="v2" />
 * @status stable
 * @since 2.2.0
 * @tags data-display
 */
export function DiffViewer({ oldText, newText, oldTitle, newTitle, className }: DiffViewerProps) {
  const diff = useMemo(
    () => computeDiff(oldText.split("\n"), newText.split("\n")),
    [oldText, newText],
  );

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card overflow-hidden text-sm font-mono",
        className,
      )}
    >
      {(oldTitle || newTitle) && (
        // bg-gray-50 은 라이트 전용이라 다크에서 밝은 띠가 남는다 — background 토큰이 두 모드를 다 따라간다
        <div className="flex border-b border-border bg-background text-xs text-muted">
          {oldTitle && (
            <div className="flex-1 min-w-0 truncate px-3 py-2 border-r border-border">
              {oldTitle}
            </div>
          )}
          {newTitle && <div className="flex-1 min-w-0 truncate px-3 py-2">{newTitle}</div>}
        </div>
      )}
      {/* 긴 줄이 페이지를 밀지 않게 가로 스크롤은 이 상자 안에서 끝낸다 */}
      <div className="overflow-x-auto overscroll-x-contain">
        {diff.map((line, i) => (
          <div key={i} className={cn("flex", lineColors[line.type])}>
            <span className="w-10 shrink-0 text-right pr-2 text-[10px] tabular-nums text-muted-light select-none border-r border-border">
              {line.oldNum ?? ""}
            </span>
            <span className="w-10 shrink-0 text-right pr-2 text-[10px] tabular-nums text-muted-light select-none border-r border-border">
              {line.newNum ?? ""}
            </span>
            <span className="w-5 shrink-0 text-center text-xs font-bold select-none">
              {linePrefix[line.type]}
            </span>
            <span className="flex-1 px-2 whitespace-pre">{line.content}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
