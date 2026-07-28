"use client";
import { useState, useRef } from "react";
import { cn } from "../../utils/cn";
import { useClickOutside } from "../../hooks/useClickOutside";
import { Portal } from "../../primitives/Portal";

const DEFAULT_PRESETS = [
  "#000000",
  "#374151",
  "#6B7280",
  "#9CA3AF",
  "#D1D5DB",
  "#FFFFFF",
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#EAB308",
  "#84CC16",
  "#22C55E",
  "#14B8A6",
  "#06B6D4",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#A855F7",
  "#D946EF",
  "#EC4899",
  "#F43F5E",
  "#78716C",
  "#0EA5E9",
  "#10B981",
];

export interface ColorPickerProps {
  /** 선택된 HEX 색상 */
  value: string;
  /** 색상 변경 콜백 */
  onChange: (color: string) => void;
  /** 프리셋 색상 배열 */
  presets?: string[];
  /** HEX 입력 필드 표시 여부 */
  showInput?: boolean;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 색상 선택기
 * @example
 * <ColorPicker value={color} onChange={setColor} showInput />
 * @status stable
 * @since 2.2.0
 * @tags form, input
 */
export function ColorPicker({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  showInput = true,
  disabled,
  className,
}: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useClickOutside(ref, () => setOpen(false), open);

  const handleOpen = () => {
    if (disabled) return;
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const popupWidth = 220;
      const popupHeight = 200;
      const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));
      const left = clamp(rect.left, 8, window.innerWidth - popupWidth - 8);
      const top = clamp(rect.bottom + 4, 8, window.innerHeight - popupHeight - 8);
      setPos({ top, left });
    }
    setInputValue(value);
    setOpen(!open);
  };

  const handleSelect = (color: string) => {
    onChange(color);
    setInputValue(color);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setInputValue(v);
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
      onChange(v);
    }
  };

  const handleInputBlur = () => {
    if (/^#[0-9A-Fa-f]{6}$/.test(inputValue)) {
      onChange(inputValue);
    } else {
      setInputValue(value);
    }
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        className={cn(
          // transition-all 은 h-9·px-3 까지 전이 대상으로 삼아 매 프레임 리플로우를 만든다.
          // 실제로 변하는 것은 테두리색과 글로우뿐이라 그 둘만 지목한다.
          "flex items-center gap-2 h-9 px-3 border bg-card rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[border-color,box-shadow] duration-200 ease-out cursor-pointer",
          "focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_var(--primary-glow),0_1px_2px_rgba(0,0,0,0.04)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          open
            ? "border-primary shadow-[0_0_0_3px_var(--primary-glow),0_1px_2px_rgba(0,0,0,0.04)]"
            : "border-border hover:border-muted-light",
        )}
      >
        <span
          className="w-5 h-5 rounded-md shrink-0 ring-1 ring-black/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)]"
          style={{ backgroundColor: value }}
        />
        <span className="text-sm text-foreground">{value}</span>
      </button>

      {open && (
        <Portal>
          <div
            ref={ref}
            // 떠 있는 패널이라 한 겹 shadow-xl 로는 배경에서 떠오르지 않는다 —
            // 근거리·원거리 두 겹 + 얇은 링으로 세운다.
            className="fixed z-50 bg-card border border-border rounded-xl p-3 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.35),0_4px_12px_-4px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.06] animate-fade-in-scale motion-reduce:animate-none"
            style={{ top: pos.top, left: pos.left }}
          >
            <div className="grid grid-cols-6 gap-1.5 mb-2">
              {presets.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleSelect(color)}
                  className={cn(
                    // 확대/축소가 있으므로 감속 요청을 받는다. ring 은 box-shadow 로 그려지니 둘만 전이한다.
                    "w-7 h-7 rounded-lg ring-1 ring-inset ring-black/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.35)] transition-[transform,box-shadow] duration-150 cursor-pointer hover:scale-110 active:scale-95 motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                    value === color &&
                      "ring-2 ring-primary ring-offset-2 ring-offset-card scale-105",
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>

            {showInput && (
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <span
                  className="w-7 h-7 rounded-lg shrink-0 ring-1 ring-inset ring-black/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.35)]"
                  style={{ backgroundColor: value }}
                />
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  placeholder="#000000"
                  maxLength={7}
                  className="flex-1 h-7 px-2 text-sm border border-border rounded-lg bg-card tabular-nums transition-[border-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_var(--primary-glow)] min-w-0"
                />
              </div>
            )}
          </div>
        </Portal>
      )}
    </div>
  );
}
