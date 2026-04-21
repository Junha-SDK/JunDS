"use client";
import { useState, useRef } from "react";
import { cn } from "../../utils/cn";
import { useClickOutside } from "../../hooks/useClickOutside";
import { Portal } from "../../primitives/Portal";

const DEFAULT_PRESETS = [
  "#000000", "#374151", "#6B7280", "#9CA3AF", "#D1D5DB", "#FFFFFF",
  "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16", "#22C55E",
  "#14B8A6", "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6", "#A855F7",
  "#D946EF", "#EC4899", "#F43F5E", "#78716C", "#0EA5E9", "#10B981",
];

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  /** 프리셋 색상 배열 */
  presets?: string[];
  /** HEX 입력 필드 표시 여부 */
  showInput?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * 색상 선택기
 * @example
 * <ColorPicker value={color} onChange={setColor} showInput />
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
          "flex items-center gap-2 h-9 px-3 border bg-card rounded-lg transition-all duration-150 cursor-pointer",
          "focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-glow)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          open ? "border-primary shadow-[0_0_0_3px_var(--primary-glow)]" : "border-border",
        )}
      >
        <span
          className="w-5 h-5 rounded border border-border shrink-0"
          style={{ backgroundColor: value }}
        />
        <span className="text-sm text-foreground">{value}</span>
      </button>

      {open && (
        <Portal>
          <div
            ref={ref}
            className="fixed z-50 bg-card border border-border rounded-lg shadow-lg p-3 animate-fade-in-scale"
            style={{ top: pos.top, left: pos.left }}
          >
            <div className="grid grid-cols-6 gap-1.5 mb-2">
              {presets.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleSelect(color)}
                  className={cn(
                    "w-7 h-7 rounded-md border transition-all duration-100 cursor-pointer hover:scale-110",
                    value === color ? "border-primary ring-2 ring-primary/30" : "border-border",
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>

            {showInput && (
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <span
                  className="w-7 h-7 rounded-md border border-border shrink-0"
                  style={{ backgroundColor: value }}
                />
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  placeholder="#000000"
                  maxLength={7}
                  className="flex-1 h-7 px-2 text-sm border border-border rounded-md bg-card focus:outline-none focus:border-primary min-w-0"
                />
              </div>
            )}
          </div>
        </Portal>
      )}
    </div>
  );
}
