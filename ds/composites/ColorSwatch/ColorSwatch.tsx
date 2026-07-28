"use client";
import { useState, useCallback } from "react";
import { cn } from "../../utils/cn";

export interface ColorSwatchProps {
  /** 표시할 색상 목록 */
  colors: string[];
  /** 선택된 색상 */
  selected?: string;
  /** 색상 선택 콜백 */
  onSelect?: (color: string) => void;
  /** 스와치 크기 */
  size?: "sm" | "md" | "lg";
  /** 선택된 색상의 HEX 라벨 표시 여부 */
  showLabel?: boolean;
  /** 추가 클래스 */
  className?: string;
}

const sizes = { sm: "w-6 h-6", md: "w-8 h-8", lg: "w-10 h-10" };

/**
 * 색상 팔레트에서 색을 선택하는 스와치.
 * @example
 * <ColorSwatch colors={["#f00", "#0f0", "#00f"]} selected={color} onSelect={setColor} />
 * @status stable
 * @since 2.2.0
 * @tags data-display
 */
export function ColorSwatch({
  colors,
  selected,
  onSelect,
  size = "md",
  showLabel,
  className,
}: ColorSwatchProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleClick = useCallback(
    (color: string) => {
      onSelect?.(color);
      navigator.clipboard.writeText(color);
      setCopied(color);
      setTimeout(() => setCopied(null), 1500);
    },
    [onSelect],
  );

  return (
    <div className={cn("flex flex-wrap gap-2", className)} role="listbox" aria-label="색상 팔레트">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => handleClick(color)}
          className={cn(
            // 스와치 자체가 색이라 링만이 유일한 포커스 신호다 — 배경색 오프셋으로 어떤 색 위에서도 보이게 한다
            "rounded-lg border-2 cursor-pointer",
            "transition-[transform,border-color,box-shadow] duration-200 ease-out motion-reduce:transition-none",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            sizes[size],
            selected === color
              ? "border-primary scale-110 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.25),0_1px_3px_rgba(0,0,0,0.12)]"
              : "border-transparent hover:scale-105",
          )}
          style={{ backgroundColor: color }}
          role="option"
          aria-selected={selected === color}
          aria-label={color}
          title={copied === color ? "복사됨!" : color}
        />
      ))}
      {showLabel && selected && (
        <span className="flex items-center text-xs text-muted font-mono ml-1">{selected}</span>
      )}
    </div>
  );
}
