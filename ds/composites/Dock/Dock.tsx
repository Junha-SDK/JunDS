"use client";
import { useRef, useState, useCallback } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface DockProps {
  /** 도크 아이템 (DockItem) */
  children: ReactNode;
  /** 호버 시 확대 배율 */
  magnification?: number;
  /** 추가 클래스 */
  className?: string;
}

export interface DockItemProps {
  /** 도크 아이템 (DockItem) */
  children: ReactNode;
  label?: string;
  onClick?: () => void;
  /** 추가 클래스 */
  className?: string;
}

/**
 * macOS 스타일의 마우스 오버 시 확대되는 독.
 * @example
 * <Dock magnification={1.4}>
 *   <DockItem icon={<HomeIcon />} />
 *   <DockItem icon={<SearchIcon />} />
 * </Dock>
 * @status stable
 * @since 2.2.0
 * @tags navigation
 */
export function Dock({ children, magnification = 1.6, className }: DockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mouseX, setMouseX] = useState<number | null>(null);

  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setMouseX(e.clientX - rect.left);
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => setMouseX(null)}
      className={cn(
        "inline-flex items-end gap-1 px-3 py-2 bg-white/80 backdrop-blur-xl border border-border rounded-2xl shadow-lg",
        className,
      )}
      role="toolbar"
      aria-label="Dock"
      style={{ "--dock-mouse-x": mouseX !== null ? `${mouseX}px` : "unset", "--dock-mag": magnification } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

function DockItem({ children, label, onClick, className }: DockItemProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [scale, setScale] = useState(1);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    const distance = Math.abs(e.clientX - center);
    const maxDist = 120;
    const mag = Number(getComputedStyle(ref.current).getPropertyValue("--dock-mag")) || 1.6;
    const s = Math.max(1, mag - (distance / maxDist) * (mag - 1));
    setScale(s);
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setScale(1)}
      className={cn(
        "flex flex-col items-center gap-0.5 transition-transform duration-150 origin-bottom cursor-pointer group",
        className,
      )}
      style={{ transform: `scale(${scale})` }}
      aria-label={label}
    >
      <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-b from-gray-100 to-gray-50 border border-border shadow-sm group-hover:shadow-md transition-shadow">
        {children}
      </div>
      {label && scale > 1.2 && (
        <span className="absolute -top-7 px-2 py-0.5 text-[10px] bg-foreground text-white rounded-md whitespace-nowrap animate-fade-in" aria-hidden="true">
          {label}
        </span>
      )}
    </button>
  );
}

Dock.Item = DockItem;
