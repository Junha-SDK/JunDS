"use client";

import { useMemo, useState } from "react";
import { backtestInvestor, type BacktestResult } from "./lib/backtest";
import { INVESTORS, INVESTOR_LIST, type InvestorId } from "./lib/investors";
import { searchStocks } from "./lib/stocks";
import { AppIcon } from "./AppIcon";

const RANGES = [
  { key: 60, label: "60일" },
  { key: 120, label: "120일" },
  { key: 250, label: "1년" },
  { key: 500, label: "2년" },
] as const;

interface BacktestRunnerProps {
  /** Optional preset symbol from page route. */
  presetSymbol?: string;
}

export function BacktestRunner({ presetSymbol }: BacktestRunnerProps) {
  const [symbol, setSymbol] = useState(presetSymbol ?? "삼성전자");
  const [investor, setInvestor] = useState<InvestorId>("buffett");
  const [bars, setBars] = useState<number>(250);
  const [query, setQuery] = useState("");

  const result: BacktestResult = useMemo(
    () => backtestInvestor(investor, symbol, { bars, rebalanceEvery: 5 }),
    [investor, symbol, bars],
  );

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    return searchStocks(query.trim(), 6);
  }, [query]);

  const winColor =
    result.totalReturn > result.buyHoldReturn ? "var(--bm-up)" : "var(--bm-down)";
  const inv = INVESTORS[investor];

  return (
    <div className="space-y-5">
      <section className="bm-card-lg p-5">
        <div className="flex items-center gap-2 mb-3">
          <AppIcon name="sparkles" size={14} strokeWidth={2.4} color="var(--bm-accent-strong)" />
          <h2 className="font-extrabold text-[14px] tracking-tight">백테스트 설정</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Investor picker */}
          <div>
            <label className="text-[10.5px] font-bold tracking-wide uppercase block mb-1.5"
                   style={{ color: "var(--bm-muted)" }}>
              거장
            </label>
            <select
              value={investor}
              onChange={(e) => setInvestor(e.target.value as InvestorId)}
              className="w-full h-10 px-3 rounded-lg outline-none text-[13px] font-bold"
              style={{
                background: "var(--bm-soft-100)",
                border: "1px solid var(--bm-border)",
                color: "var(--bm-text)",
              }}
            >
              {INVESTOR_LIST.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.emoji} {i.name}
                </option>
              ))}
            </select>
          </div>

          {/* Symbol picker */}
          <div className="relative">
            <label
              className="text-[10.5px] font-bold tracking-wide uppercase block mb-1.5"
              style={{ color: "var(--bm-muted)" }}
            >
              종목
            </label>
            <input
              value={query || symbol}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              onFocus={() => setQuery("")}
              placeholder="종목명 검색"
              className="w-full h-10 px-3 rounded-lg outline-none text-[13px] font-bold"
              style={{
                background: "var(--bm-soft-100)",
                border: "1px solid var(--bm-border)",
                color: "var(--bm-text)",
              }}
            />
            {query.trim() && suggestions.length > 0 ? (
              <ul
                className="absolute z-10 left-0 right-0 mt-1 bm-card-lg overflow-hidden max-h-60 overflow-y-auto"
              >
                {suggestions.map((s) => (
                  <li key={s.name}>
                    <button
                      type="button"
                      onClick={() => {
                        setSymbol(s.name);
                        setQuery("");
                      }}
                      className="w-full px-3 py-2 text-left text-[13px] font-bold hover:bg-[var(--bm-soft-100)]"
                    >
                      {s.name}
                      {s.sector ? (
                        <span className="ml-2 text-[11px] font-normal" style={{ color: "var(--bm-muted)" }}>
                          · {s.sector}
                        </span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* Range picker */}
          <div>
            <label
              className="text-[10.5px] font-bold tracking-wide uppercase block mb-1.5"
              style={{ color: "var(--bm-muted)" }}
            >
              기간
            </label>
            <div className="flex items-center gap-1">
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setBars(r.key)}
                  className="flex-1 h-10 rounded-lg text-[13px] font-extrabold transition-colors"
                  style={{
                    background: bars === r.key ? "var(--bm-accent-strong)" : "var(--bm-soft-100)",
                    color: bars === r.key ? "#fff" : "var(--bm-text)",
                    border: `1px solid ${bars === r.key ? "var(--bm-accent-strong)" : "var(--bm-border)"}`,
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="bm-card-lg overflow-hidden">
        <div className="bm-section-head">
          <div className="bm-section-title">
            <span className="text-[16px] leading-none">{inv.emoji}</span>
            {inv.name} · {symbol} · {bars}일
          </div>
          <span
            className="text-[10.5px] font-bold tracking-wide uppercase"
            style={{ color: "var(--bm-muted)" }}
          >
            5거래일마다 재평가
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px"
             style={{ background: "var(--bm-border)" }}>
          <Stat
            label="전략 수익률"
            value={`${(result.totalReturn * 100).toFixed(2)}%`}
            tone={result.totalReturn >= 0 ? "up" : "down"}
          />
          <Stat
            label="매수보유 수익률"
            value={`${(result.buyHoldReturn * 100).toFixed(2)}%`}
            tone={result.buyHoldReturn >= 0 ? "up" : "down"}
          />
          <Stat
            label="vs. 매수보유"
            value={`${result.totalReturn > result.buyHoldReturn ? "+" : ""}${((result.totalReturn - result.buyHoldReturn) * 100).toFixed(2)}%p`}
            tone={result.totalReturn > result.buyHoldReturn ? "up" : "down"}
            customColor={winColor}
          />
          <Stat
            label="MDD"
            value={`${(result.maxDrawdown * 100).toFixed(2)}%`}
            tone="down"
          />
          <Stat label="연환산 (CAGR)" value={`${(result.cagr * 100).toFixed(2)}%`} />
          <Stat label="매수보유 CAGR" value={`${(result.buyHoldCagr * 100).toFixed(2)}%`} />
          <Stat label="포지션 변경" value={`${result.trades}회`} />
          <Stat label="총 봉 수" value={`${result.bars}개`} />
        </div>

        {/* Equity curve */}
        <div className="p-4">
          <EquitySvg result={result} />
        </div>

        {/* Verdict histogram */}
        <div
          className="px-4 py-3 flex items-center gap-3 flex-wrap"
          style={{ borderTop: "1px solid var(--bm-border)" }}
        >
          <span
            className="text-[10.5px] font-bold tracking-wide uppercase"
            style={{ color: "var(--bm-muted)" }}
          >
            의견 분포
          </span>
          {(["강력매수", "매수", "관망", "매도", "강력매도"] as const).map((v) => (
            <span
              key={v}
              className="bm-num text-[11.5px] font-bold inline-flex items-center gap-1"
            >
              <span style={{ color: "var(--bm-muted)" }}>{v}</span>
              <span
                style={{
                  color:
                    v.includes("매수")
                      ? "var(--bm-up)"
                      : v.includes("매도")
                        ? "var(--bm-down)"
                        : "var(--bm-text)",
                }}
              >
                {result.verdictHist[v]}
              </span>
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  customColor,
}: {
  label: string;
  value: string;
  tone?: "up" | "down";
  customColor?: string;
}) {
  const color =
    customColor ??
    (tone === "up"
      ? "var(--bm-up)"
      : tone === "down"
        ? "var(--bm-down)"
        : "var(--bm-text)");
  return (
    <div className="bm-stat-tile">
      <span className="bm-stat-tile-label">{label}</span>
      <span className="bm-stat-tile-value" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

function EquitySvg({ result }: { result: BacktestResult }) {
  const W = 1100;
  const H = 220;
  const pad = { l: 36, r: 8, t: 12, b: 24 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const points = result.points;
  if (points.length === 0) return null;
  const min = Math.min(...points.map((p) => Math.min(p.equity, p.buyHold)));
  const max = Math.max(...points.map((p) => Math.max(p.equity, p.buyHold)));
  const range = max - min || 1;
  const x = (i: number) => pad.l + (i / (points.length - 1)) * innerW;
  const y = (v: number) => pad.t + innerH - ((v - min) / range) * innerH;

  const eq = points.map((p, i) => `${x(i).toFixed(1)},${y(p.equity).toFixed(1)}`).join(" ");
  const bh = points.map((p, i) => `${x(i).toFixed(1)},${y(p.buyHold).toFixed(1)}`).join(" ");
  const eqColor = "var(--bm-accent-strong)";
  const bhColor = "var(--bm-muted)";

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      {/* baseline */}
      <line
        x1={pad.l}
        x2={W - pad.r}
        y1={y(1)}
        y2={y(1)}
        stroke="var(--bm-border)"
        strokeDasharray="3 3"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      <text
        x={pad.l - 4}
        y={y(1) + 3}
        fontSize="10"
        textAnchor="end"
        fill="var(--bm-muted)"
      >
        1.00
      </text>
      <polyline
        points={bh}
        fill="none"
        stroke={bhColor}
        strokeWidth={1.5}
        strokeDasharray="4 3"
        vectorEffect="non-scaling-stroke"
      />
      <polyline
        points={eq}
        fill="none"
        stroke={eqColor}
        strokeWidth={2.2}
        vectorEffect="non-scaling-stroke"
      />
      {/* legend */}
      <g transform={`translate(${pad.l + 6}, ${pad.t + 6})`}>
        <rect width="160" height="34" fill="var(--bm-card)" stroke="var(--bm-border)" rx="6" />
        <line x1="8" y1="12" x2="20" y2="12" stroke={eqColor} strokeWidth="2.2" />
        <text x="24" y="15" fontSize="10" fill="var(--bm-text)" fontWeight="700">
          전략
        </text>
        <line x1="8" y1="26" x2="20" y2="26" stroke={bhColor} strokeWidth="1.5" strokeDasharray="3 2" />
        <text x="24" y="29" fontSize="10" fill="var(--bm-muted)" fontWeight="700">
          매수보유
        </text>
      </g>
    </svg>
  );
}
