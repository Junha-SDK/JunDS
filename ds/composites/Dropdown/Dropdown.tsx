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
  trigger: ReactNode;
  items: DropdownItem[];
  onSelect: (key: string) => void;
  align?: "left" | "right";
  className?: string;
}

/**
 * 드롭다운 메뉴
 * @example
 * <Dropdown trigger={<IconButton icon={<MoreIcon />} label="메뉴" />} items={[...]} onSelect={handleAction} />
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
        onClick={() => { setOpen(!open); setFocusIndex(-1); }}
        role="button"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {trigger}
      </div>
      {open && (
        <div
          role="menu"
          className={cn(
            "absolute z-50 mt-1 min-w-[160px] bg-white border border-border rounded-lg shadow-lg py-1 animate-fade-in-scale",
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
                ref={(el) => { itemRefs.current[idx] = el; }}
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
                  "w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left transition-colors cursor-pointer",
                  item.danger
                    ? "text-danger hover:bg-danger-light"
                    : "text-foreground hover:bg-gray-50",
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
