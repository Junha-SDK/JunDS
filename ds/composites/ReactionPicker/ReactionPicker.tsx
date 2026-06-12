"use client";
import { forwardRef, useState, useRef, useEffect } from "react";
import { cn } from "../../utils/cn";

export interface ReactionPickerProps {
  /** 사용 가능한 이모지 (기본 6종) */
  emojis?: string[];
  /** 선택된 이모지 (단일 선택형) */
  value?: string | null;
  /** 변경 콜백 */
  onChange?: (emoji: string | null) => void;
  /** 트리거 라벨 (없으면 + 아이콘) */
  triggerLabel?: string;
  /** 위치 */
  placement?: "top" | "bottom";
  /** 추가 클래스 */
  className?: string;
}

const defaultEmojis = ["❤️", "🔥", "👍", "😂", "😮", "😢"];

/**
 * 리액션 피커 — 트리거 클릭 시 이모지 바, 단일 선택 토글.
 * @example
 * <ReactionPicker value={r} onChange={setR} />
 * @status stable
 * @since 2.4.0
 * @tags sns, control
 */
export const ReactionPicker = forwardRef<HTMLDivElement, ReactionPickerProps>(
  ({ emojis = defaultEmojis, value, onChange, triggerLabel, placement = "top", className }, ref) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!open) return;
      const handler = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const choose = (e: string) => {
      onChange?.(value === e ? null : e);
      setOpen(false);
    };

    return (
      <div ref={ref ?? containerRef} className={cn("relative inline-block", className)}>
        <div ref={containerRef}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label={value ? `현재 리액션 ${value}, 변경` : "리액션 추가"}
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm transition-colors cursor-pointer",
              "border border-border hover:bg-surface-soft",
              value && "bg-primary/10 border-primary/30",
            )}
          >
            <span aria-hidden="true">{value ?? "+"}</span>
            {triggerLabel && <span className="text-xs">{triggerLabel}</span>}
          </button>

          {open && (
            <div
              role="menu"
              className={cn(
                "absolute z-20 flex items-center gap-0.5 rounded-full bg-surface border border-border shadow-md p-1",
                placement === "top" ? "bottom-full mb-1" : "top-full mt-1",
                "left-0",
              )}
            >
              {emojis.map((e) => (
                <button
                  key={e}
                  type="button"
                  role="menuitemradio"
                  aria-checked={value === e}
                  onClick={() => choose(e)}
                  className={cn(
                    "w-8 h-8 inline-flex items-center justify-center rounded-full text-lg cursor-pointer transition-transform hover:scale-125",
                    value === e && "bg-primary/15 ring-2 ring-primary/40",
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  },
);
ReactionPicker.displayName = "ReactionPicker";
