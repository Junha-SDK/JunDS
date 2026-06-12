"use client";

import { useMemo } from "react";
import { heatmapColor as pctColor } from "./lib/heatmapColor";
import { useLivePrice } from "./lib/livePrices";

export interface HeatmapCell {
  name: string;
  ticker?: string;
  /** Market cap or weight used for sizing */
  size: number;
  /** % change used for color */
  change: number;
  price?: number;
  group?: string;
}

interface MarketHeatmapProps {
  data: HeatmapCell[];
  width?: number;
  height?: number;
  /** Group cells with their group label as a header strip */
  groups?: { name: string; cells: HeatmapCell[] }[];
  onCellClick?: (cell: HeatmapCell) => void;
  className?: string;
  /** % change scale used for color saturation. Default 6 — Korean ±30% daily limit */
  scale?: number;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface PlacedCell extends HeatmapCell {
  rect: Rect;
}

// Squarified treemap: Bruls/Huijing/van Wijk
function squarify(items: HeatmapCell[], rect: Rect): PlacedCell[] {
  const placed: PlacedCell[] = [];
  const total = items.reduce((s, x) => s + Math.max(0.0001, x.size), 0);
  if (total <= 0 || items.length === 0) return placed;

  const sorted = [...items].sort((a, b) => b.size - a.size);
  let pool = sorted.map((it) => ({
    item: it,
    area: (Math.max(0.0001, it.size) / total) * rect.w * rect.h,
  }));
  let area = rect;

  while (pool.length > 0) {
    const row: typeof pool = [];
    const shorter = Math.min(area.w, area.h);
    const horizontal = area.w >= area.h;
    let bestRatio = Infinity;
    let i = 0;
    for (; i < pool.length; i++) {
      row.push(pool[i]);
      const ratio = worstRatio(row, shorter);
      if (ratio > bestRatio) {
        row.pop();
        i--;
        break;
      }
      bestRatio = ratio;
    }
    const consumed = row.reduce((s, r) => s + r.area, 0);
    const longer = consumed / shorter;
    let cursor = 0;
    for (const r of row) {
      const len = (r.area / consumed) * shorter;
      const cellRect = horizontal
        ? { x: area.x, y: area.y + cursor, w: longer, h: len }
        : { x: area.x + cursor, y: area.y, w: len, h: longer };
      placed.push({ ...r.item, rect: cellRect });
      cursor += len;
    }
    if (horizontal) {
      area = { x: area.x + longer, y: area.y, w: area.w - longer, h: area.h };
    } else {
      area = { x: area.x, y: area.y + longer, w: area.w, h: area.h - longer };
    }
    pool = pool.slice(row.length);
    if (area.w <= 0 || area.h <= 0) break;
  }
  return placed;
}

function worstRatio(row: { area: number }[], shorter: number): number {
  if (row.length === 0) return Infinity;
  const sum = row.reduce((s, r) => s + r.area, 0);
  let max = 0;
  let min = Infinity;
  for (const r of row) {
    if (r.area > max) max = r.area;
    if (r.area < min) min = r.area;
  }
  const sumSq = sum * sum;
  const shorterSq = shorter * shorter;
  return Math.max((shorterSq * max) / sumSq, sumSq / (shorterSq * min));
}

export function MarketHeatmap({
  data,
  width = 380,
  height = 540,
  groups,
  onCellClick,
  className,
  scale = 6,
}: MarketHeatmapProps) {
  const cells = useMemo(() => {
    if (groups && groups.length > 0) {
      const totals = groups.map((g) => ({
        ...g,
        sum: g.cells.reduce((s, c) => s + c.size, 0),
      }));
      const grandTotal = totals.reduce((s, g) => s + g.sum, 0) || 1;
      void grandTotal;
      const groupRects = squarify(
        totals.map((g) => ({
          name: g.name,
          size: g.sum,
          change: 0,
        })),
        { x: 0, y: 0, w: width, h: height },
      );
      const placed: { group: string; placed: PlacedCell[] }[] = [];
      for (const gr of groupRects) {
        const grp = groups.find((g) => g.name === gr.name);
        if (!grp) continue;
        const headerH = Math.min(20, gr.rect.h * 0.16);
        const innerRect: Rect = {
          x: gr.rect.x,
          y: gr.rect.y + headerH,
          w: gr.rect.w,
          h: Math.max(0, gr.rect.h - headerH),
        };
        const inner = squarify(grp.cells, innerRect);
        placed.push({ group: grp.name, placed: inner });
      }
      return { mode: "groups" as const, groupRects, placed };
    }
    return {
      mode: "flat" as const,
      placed: squarify(data, { x: 0, y: 0, w: width, h: height }),
    };
  }, [data, width, height, groups]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ display: "block", maxWidth: "100%" }}
    >
      {/* Self-contained dark backdrop so the chart looks consistent in light/dark themes */}
      <rect x={0} y={0} width={width} height={height} fill="#0b1220" />
      {cells.mode === "groups" ? (
        <>
          {cells.groupRects.map((gr, i) => {
            const headerH = Math.min(20, gr.rect.h * 0.16);
            const charW = 7.5;
            const maxChars = Math.max(2, Math.floor((gr.rect.w - 12) / charW));
            const label =
              gr.name.length > maxChars ? `${gr.name.slice(0, maxChars - 1)}…` : gr.name;
            return (
              <g key={`g-${gr.name}-${i}`}>
                <rect
                  x={gr.rect.x}
                  y={gr.rect.y}
                  width={gr.rect.w}
                  height={headerH}
                  fill="rgba(11,18,32,0.96)"
                />
                <rect
                  x={gr.rect.x}
                  y={gr.rect.y + headerH - 1}
                  width={gr.rect.w}
                  height={1}
                  fill="rgba(255,255,255,0.06)"
                />
                <text
                  x={gr.rect.x + 8}
                  y={gr.rect.y + headerH / 2 + 1}
                  fontSize={11}
                  fill="rgba(226,232,240,0.95)"
                  fontWeight={800}
                  dominantBaseline="middle"
                  letterSpacing={0.2}
                >
                  {label}
                </text>
              </g>
            );
          })}
          {cells.placed.flatMap((g) =>
            g.placed.map((c, i) => (
              <Cell
                key={`${g.group}-${c.name}-${i}`}
                cell={c}
                onClick={onCellClick}
                scale={scale}
              />
            )),
          )}
        </>
      ) : (
        cells.placed.map((c, i) => (
          <Cell
            key={`${c.name}-${i}`}
            cell={c}
            onClick={onCellClick}
            scale={scale}
          />
        ))
      )}
    </svg>
  );
}

