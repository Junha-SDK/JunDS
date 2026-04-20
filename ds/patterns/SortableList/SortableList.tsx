"use client";
import { useState, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface SortableItem {
  id: string;
  [key: string]: unknown;
}

export interface SortableListProps<T extends SortableItem> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  onReorder: (items: T[]) => void;
  /** 드래그 핸들 표시 */
  showHandle?: boolean;
  className?: string;
}

/**
 * 드래그 앤 드롭 정렬 리스트 (네이티브 API)
 * @example
 * <SortableList items={tasks} renderItem={(t)=><div>{t.name}</div>} onReorder={setTasks} showHandle />
 */
export function SortableList<T extends SortableItem>({
  items,
  renderItem,
  onReorder,
  showHandle,
  className,
}: SortableListProps<T>) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setOverIdx(idx);
  };
  const handleDrop = (idx: number) => {
    if (dragIdx === null || dragIdx === idx) return;
    const next = [...items];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(idx, 0, moved);
    onReorder(next);
    setDragIdx(null);
    setOverIdx(null);
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {items.map((item, i) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => handleDragStart(i)}
          onDragOver={(e) => handleDragOver(e, i)}
          onDrop={() => handleDrop(i)}
          onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
          className={cn(
            "flex items-center gap-2 transition-all",
            dragIdx === i && "opacity-40",
            overIdx === i && dragIdx !== i && "border-t-2 border-primary",
          )}
        >
          {showHandle && (
            <span className="cursor-grab active:cursor-grabbing text-muted hover:text-foreground shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="5" cy="3" r="1" fill="currentColor" /><circle cx="9" cy="3" r="1" fill="currentColor" />
                <circle cx="5" cy="7" r="1" fill="currentColor" /><circle cx="9" cy="7" r="1" fill="currentColor" />
                <circle cx="5" cy="11" r="1" fill="currentColor" /><circle cx="9" cy="11" r="1" fill="currentColor" />
              </svg>
            </span>
          )}
          <div className="flex-1 min-w-0">{renderItem(item, i)}</div>
        </div>
      ))}
    </div>
  );
}
