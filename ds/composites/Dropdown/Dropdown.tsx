"use client";
import { useState, useRef, useCallback, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { useClickOutside } from "../../hooks/useClickOutside";

export interface DropdownItem {
  key: string;
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
}

export interface DropdownProps {
  /** 트리거 요소 */
  trigger: ReactNode;
  /** 메뉴 항목 목록 */
  items: DropdownItem[];
  /** 항목 선택 콜백 */
  onSelect: (key: string) => void;
  /** 정렬 방향 */
  align?: "left" | "right";
  /** 추가 클래스 */
  className?: string;
}

/**
 * 드롭다운 메뉴
 * @example
 * <Dropdown trigger={<IconButton icon={<MoreIcon />} label="메뉴" />} items={[...]} onSelect={handleAction} />
 * @status stable
 * @since 2.2.0
 * @tags overlay, navigation
 */
export function Dropdown({ trigger, items, onSelect, align = "right", className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useClickOutside(ref, () => setOpen(false), open);

  const actionableItems = items.filter((i) => !i.divider);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) return;
      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          const next = focusIndex < actionableItems.length - 1 ? focusIndex + 1 : 0;
          setFocusIndex(next);
          itemRefs.current[next]?.focus();
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const prev = focusIndex > 0 ? focusIndex - 1 : actionableItems.length - 1;
          setFocusIndex(prev);
          itemRefs.current[prev]?.focus();
          break;
        }
        case "Enter": {
          e.preventDefault();
          const item = actionableItems[focusIndex];
          if (item && !item.disabled) {
            onSelect(item.key);
            setOpen(false);
          }
          break;
        }
        case "Escape":
          e.preventDefault();
          setOpen(false);
          break;
      }
    },
    [open, focusIndex, actionableItems, onSelect],
  );

  let actionIdx = -1;

  return (
    <div ref={ref} className={cn("relative inline-block", className)} onKeyDown={handleKeyDown}>
      <div
        onClick={() => {
          setOpen(!open);
          setFocusIndex(-1);
        }}
        role="button"
        tabIndex={0}
        aria-haspopup="true"
        aria-expanded={open}
        // tabIndex 가 붙어 실제로 포커스를 받는 래퍼다 — 여기에 링이 없으면 키보드로 왔을 때 아무 표시가 없다.
        className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {trigger}
      </div>
      {open && (
        <div
          role="menu"
          className={cn(
            "absolute z-50 mt-1 min-w-[160px] bg-card border border-border rounded-xl p-1",
            // 떠 있는 메뉴 — 한 겹 그림자로는 카드 위에서 떠 보이지 않는다.
            "shadow-[0_10px_30px_-8px_rgba(0,0,0,0.35),0_4px_10px_-4px_rgba(0,0,0,0.2)] ring-1 ring-black/5",
            "animate-fade-in-scale motion-reduce:animate-none",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {items.map((item) => {
            if (item.divider) {
              return <div key={item.key} className="h-px bg-border my-1" role="separator" />;
            }
            actionIdx++;
            const idx = actionIdx;
            return (
              <button
                key={item.key}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled) {
                    onSelect(item.key);
                    setOpen(false);
                  }
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm text-left transition-colors cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset",
                  item.danger
                    ? "text-danger hover:bg-danger/10 focus-visible:bg-danger/10 focus-visible:ring-danger/55"
                    : "text-foreground hover:bg-primary/10 focus-visible:bg-primary/10 focus-visible:ring-primary/55",
                  item.disabled && "opacity-40 cursor-not-allowed",
                )}
              >
                {item.icon && <span className="shrink-0 w-4 h-4">{item.icon}</span>}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
