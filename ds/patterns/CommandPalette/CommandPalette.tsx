"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { cn } from "../../utils/cn";
import { Portal } from "../../primitives/Portal";
import { Kbd } from "../../primitives/Kbd";
import { useKeyboard } from "../../hooks/useKeyboard";
import type { ReactNode } from "react";

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  group?: string;
  action: () => void;
  keywords?: string[];
}

export interface CommandPaletteProps {
  /** 명령어 항목 목록 */
  items: CommandItem[];
  /** 검색 입력 플레이스홀더 */
  placeholder?: string;
  /** 외부 open 제어 */
  open?: boolean;
  /** 열림 상태 변경 콜백 */
  onOpenChange?: (open: boolean) => void;
}

/**
 * 커맨드 팔레트 (⌘K)
 * @example
 * <CommandPalette items={[{id:"1",label:"설정",action:()=>router.push("/settings")}]} />
 * @status stable
 * @since 2.2.0
 * @tags overlay, navigation
 */
export function CommandPalette({ items, placeholder = "검색 또는 명령어 입력...", open: controlledOpen, onOpenChange }: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const isOpen = controlledOpen ?? internalOpen;
  const setOpen = (v: boolean) => {
    setInternalOpen(v);
    onOpenChange?.(v);
  };

  useKeyboard({ key: "k", meta: true }, () => setOpen(!isOpen));

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.keywords?.some((k) => k.toLowerCase().includes(q)),
    );
  }, [items, search]);

  const groups = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    filtered.forEach((item) => {
      const group = item.group || "";
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(item);
    });
    return map;
  }, [filtered]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[activeIdx]) {
      filtered[activeIdx].action();
      setOpen(false);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  if (!isOpen) return null;

  let flatIdx = -1;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
        <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setOpen(false)} />
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-fade-in-scale overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border-light">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-muted shrink-0">
              <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setActiveIdx(0); }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted-light"
            />
            <Kbd keys={["ESC"]} />
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[320px] overflow-y-auto py-1">
            {filtered.length === 0 && (
              <div className="py-8 text-center text-sm text-muted">결과 없음</div>
            )}
            {Array.from(groups.entries()).map(([group, groupItems]) => (
              <div key={group}>
                {group && (
                  <div className="px-4 py-1.5 text-[10px] font-semibold text-muted-light uppercase tracking-wider">
                    {group}
                  </div>
                )}
                {groupItems.map((item) => {
                  flatIdx++;
                  const idx = flatIdx;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { item.action(); setOpen(false); }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2 text-left transition-colors cursor-pointer",
                        idx === activeIdx ? "bg-primary-light text-primary" : "hover:bg-gray-50",
                      )}
                    >
                      {item.icon && <span className="shrink-0 w-5 h-5 flex items-center justify-center text-muted">{item.icon}</span>}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{item.label}</div>
                        {item.description && <div className="text-xs text-muted truncate">{item.description}</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 px-4 py-2 border-t border-border-light text-[10px] text-muted-light">
            <span className="flex items-center gap-1"><Kbd keys={["↑"]} /><Kbd keys={["↓"]} /> 이동</span>
            <span className="flex items-center gap-1"><Kbd keys={["↵"]} /> 실행</span>
          </div>
        </div>
      </div>
    </Portal>
  );
}
