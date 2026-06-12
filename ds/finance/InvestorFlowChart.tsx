"use client";

import { useMemo } from "react";
import type { DayFlow } from "./lib/investorFlow";

export { buildFlow } from "./lib/investorFlow";

interface InvestorFlowChartProps {
  data: DayFlow[];
  width?: number;
  height?: number;
}

export function InvestorFlowChart({ data, width = 800, height = 240 }: InvestorFlowChartProps) {
  const padL = 38;
  const padR = 8;
  const padT = 14;
  const padB = 24;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const slot = innerW / data.length;
  const barW = Math.max(2, slot * 0.78 / 3);

  const { min, max } = useMemo(() => {
    let mn = 0;
    let mx = 0;
    for (const d of data) {
      mn = Math.min(mn, d.foreign, d.institution, d.individual);
      mx = Math.max(mx, d.foreign, d.institution, d.individual);
    }
    return { min: mn, max: mx };
  }, [data]);

  const range = max - min || 1;
  const yOf = (v: number) => padT + ((max - v) / range) * innerH;

  const ticks: number[] = [];
  const step = niceStep(range / 4);
  let t = Math.ceil(min / step) * step;
  while (t <= max) {
    ticks.push(t);
    t += step;
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="bm-num"
      style={{ display: "block", maxWidth: "100%" }}
    >
      {ticks.map((tv) => (
        <g key={tv}>
          <line
            x1={padL}
            x2={width - padR}
            y1={yOf(tv)}
            y2={yOf(tv)}
            stroke="var(--bm-grid)"
          />
          <text
            x={padL - 4}
            y={yOf(tv) + 3}
            fontSize={10}
            fill="var(--bm-axis)"
            textAnchor="end"
          >
            {Math.round(tv)}
          </text>
        </g>
      ))}
      <line
        x1={padL}
        x2={width - padR}
        y1={yOf(0)}
        y2={yOf(0)}
        stroke="var(--bm-axis)"
      />
      {data.map((d, i) => {
        const cx = padL + i * slot + slot / 2;
        return (
          <g key={d.date}>
            <Bar
              x={cx - barW * 1.6}
              barW={barW}
              v={d.foreign}
              y0={yOf(0)}
              y={yOf(d.foreign)}
              colorPos="var(--bm-up)"
              colorNeg="var(--bm-down)"
            />
            <Bar
              x={cx - barW * 0.5}
              barW={barW}
              v={d.institution}
              y0={yOf(0)}
              y={yOf(d.institution)}
              colorPos="#a855f7"
              colorNeg="#0ea5e9"
            />
            <Bar
              x={cx + barW * 0.6}
              barW={barW}
              v={d.individual}
              y0={yOf(0)}
              y={yOf(d.individual)}
              colorPos="var(--bm-warning)"
              colorNeg="#64748b"
            />
            {i % Math.ceil(data.length / 8) === 0 ? (
              <text
                x={cx}
                y={height - 6}
                fontSize={10}
                fill="var(--bm-axis)"
                textAnchor="middle"
              >
                {d.date}
              </text>
            ) : null}
          </g>
        );
      })}
      <g transform={`translate(${padL}, 0)`}>
        <Legend label="외국인" color="var(--bm-up)" x={0} />
        <Legend label="기관" color="#a855f7" x={64} />
        <Legend label="개인" color="var(--bm-warning)" x={120} />
      </g>
    </svg>
  );
}

function Bar({
  x,
  barW,
  v,
  y0,
  y,
  colorPos,
  colorNeg,
}: {
  x: number;
  barW: number;
  v: number;
  y0: number;
  y: number;
  colorPos: string;
  colorNeg: string;
}) {
  const top = Math.min(y0, y);
  const h = Math.max(1, Math.abs(y - y0));
  return <rect x={x} y={top} width={barW} height={h} rx={1.5} fill={v >= 0 ? colorPos : colorNeg} />;
}

function Legend({ label, color, x }: { label: string; color: string; x: number }) {
  return (
    <g transform={`translate(${x}, 0)`}>
      <rect x={0} y={0} width={9} height={9} rx={2} fill={color} />
      <text x={13} y={8} fontSize={10.5} fontWeight={700} fill="var(--bm-text)">
        {label}
      </text>
    </g>
  );
}

function niceStep(raw: number): number {
  const exp = Math.pow(10, Math.floor(Math.log10(Math.max(0.1, raw))));
  const f = raw / exp;
  let nf: number;
  if (f < 1.5) nf = 1;
  else if (f < 3) nf = 2;
  else if (f < 7) nf = 5;
  else nf = 10;
  return nf * exp;
}
