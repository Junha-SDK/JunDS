"use client";
import { useState } from "react";
import { cn } from "../../utils/cn";

export interface JSONViewerProps {
  /** 표시할 JSON 데이터 */
  data: unknown;
  /** 초기 펼침 상태 */
  initialExpanded?: boolean;
  /** 추가 클래스 */
  className?: string;
}

function JSONNode({
  name,
  value,
  depth = 0,
  expanded: init = true,
}: {
  name?: string;
  value: unknown;
  depth?: number;
  expanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(init && depth < 2);
  const isObject = value !== null && typeof value === "object";
  const isArray = Array.isArray(value);
  const entries = isObject ? Object.entries(value as Record<string, unknown>) : [];

  const typeColor =
    typeof value === "string"
      ? "text-success"
      : typeof value === "number"
      ? "text-primary-ink"
      : typeof value === "boolean"
      ? "text-warning"
      : value === null
      ? "text-danger"
      : "text-foreground";

  if (!isObject) {
    return (
      <div className="flex" style={{ paddingLeft: depth * 16 }}>
        {name !== undefined && <span className="text-primary-ink/70">{name}: </span>}
        <span className={typeColor}>
          {typeof value === "string" ? `"${value}"` : String(value)}
        </span>
      </div>
    );
  }

  return (
    <div style={{ paddingLeft: depth * 16 }}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className={cn(
          "inline-flex items-center gap-1 cursor-pointer rounded-md px-1 -ml-1 transition-colors duration-150",
          "hover:bg-white/10",
          // 어두운 코드 크롬 위라 초점 링도 흰 계열이어야 보인다
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
        )}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          className={cn(
            "shrink-0 transition-transform duration-150 motion-reduce:transition-none",
            expanded && "rotate-90",
          )}
        >
          <path d="M3 2l4 3-4 3z" fill="currentColor" />
        </svg>
        {name !== undefined && <span className="text-primary-ink/70">{name}: </span>}
        <span className="text-muted">
          {isArray ? `[${entries.length}]` : `{${entries.length}}`}
        </span>
      </button>
      {expanded &&
        entries.map(([k, v]) => (
          <JSONNode
            key={k}
            name={isArray ? undefined : k}
            value={v}
            depth={depth + 1}
            expanded={init}
          />
        ))}
    </div>
  );
}

/**
 * JSON 데이터를 트리 구조로 펼쳐서 보여주는 뷰어.
 * @example
 * <JSONViewer data={response} initialExpanded />
 * @status stable
 * @since 2.2.0
 * @tags data-display
 */
export function JSONViewer({ data, initialExpanded = true, className }: JSONViewerProps) {
  return (
    <div
      // 코드 뷰어는 라이트/다크와 무관하게 어두운 크롬이다. Tailwind 회색 리터럴로
      // 칠하는 대신 이 영역만 다크 팔레트로 전환해, 안쪽 text-muted·경계선까지
      // 전부 다크 값으로 따라오게 한다 (라이트 모드에서 muted 가 안 보이던 문제)
      data-theme="dark"
      className={cn(
        "p-3 rounded-xl border border-border bg-background text-foreground text-xs font-mono",
        "overflow-auto overscroll-contain ring-1 ring-white/10",
        className,
      )}
    >
      <JSONNode value={data} expanded={initialExpanded} />
    </div>
  );
}
