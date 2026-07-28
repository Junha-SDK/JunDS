"use client";

import { useEffect } from "react";
import { AppIcon } from "./AppIcon";
import type { DailyThemeEntry } from "./lib/dailyThemes";

interface DayDetailDrawerProps {
  entry: DailyThemeEntry | null;
  onClose: () => void;
}

function fmtMoney(won: number): string {
  if (won >= 100_000_000) return `${(won / 100_000_000).toFixed(2)}억`;
  if (won >= 10_000) return `${Math.round(won / 10_000).toLocaleString("ko-KR")}만`;
  return won.toLocaleString("ko-KR");
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) || 1;
}

function generateIntradayCandles(seed: number, opens: number, pct: number, n = 30) {
  const out: { o: number; h: number; l: number; c: number }[] = [];
  let cur = opens;
  const target = opens * (1 + pct / 100);
  for (let i = 0; i < n; i++) {
    const r = ((seed * (i + 3)) % 1000) / 1000 - 0.5;
    const drift = (target - cur) / Math.max(1, n - i);
    const o = cur;
    const c = +(cur + drift + r * opens * 0.004).toFixed(2);
    const h = Math.max(o, c) + Math.abs(r) * opens * 0.003;
    const l = Math.min(o, c) - Math.abs(r) * opens * 0.003;
    out.push({ o, h, l, c });
    cur = c;
  }
  return out;
}

function intradayInvestorFlow(seed: number, n = 30) {
  const out: { foreign: number; institution: number; individual: number }[] = [];
  for (let i = 0; i < n; i++) {
    const r1 = ((seed * (i + 5)) % 1000) / 1000 - 0.5;
    const r2 = ((seed * (i + 7)) % 1000) / 1000 - 0.5;
    const r3 = ((seed * (i + 11)) % 1000) / 1000 - 0.5;
    const f = Math.round(r1 * 800);
    const inst = Math.round(r2 * 600);
    const ind = -(f + inst) + Math.round(r3 * 200);
    out.push({ foreign: f, institution: inst, individual: ind });
  }
  return out;
}

