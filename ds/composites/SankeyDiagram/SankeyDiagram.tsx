"use client";
import { forwardRef, useMemo } from "react";
import { cn } from "../../utils/cn";
import { Slot, Slottable } from "../../utils/Slot";
import type { HTMLAttributes } from "react";

export interface SankeyNode {
  /** 노드 ID */
  id: string;
  /** 표시 라벨 */
  label?: string;
  /** 컬럼 인덱스 (0=좌측). 미설정 시 자동 토폴로지 정렬 */
  column?: number;
  /** 색상 */
  color?: string;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

export interface SankeyDiagramProps extends HTMLAttributes<HTMLDivElement> {
  /** 노드 */
  nodes: SankeyNode[];
  /** 링크 (source/target은 node id) */
  links: SankeyLink[];
  /** 너비 */
  width?: number;
  /** 높이 */
  height?: number;
  /** 노드 폭 */
  nodeWidth?: number;
  /** 노드 사이 간격 */
  nodeGap?: number;
  /** root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) */
  asChild?: boolean;
}

const DEFAULT_COLORS = [
  "var(--primary)",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
];

interface ResolvedNode extends SankeyNode {
  column: number;
  totalIn: number;
  totalOut: number;
  total: number;
  y: number;
  height: number;
}

function autoColumns(nodes: SankeyNode[], links: SankeyLink[]): Map<string, number> {
  // BFS from sources (no incoming edge)
  const incoming = new Map<string, number>();
  nodes.forEach((n) => incoming.set(n.id, 0));
  links.forEach((l) => incoming.set(l.target, (incoming.get(l.target) ?? 0) + 1));
  const cols = new Map<string, number>();
  const queue: { id: string; col: number }[] = [];
  nodes.forEach((n) => {
    if ((incoming.get(n.id) ?? 0) === 0) queue.push({ id: n.id, col: 0 });
  });
  while (queue.length) {
    const { id, col } = queue.shift()!;
    const prev = cols.get(id);
    if (prev === undefined || prev < col) cols.set(id, col);
    links.filter((l) => l.source === id).forEach((l) => queue.push({ id: l.target, col: col + 1 }));
  }
  // any unreached: column 0
  nodes.forEach((n) => {
    if (!cols.has(n.id)) cols.set(n.id, 0);
  });
  return cols;
}

/**
 * 간단한 Sankey 다이어그램 (자동 컬럼 배치 + 베지어 링크).
 * @example
 * <SankeyDiagram nodes={[{id:"A"},{id:"B"},{id:"C"}]} links={[{source:"A",target:"B",value:30},{source:"A",target:"C",value:10}]} />
 * @status stable
 * @since 2.3.0
 * @tags chart
 */
export const SankeyDiagram = forwardRef<HTMLDivElement, SankeyDiagramProps>(function SankeyDiagram(
  {
    nodes,
    links,
    width = 560,
    height = 320,
    nodeWidth = 14,
    nodeGap = 8,
    asChild,
    className,
    children,
    ...props
  },
  ref,
) {
  const { resolved, columns, linkPaths } = useMemo(() => {
    const colMap = nodes.every((n) => n.column !== undefined)
      ? new Map(nodes.map((n) => [n.id, n.column!]))
      : autoColumns(nodes, links);

    const totalsIn = new Map<string, number>();
    const totalsOut = new Map<string, number>();
    links.forEach((l) => {
      totalsOut.set(l.source, (totalsOut.get(l.source) ?? 0) + l.value);
      totalsIn.set(l.target, (totalsIn.get(l.target) ?? 0) + l.value);
    });

    const resolved: ResolvedNode[] = nodes.map((n) => {
      const ti = totalsIn.get(n.id) ?? 0;
      const to = totalsOut.get(n.id) ?? 0;
      return {
        ...n,
        column: colMap.get(n.id) ?? 0,
        totalIn: ti,
        totalOut: to,
        total: Math.max(ti, to),
        y: 0,
        height: 0,
      };
    });

    const cols: ResolvedNode[][] = [];
    resolved.forEach((n) => {
      cols[n.column] = cols[n.column] ?? [];
      cols[n.column].push(n);
    });

    // height scale
    const maxColTotal = Math.max(...cols.map((c) => c.reduce((s, n) => s + n.total, 0)));
    const scale =
      (height - (Math.max(...cols.map((c) => c.length)) - 1) * nodeGap) / Math.max(1, maxColTotal);

    cols.forEach((col) => {
      let y = 0;
      col.forEach((n) => {
        n.height = Math.max(2, n.total * scale);
        n.y = y;
        y += n.height + nodeGap;
      });
    });

    // build link paths
    const colWidth = (width - nodeWidth) / Math.max(1, cols.length - 1);
    const sourceOffsets = new Map<string, number>();
    const targetOffsets = new Map<string, number>();
    const linkPaths = links
      .map((l, li) => {
        const sourceNode = resolved.find((n) => n.id === l.source);
        const targetNode = resolved.find((n) => n.id === l.target);
        if (!sourceNode || !targetNode) return null;
        const sx = sourceNode.column * colWidth + nodeWidth;
        const tx = targetNode.column * colWidth;
        const so = sourceOffsets.get(l.source) ?? 0;
        const to = targetOffsets.get(l.target) ?? 0;
        const linkH = Math.max(1, l.value * scale);
        const sy = sourceNode.y + so + linkH / 2;
        const ty = targetNode.y + to + linkH / 2;
        sourceOffsets.set(l.source, so + linkH);
        targetOffsets.set(l.target, to + linkH);
        const cx = (sx + tx) / 2;
        const path = `M${sx},${sy} C${cx},${sy} ${cx},${ty} ${tx},${ty}`;
        const color = sourceNode.color ?? DEFAULT_COLORS[li % DEFAULT_COLORS.length];
        return {
          path,
          strokeWidth: linkH,
          color,
          source: l.source,
          target: l.target,
          value: l.value,
        };
      })
      .filter(Boolean) as {
      path: string;
      strokeWidth: number;
      color: string;
      source: string;
      target: string;
      value: number;
    }[];

    const colWidthFinal = (width - nodeWidth) / Math.max(1, cols.length - 1);
    return { resolved, columns: cols, linkPaths, colWidth: colWidthFinal };
  }, [nodes, links, width, height, nodeWidth, nodeGap]);

  const colCount = columns.length;
  const colWidth = (width - nodeWidth) / Math.max(1, colCount - 1);

  const Comp = asChild ? Slot : "div";
  return (
    <Comp ref={ref as never} className={cn("inline-block max-w-full", className)} {...props}>
      {asChild ? <Slottable>{children}</Slottable> : null}
      {/* viewBox 는 이미 있었지만 CSS 로 크기를 풀어 주지 않아 좁은 칸에서 그대로 넘쳤다. */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="block h-auto max-w-full"
        role="img"
        aria-label="Sankey 다이어그램"
      >
        {/* links first so nodes overlap */}
        {linkPaths.map((l, i) => (
          <path
            key={i}
            d={l.path}
            stroke={l.color}
            strokeWidth={l.strokeWidth}
            fill="none"
            strokeOpacity={0.35}
          >
            <title>
              {l.source} → {l.target}: {l.value}
            </title>
          </path>
        ))}
        {resolved.map((n, i) => {
          const x = n.column * colWidth;
          const color = n.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
          const isLast = n.column === colCount - 1;
          return (
            <g key={n.id}>
              <rect x={x} y={n.y} width={nodeWidth} height={n.height} fill={color} rx={2}>
                <title>
                  {n.label ?? n.id}: {n.total}
                </title>
              </rect>
              <text
                x={isLast ? x - 4 : x + nodeWidth + 4}
                y={n.y + n.height / 2 + 3}
                fontSize="11"
                textAnchor={isLast ? "end" : "start"}
                className="fill-foreground"
              >
                {n.label ?? n.id}
              </text>
            </g>
          );
        })}
      </svg>
    </Comp>
  );
});
