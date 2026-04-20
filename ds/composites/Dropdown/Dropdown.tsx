"use client";
import { useState, useRef, type ReactNode } from "react";
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
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false), open);

  return (
    <div ref={ref} className={cn("relative inline-block", className)}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            "absolute z-50 mt-1 min-w-[160px] bg-white border border-border rounded-lg shadow-lg py-1 animate-fade-in-scale",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {items.map((item) =>
            item.divider ? (
              <div key={item.key} className="h-px bg-border my-1" />
            ) : (
              <button
                key={item.key}
                type="button"
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
            ),
          )}
        </div>
      )}
    </div>
  );
}