export function DayDetailDrawer({ entry, onClose }: DayDetailDrawerProps) {
  useEffect(() => {
    if (!entry) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [entry, onClose]);

  if (!entry) return null;

  const seed = hashSeed(entry.date);
  const opens = entry.kospiClose / (1 + entry.코스피변동 / 100);
  const candles = generateIntradayCandles(seed, opens, entry.코스피변동, 30);
  const flow = intradayInvestorFlow(seed, 30);
  const totalForeign = flow.reduce((s, f) => s + f.foreign, 0);
  const totalInst = flow.reduce((s, f) => s + f.institution, 0);
  const totalInd = flow.reduce((s, f) => s + f.individual, 0);

  const day = Number(entry.date.split("-")[2]);
  const month = Number(entry.date.split("-")[1]);
  const year = Number(entry.date.split("-")[0]);
  const weekdayKR = ["일", "월", "화", "수", "목", "금", "토"][entry.weekday];

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(15,23,42,0.45)" }}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`${entry.date} 상세`}
        // 시트 스크롤이 뒤 페이지로 새지 않게 가둔다. 그림자는 한 겹으로는 떠 보이지 않아 두 겹으로 세운다
        className="fixed top-0 right-0 z-50 h-full w-[480px] max-w-[95vw] overflow-y-auto overscroll-contain"
        style={{
          background: "var(--bm-card)",
          borderLeft: "1px solid var(--bm-border)",
          boxShadow: "-18px 0 44px -16px rgba(15,23,42,0.34), -6px 0 14px -8px rgba(15,23,42,0.18)",
        }}
      >
        <header
          className="sticky top-0 z-10 px-4 py-3 flex items-center gap-2"
          style={{ background: "var(--bm-card)", borderBottom: "1px solid var(--bm-border)" }}
        >
          <span
            className="bm-num font-extrabold inline-flex items-center justify-center"
            style={{
              background: entry.isToday ? "#ec4899" : "var(--bm-soft-100)",
              color: entry.isToday ? "white" : "var(--bm-text)",
              padding: "4px 10px",
              borderRadius: 999,
              fontSize: 13,
            }}
          >
            {month}/{day}
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-[15px] font-extrabold">
              {year}.{String(month).padStart(2, "0")}.{String(day).padStart(2, "0")} ({weekdayKR})
            </span>
            <span className="text-[11px] font-bold" style={{ color: "var(--bm-muted)" }}>
              {entry.isToday ? "오늘" : "영업일 상세"}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            // 누를 수 있는 것에는 hover·active·focus-visible 이 전부 있어야 한다
            className="ml-auto size-8 shrink-0 rounded-full grid place-items-center cursor-pointer transition-[filter,opacity] hover:brightness-95 active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bm-accent-strong)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bm-card)]"
            style={{ background: "var(--bm-soft-100)", color: "var(--bm-muted)" }}
            aria-label="닫기"
          >
            ✕
          </button>
        </header>

        <div className="p-4 grid grid-cols-2 gap-3">
          <Stat
            label="코스피 종가"
            value={entry.kospiClose.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}
            sub={`${entry.코스피변동 >= 0 ? "+" : ""}${entry.코스피변동.toFixed(2)}%`}
            tone={entry.코스피변동 >= 0 ? "up" : "down"}
          />
          <Stat
            label="평가금액"
            value={fmtMoney(entry.portfolio)}
            sub={`${entry.portfolio.toLocaleString("ko-KR")}원`}
          />
          <Stat
            label="거래대금 변동"
            value={`${entry.거래대금변동 >= 0 ? "+" : ""}${entry.거래대금변동.toFixed(2)}%`}
            tone={entry.거래대금변동 >= 0 ? "up" : "down"}
          />
          <Stat
            label="당일 주도 테마"
            value={entry.themes[0] ?? "—"}
            sub={entry.themes.slice(1, 3).join(" · ") || undefined}
          />
        </div>

        {entry.themes.length > 0 ? (
          <section className="px-4 pb-3">
            <SectionTitle title="테마" />
            <div className="flex flex-wrap gap-1.5">
              {entry.themes.map((t) => (
                <span
                  key={t}
                  className="text-[11px] font-extrabold rounded-full px-2.5 py-1 whitespace-nowrap"
                  // rgba(13,148,136,…) 은 --bm-accent-strong 을 손으로 베낀 값이다 —
                  // 토큰에서 섞으면 테마가 바뀌어도 칩이 따라온다 (DailyThemesCalendar 와 같은 어법)
                  style={{
                    background: "color-mix(in srgb, var(--bm-accent-strong) 12%, transparent)",
                    color: "var(--bm-accent-strong)",
                    border:
                      "1px solid color-mix(in srgb, var(--bm-accent-strong) 28%, transparent)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        <section className="px-4 pb-4">
          <SectionTitle title="코스피 일중 흐름" />
          <DayCandle candles={candles} />
        </section>

        <section className="px-4 pb-4">
          <SectionTitle title="투자자별 순매수 (당일 누적)" />
          <div className="grid grid-cols-3 gap-2">
            <NetCard label="외국인" value={totalForeign} color="var(--bm-up)" />
            <NetCard label="기관" value={totalInst} color="#a855f7" />
            <NetCard label="개인" value={totalInd} color="var(--bm-warning)" />
          </div>
          <DayFlowChart flow={flow} />
        </section>

        {entry.leaders?.length ? (
          <section className="px-4 pb-5">
            <SectionTitle title="왕관 종목" />
            <ul
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid var(--bm-border)" }}
            >
              {entry.leaders.map((l, i) => {
                const up = l.pct >= 0;
                return (
                  <li
                    key={l.name + i}
                    className="px-3 py-2 grid items-center"
                    style={{
                      gridTemplateColumns: "auto 1fr auto",
                      gap: 8,
                      borderBottom:
                        i === entry.leaders!.length - 1 ? "none" : "1px solid var(--bm-border)",
                      background: i % 2 === 0 ? "transparent" : "var(--bm-soft-100)",
                    }}
                  >
                    <AppIcon name="crown" size={14} strokeWidth={2.4} color="var(--bm-warning)" />
                    <span className="font-extrabold text-[12.5px] truncate">{l.name}</span>
                    <div className="flex flex-col items-end leading-tight">
                      <span className="bm-num font-extrabold text-[12px]">
                        {l.close.toLocaleString("ko-KR")}
                      </span>
                      <span
                        className="bm-num font-extrabold text-[10.5px]"
                        style={{ color: up ? "var(--bm-up)" : "var(--bm-down)" }}
                      >
                        {up ? "+" : ""}
                        {l.pct.toFixed(2)}%
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </aside>
    </>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div
      className="text-[11px] font-extrabold tracking-[0.05em] mb-2"
      style={{ color: "var(--bm-muted)" }}
    >
      {title}
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "up" | "down";
}) {
  const color =
    tone === "up" ? "var(--bm-up)" : tone === "down" ? "var(--bm-down)" : "var(--bm-text)";
  return (
    <div
      className="px-3 py-2 rounded-xl min-w-0"
      style={{ background: "var(--bm-soft-100)", border: "1px solid var(--bm-border)" }}
    >
      <div className="text-[10.5px] font-extrabold truncate" style={{ color: "var(--bm-muted)" }}>
        {label}
      </div>
      <div className="bm-num font-extrabold text-[14px] truncate tabular-nums" style={{ color }}>
        {value}
      </div>
      {sub ? (
        <div className="bm-num font-bold text-[10.5px] truncate tabular-nums" style={{ color }}>
          {sub}
        </div>
      ) : null}
    </div>
  );
}

function NetCard({ label, value, color }: { label: string; value: number; color: string }) {
  const up = value >= 0;
  return (
    <div
      className="px-2 py-2 rounded-xl flex flex-col items-start"
      style={{ background: "var(--bm-soft-100)", border: "1px solid var(--bm-border)" }}
    >
      <span
        className="inline-flex items-center gap-1.5 text-[10.5px] font-extrabold"
        style={{ color: "var(--bm-muted)" }}
      >
        <span className="size-2 rounded-full" style={{ background: color }} />
        {label}
      </span>
      <span
        className="bm-num font-extrabold text-[13.5px] mt-0.5 whitespace-nowrap tabular-nums"
        style={{ color: up ? "var(--bm-up)" : "var(--bm-down)" }}
      >
        {up ? "+" : ""}
        {value.toLocaleString("ko-KR")}억
      </span>
    </div>
  );
}

function DayCandle({ candles }: { candles: { o: number; h: number; l: number; c: number }[] }) {
  if (candles.length === 0) return null;
  const w = 432;
  const h = 140;
  const pad = 6;
  const slot = (w - pad * 2) / candles.length;
  const lo = Math.min(...candles.map((c) => c.l));
  const hi = Math.max(...candles.map((c) => c.h));
  const range = hi - lo || 1;
  const yOf = (v: number) => pad + ((hi - v) / range) * (h - pad * 2);
  return (
    // 좁은 칸에서 비율이 눌리지 않게 viewBox + w-full h-auto 로 둔다
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} className="bm-num block w-full h-auto">
      {candles.map((c, i) => {
        const cx = pad + slot * (i + 0.5);
        const up = c.c >= c.o;
        // 이 화면 밖의 캔들은 모두 --bm-up/--bm-down 을 쓴다 — 여기만 hex 로 굳어 있었다
        const color = up ? "var(--bm-up)" : "var(--bm-down)";
        const top = yOf(Math.max(c.o, c.c));
        const bottom = yOf(Math.min(c.o, c.c));
        return (
          <g key={i}>
            <line x1={cx} x2={cx} y1={yOf(c.h)} y2={yOf(c.l)} stroke={color} strokeWidth={1} />
            <rect
              x={cx - slot * 0.32}
              y={top}
              width={slot * 0.64}
              height={Math.max(1, bottom - top)}
              fill={color}
            />
          </g>
        );
      })}
    </svg>
  );
}

function DayFlowChart({
  flow,
}: {
  flow: { foreign: number; institution: number; individual: number }[];
}) {
  const w = 432;
  const h = 100;
  const pad = 6;
  const slot = (w - pad * 2) / flow.length;
  const all = flow.flatMap((f) => [f.foreign, f.institution, f.individual]);
  const lo = Math.min(0, ...all);
  const hi = Math.max(0, ...all);
  const range = hi - lo || 1;
  const yOf = (v: number) => pad + ((hi - v) / range) * (h - pad * 2);
  const barW = (slot * 0.78) / 3;
  return (
    <svg
      width="100%"
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="bm-num mt-2 block w-full h-auto"
    >
      <line
        x1={pad}
        x2={w - pad}
        y1={yOf(0)}
        y2={yOf(0)}
        stroke="var(--bm-axis)"
        strokeWidth={0.5}
      />
      {flow.map((f, i) => {
        const cx = pad + slot * (i + 0.5);
        return (
          <g key={i}>
            <Bar
              x={cx - barW * 1.55}
              barW={barW}
              v={f.foreign}
              y0={yOf(0)}
              y={yOf(f.foreign)}
              color="var(--bm-up)"
            />
            <Bar
              x={cx - barW * 0.5}
              barW={barW}
              v={f.institution}
              y0={yOf(0)}
              y={yOf(f.institution)}
              color="#a855f7"
            />
            <Bar
              x={cx + barW * 0.55}
              barW={barW}
              v={f.individual}
              y0={yOf(0)}
              y={yOf(f.individual)}
              color="var(--bm-warning)"
            />
          </g>
        );
      })}
    </svg>
  );
}

function Bar({
  x,
  barW,
  v,
  y0,
  y,
  color,
}: {
  x: number;
  barW: number;
  v: number;
  y0: number;
  y: number;
  color: string;
}) {
  const top = Math.min(y0, y);
  const h = Math.max(1, Math.abs(y - y0));
  return (
    <rect
      x={x}
      y={top}
      width={barW}
      height={h}
      rx={1.5}
      fill={color}
      fillOpacity={v >= 0 ? 1 : 0.55}
    />
  );
}
