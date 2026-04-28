"use client";
import { useMemo } from "react";
import { cn } from "../../utils/cn";

export interface TreemapItem {
  label: string;
  value: number;
  color?: string;
}

export interface TreemapChartProps {
  data: TreemapItem[];
  width?: number;
  height?: number;
  className?: string;
}

const COLORS = ["var(--primary)", "var(--info)", "var(--success)", "var(--warning)", "var(--danger)", "var(--accent)"];

interface Rect { x: number; y: number; w: number; h: number; item: TreemapItem; }

function squarify(items: TreemapItem[], x: number, y: number, w: number, h: number): Rect[] {
  if (items.length === 0) return [];
  const total = items.reduce((s, d) => s + d.value, 0);
  const rects: Rect[] = [];
  let cx = x, cy = y, cw = w, ch = h;

  items.forEach((item) => {
    const ratio = item.value / total;
    if (cw >= ch) {
      const rw = cw * ratio;
      rects.push({ x: cx, y: cy, w: Math.max(rw, 1), h: ch, item });
      cx += rw;
      cw -= rw;
    } else {
      const rh = ch * ratio;
      rects.push({ x: cx, y: cy, w: cw, h: Math.max(rh, 1), item });
      cy += rh;
      ch -= rh;
    }
  });
  return rects;
}

export function TreemapChart({ data, width = 400, height = 250, className }: TreemapChartProps) {
  const sorted = useMemo(() => [...data].sort((a, b) => b.value - a.value), [data]);
  const rects = useMemo(() => squarify(sorted, 0, 0, width, height), [sorted, width, height]);

  return (
    <svg width={width} height={height} className={cn(className)}>
      {rects.map((r, i) => (
        <g key={i}>
          <rect x={r.x} y={r.y} width={r.w} height={r.h} fill={r.item.color ?? COLORS[i % COLORS.length]} rx={4} stroke="white" strokeWidth={2} opacity={0.85} />
          {r.w > 40 && r.h > 20 && (
            <>
              <text x={r.x + r.w / 2} y={r.y + r.h / 2 - 4} textAnchor="middle" fill="white" fontSize={11} fontWeight={600}>{r.item.label}</text>
              <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 10} textAnchor="middle" fill="white" fontSize={9} opacity={0.8}>{r.item.value.toLocaleString()}</text>
            </>
          )}
        </g>
      ))}
    </svg>
  );
}
