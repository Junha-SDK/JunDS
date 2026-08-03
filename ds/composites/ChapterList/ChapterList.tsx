"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface Chapter {
  id: string;
  title: string;
  page?: number;
  durationMinutes?: number;
  subChapters?: Chapter[];
  locked?: boolean;
}

export interface ChapterListProps {
  chapters: Chapter[];
  activeId?: string;
  completedIds?: ReadonlyArray<string> | Set<string>;
  onSelect?: (chapter: Chapter) => void;
  className?: string;
}

function isCompleted(set: ChapterListProps["completedIds"], id: string) {
  if (!set) return false;
  if (set instanceof Set) return set.has(id);
  return set.includes(id);
}

function ChapterRow({
  chapter,
  depth,
  activeId,
  completedIds,
  onSelect,
}: {
  chapter: Chapter;
  depth: number;
  activeId?: string;
  completedIds?: ChapterListProps["completedIds"];
  onSelect?: ChapterListProps["onSelect"];
}) {
  const active = chapter.id === activeId;
  const done = isCompleted(completedIds, chapter.id);
  return (
    <li>
      <button
        type="button"
        onClick={() => !chapter.locked && onSelect?.(chapter)}
        disabled={chapter.locked}
        aria-current={active ? "true" : undefined}
        className={cn(
          "w-full flex items-center justify-between gap-3 py-2 pr-3 text-left text-sm rounded-lg transition-colors duration-150",
          "hover:bg-surface-soft disabled:opacity-50 disabled:cursor-not-allowed",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          active && "bg-primary/10 text-primary-ink font-semibold",
          !active && done && "text-muted",
        )}
        style={{ paddingLeft: 8 + depth * 16 }}
      >
        <span className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              "shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold",
              active
                ? "bg-primary text-white"
                : done
                ? "bg-success/20 text-success"
                : // 회색 팔레트 + dark: 짝 대신 muted 를 옅게 — 두 모드 모두 변수를 따라간다
                  "bg-muted/15 text-muted",
            )}
          >
            {done ? "✓" : chapter.locked ? "🔒" : ""}
          </span>
          <span className="truncate">{chapter.title}</span>
        </span>
        <span className="shrink-0 text-[11px] text-muted tabular-nums">
          {chapter.page !== undefined && <span>p.{chapter.page}</span>}
          {chapter.page !== undefined && chapter.durationMinutes !== undefined && " · "}
          {chapter.durationMinutes !== undefined && <span>{chapter.durationMinutes}분</span>}
        </span>
      </button>
      {chapter.subChapters && chapter.subChapters.length > 0 && (
        <ul className="mt-0.5">
          {chapter.subChapters.map((sub) => (
            <ChapterRow
              key={sub.id}
              chapter={sub}
              depth={depth + 1}
              activeId={activeId}
              completedIds={completedIds}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * 챕터 목차 — 활성/완독/잠금 + 트리.
 * @example
 * <ChapterList chapters={data} activeId="ch-3" completedIds={["ch-1","ch-2"]} onSelect={goTo} />
 * @status stable
 * @since 2.4.0
 * @tags book, navigation
 */
export const ChapterList = forwardRef<HTMLElement, ChapterListProps>(
  ({ chapters, activeId, completedIds, onSelect, className }, ref) => (
    <nav ref={ref} aria-label="목차" className={cn("text-sm", className)}>
      <ul>
        {chapters.map((c) => (
          <ChapterRow
            key={c.id}
            chapter={c}
            depth={0}
            activeId={activeId}
            completedIds={completedIds}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </nav>
  ),
);
ChapterList.displayName = "ChapterList";
