"use client";
import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { cn } from "@/ds/utils/cn";
import { breakpoints } from "@/ds/tokens/breakpoints";

const PRESETS: { label: string; width: number | null }[] = [
  { label: "360", width: 360 },
  { label: "sm", width: breakpoints.sm },
  { label: "md", width: breakpoints.md },
  { label: "lg", width: breakpoints.lg },
  { label: "전체", width: null },
];

const MIN_WIDTH = 280;

function bpOf(width: number): string {
  if (width >= breakpoints["2xl"]) return "2xl";
  if (width >= breakpoints.xl) return "xl";
  if (width >= breakpoints.lg) return "lg";
  if (width >= breakpoints.md) return "md";
  if (width >= breakpoints.sm) return "sm";
  return "xs";
}

/**
 * 폭을 자유롭게 바꿔가며 레이아웃을 관찰하는 프레임.
 * 오른쪽 핸들 드래그(또는 핸들 포커스 후 ←/→)와 프리셋 칩으로 프레임 폭을 조절한다.
 * 컨테이너 폭 기준으로 동작하는 레이아웃(Switcher·Wrap·SimpleGrid minChildWidth …)의
 * 접힘을 브라우저 창을 줄이지 않고 그대로 볼 수 있다.
 */
export function ResizableFrame({
  children,
  defaultWidth = null,
  note,
}: {
  children: ReactNode;
  /** 초기 프레임 폭(px). null이면 전체 폭 */
  defaultWidth?: number | null;
  /** 프레임 아래 표시할 짧은 안내 문구 */
  note?: string;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [avail, setAvail] = useState<number>(0);
  const [width, setWidth] = useState<number | null>(defaultWidth);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; w: number } | null>(null);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const update = () => setAvail(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const effective = width === null ? avail : Math.max(MIN_WIDTH, Math.min(width, avail || width));

  const clamp = useCallback(
    (w: number) => Math.max(MIN_WIDTH, Math.min(w, avail || w)),
    [avail],
  );

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    dragStart.current = { x: e.clientX, w: effective };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragStart.current) return;
    setWidth(clamp(dragStart.current.w + (e.clientX - dragStart.current.x)));
  };
  const onPointerUp = () => {
    dragStart.current = null;
    setDragging(false);
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    setWidth(clamp(effective + (e.key === "ArrowRight" ? 20 : -20)));
  };

  return (
    <div ref={outerRef}>
      {/* ── 툴바: 프리셋 + 현재 폭 ── */}
      <div className="flex items-center flex-wrap gap-1.5 mb-2">
        {PRESETS.map((p) => {
          const active = width === p.width;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => setWidth(p.width)}
              aria-pressed={active}
              className={cn(
                "px-2 py-0.5 rounded-lg text-[10px] font-medium border cursor-pointer",
                "transition-[background-color,border-color,color] duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
                "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active
                  ? "bg-primary/10 text-primary-ink border-primary/30"
                  : "bg-card text-muted border-border hover:text-primary-ink hover:border-primary/30",
              )}
            >
              {p.label}
            </button>
          );
        })}
        <span className="ml-auto text-[10px] font-mono text-muted tabular-nums" aria-live="polite">
          {Math.round(effective)}px · {bpOf(effective)}
        </span>
      </div>

      {/* ── 프레임 + 드래그 핸들 ── */}
      <div className="flex items-stretch">
        <div
          className={cn(
            "border border-dashed border-border rounded-xl bg-card p-4 min-w-0 overflow-hidden",
            // 드래그 중에는 transition이 손을 따라오지 못해 덜컹거린다
            !dragging && "transition-[width] duration-200",
          )}
          style={{ width: width === null ? "100%" : effective }}
        >
          {children}
        </div>
        <button
          type="button"
          aria-label="미리보기 폭 조절 — 방향키로 20px씩"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onKeyDown={onKeyDown}
          className={cn(
            "shrink-0 w-3 ml-1 rounded-lg cursor-ew-resize touch-none flex items-center justify-center",
            "transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
            dragging ? "bg-primary/20" : "bg-border-light hover:bg-primary/10",
          )}
        >
          <span aria-hidden className="w-0.5 h-6 rounded-full bg-muted/60" />
        </button>
      </div>

      {note && <p className="mt-2 text-[11px] text-muted">{note}</p>}
    </div>
  );
}
