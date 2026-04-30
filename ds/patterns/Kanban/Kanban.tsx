"use client";
import { useState, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { Badge } from "../../primitives/Badge";

export interface KanbanItem {
  id: string;
  [key: string]: unknown;
}

export interface KanbanColumn<T extends KanbanItem> {
  id: string;
  title: string;
  color?: string;
  items: T[];
}

export interface KanbanProps<T extends KanbanItem> {
  /** 컬럼 목록 */
  columns: KanbanColumn<T>[];
  /** 카드 렌더 */
  renderCard: (item: T, columnId: string) => ReactNode;
  /** 드래그 완료 콜백 */
  onMove?: (itemId: string, fromColumn: string, toColumn: string) => void;
  /** 컬럼 헤더 커스텀 */
  renderColumnHeader?: (column: KanbanColumn<T>) => ReactNode;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 칸반 보드 (가벼운 버전 — 네이티브 드래그)
 * @example
 * <Kanban
 *   columns={[{id:"todo",title:"할 일",items:[...]},{id:"doing",title:"진행 중",items:[...]}]}
 *   renderCard={(item) => <TaskCard task={item} />}
 *   onMove={handleMove}
 * />
 * @status stable
 * @since 2.2.0
 * @tags data
 */
export function Kanban<T extends KanbanItem>({
  columns,
  renderCard,
  onMove,
  renderColumnHeader,
  className,
}: KanbanProps<T>) {
  const [dragItem, setDragItem] = useState<{ id: string; from: string } | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const handleDragStart = (itemId: string, columnId: string) => {
    setDragItem({ id: itemId, from: columnId });
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOver(columnId);
  };

  const handleDrop = (columnId: string) => {
    if (dragItem && dragItem.from !== columnId) {
      onMove?.(dragItem.id, dragItem.from, columnId);
    }
    setDragItem(null);
    setDragOver(null);
  };

  return (
    <div className={cn("flex gap-4 overflow-x-auto pb-4", className)}>
      {columns.map((col) => (
        <div
          key={col.id}
          className={cn(
            "flex flex-col w-72 shrink-0 rounded-xl bg-gray-50/80 border border-border/50",
            dragOver === col.id && "ring-2 ring-primary/30 bg-primary-light/20",
          )}
          onDragOver={(e) => handleDragOver(e, col.id)}
          onDragLeave={() => setDragOver(null)}
          onDrop={() => handleDrop(col.id)}
        >
          {/* Column Header */}
          {renderColumnHeader ? (
            renderColumnHeader(col)
          ) : (
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/50">
              {col.color && <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: col.color }} />}
              <span className="text-sm font-semibold text-foreground">{col.title}</span>
              <Badge variant="default" size="sm">{col.items.length}</Badge>
            </div>
          )}

          {/* Cards */}
          <div className="flex flex-col gap-2 p-2 flex-1 min-h-[100px]">
            {col.items.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item.id, col.id)}
                onDragEnd={() => { setDragItem(null); setDragOver(null); }}
                className={cn(
                  "cursor-grab active:cursor-grabbing",
                  dragItem?.id === item.id && "opacity-40",
                )}
              >
                {renderCard(item, col.id)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
