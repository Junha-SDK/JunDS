"use client";
import { useState, useCallback } from "react";
import { cn } from "../../utils/cn";

export interface ColorSwatchProps {
  colors: string[];
  selected?: string;
  onSelect?: (color: string) => void;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const sizes = { sm: "w-6 h-6", md: "w-8 h-8", lg: "w-10 h-10" };

export function ColorSwatch({ colors, selected, onSelect, size = "md", showLabel, className }: ColorSwatchProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleClick = useCallback((color: string) => {
    onSelect?.(color);
    navigator.clipboard.writeText(color);
    setCopied(color);
    setTimeout(() => setCopied(null), 1500);
  }, [onSelect]);

  return (
    <div className={cn("flex flex-wrap gap-2", className)} role="listbox" aria-label="색상 팔레트">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => handleClick(color)}
          className={cn(
            "rounded-lg border-2 transition-all cursor-pointer",
            sizes[size],
            selected === color ? "border-primary scale-110 shadow-md" : "border-transparent hover:scale-105",
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
