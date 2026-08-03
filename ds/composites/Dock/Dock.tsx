"use client";
import { useRef, useState, useCallback } from "react";
import { cn } from "../../utils/cn";
import { createCompound } from "../../utils/createCompound";
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
 */
function DockRoot({ children, magnification = 1.6, className }: DockProps) {
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
        // 유리판은 유지하되 바탕색은 표면 토큰에서 가져온다. bg-white/70 은 다크에서
        // 흰 판이 되어 도크만 홀로 떠 버렸다. inset 하이라이트는 두 모드 모두에서 광택으로 읽힌다.
        "inline-flex items-end gap-1 px-3 py-2 bg-card/70 backdrop-blur-xl border border-border-light rounded-2xl",
        "shadow-[0_12px_32px_-8px_rgba(0,0,0,0.25),0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.35)] ring-1 ring-black/[0.03]",
        className,
      )}
      role="toolbar"
      aria-label="Dock"
      style={
        {
          "--dock-mouse-x": mouseX !== null ? `${mouseX}px` : "unset",
          "--dock-mag": magnification,
        } as React.CSSProperties
      }
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
        // 라벨이 absolute -top-8 로 붙는데 기준이 될 positioned 조상이 없었다 —
        // relative 가 없으면 툴팁이 엉뚱한 곳에 뜬다.
        "relative flex flex-col items-center gap-0.5 origin-bottom cursor-pointer group rounded-xl",
        "transition-transform duration-150 motion-reduce:transition-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      style={{ transform: `scale(${scale})` }}
      aria-label={label}
    >
      <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-b from-card to-border-light border border-black/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.35)] group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.35)] transition-shadow duration-200">
        {children}
      </div>
      {label && scale > 1.2 && (
        <span
          className="absolute -top-8 px-2 py-1 text-[10px] font-medium bg-foreground text-background rounded-lg shadow-[0_6px_16px_-4px_rgba(0,0,0,0.3),0_2px_4px_-2px_rgba(0,0,0,0.2)] ring-1 ring-white/10 whitespace-nowrap animate-fade-in motion-reduce:animate-none"
          aria-hidden="true"
        >
          {label}
        </span>
      )}
    </button>
  );
}

DockRoot.displayName = "Dock";

/**
 * Dock 컴포넌트
 * @status stable
 * @since 2.2.0
 * @tags navigation
 */
export const Dock = createCompound(DockRoot, {
  Item: DockItem,
});