function Cell({
  cell,
  onClick,
  scale = 6,
}: {
  cell: PlacedCell;
  onClick?: (c: HeatmapCell) => void;
  scale?: number;
}) {
  const { rect } = cell;
  // KIS 시드된 시뮬레이터에서 실시간 가격/등락률 덮어쓰기 (mock 폴백)
  const { price: livePrice, change: liveChange } = useLivePrice(cell.name);
  const change = liveChange !== 0 ? liveChange : cell.change;
  const price = livePrice > 0 ? livePrice : cell.price;
  const fill = pctColor(change, scale);
  const showLabel = rect.w > 26 && rect.h > 16;
  const showName = rect.w > 44 && rect.h > 24;
  const showSubtext = rect.w > 52 && rect.h > 38;
  const showPrice = rect.w > 78 && rect.h > 58;
  const sign = change > 0 ? "+" : "";

  // Truncate name to fit width when very narrow
  const baseFont = Math.max(8.5, Math.min(rect.w * 0.13, rect.h * 0.24, 19));
  const charW = baseFont * 0.62;
  const maxChars = Math.max(1, Math.floor((rect.w - 8) / charW));
  const labelText = (cell.ticker ?? cell.name).slice(0, maxChars);

  // Light text glow improves legibility on saturated reds/blues
  const textShadow = "drop-shadow(0 1px 1.5px rgba(0,0,0,0.55))";

  return (
    <g
      onClick={onClick ? () => onClick(cell) : undefined}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <rect
        x={rect.x + 0.5}
        y={rect.y + 0.5}
        width={Math.max(0, rect.w - 1)}
        height={Math.max(0, rect.h - 1)}
        fill={fill}
        stroke="rgba(8,12,22,0.85)"
        strokeWidth={1}
      />
      {showName ? (
        <text
          x={rect.x + rect.w / 2}
          y={rect.y + rect.h / 2 - (showSubtext ? baseFont * 0.55 : 0)}
          fontSize={baseFont}
          fontWeight={800}
          fill="white"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ pointerEvents: "none", filter: textShadow }}
        >
          {labelText}
        </text>
      ) : showLabel ? (
        <text
          x={rect.x + rect.w / 2}
          y={rect.y + rect.h / 2}
          fontSize={Math.max(7.5, baseFont * 0.85)}
          fontWeight={800}
          fill="white"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ pointerEvents: "none", filter: textShadow }}
        >
          {labelText}
        </text>
      ) : null}
      {showSubtext ? (
        <text
          x={rect.x + rect.w / 2}
          y={rect.y + rect.h / 2 + baseFont * 0.7}
          fontSize={baseFont * 0.6}
          fontWeight={700}
          fill="rgba(255,255,255,0.95)"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ pointerEvents: "none", filter: textShadow }}
        >
          {sign}
          {change.toFixed(2)}%
        </text>
      ) : null}
      {showPrice && price ? (
        <text
          x={rect.x + rect.w / 2}
          y={rect.y + rect.h / 2 + baseFont * 1.55}
          fontSize={baseFont * 0.5}
          fill="rgba(255,255,255,0.78)"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ pointerEvents: "none" }}
        >
          {price.toLocaleString("ko-KR")}
        </text>
      ) : null}
    </g>
  );
}

export { pctColor as heatmapColor };
