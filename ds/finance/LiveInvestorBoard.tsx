"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMarketStatus } from "./lib/useMarketStatus";

type InvestorKey = "foreign" | "institution" | "individual";
type MarketKey = "kospi" | "kosdaq" | "futures";

interface InvestorRow {
  /** Buy volume in 억원 */
  buy: number;
  /** Sell volume in 억원 */
  sell: number;
}

type Snapshot = Record<MarketKey, Record<InvestorKey, InvestorRow>>;
type NetHistory = Record<MarketKey, Record<InvestorKey, number[]>>;

const INVESTOR_LABEL: Record<InvestorKey, string> = {
  foreign: "외국인",
  institution: "기관",
  individual: "개인",
};

const MARKET_LABEL: Record<MarketKey, string> = {
  kospi: "코스피",
  kosdaq: "코스닥",
  futures: "선물",
};

// 투자자 3주체를 가르는 계열색 — 등락색(up/down)과 섞이면 안 되므로 기관만 보라 계열을
// 그대로 둔다. 정체성 색이라 테마 토큰으로 옮기지 않는다.
const INVESTOR_COLOR: Record<InvestorKey, string> = {
  foreign: "var(--bm-up)",
  institution: "#a855f7",
  individual: "var(--bm-warning)",
};

const HISTORY_LEN = 16;

const SEED: Snapshot = {
  kospi: {
    foreign: { buy: 84_510, sell: 68_042 },
    institution: { buy: 31_220, sell: 38_501 },
    individual: { buy: 92_310, sell: 99_574 },
  },
  kosdaq: {
    foreign: { buy: 12_440, sell: 13_406 },
    institution: { buy: 9_120, sell: 13_522 },
    individual: { buy: 41_580, sell: 36_145 },
  },
  futures: {
    foreign: { buy: 8_240, sell: 6_083 },
    institution: { buy: 4_120, sell: 6_511 },
    individual: { buy: 2_910, sell: 2_774 },
  },
};

function tick(prev: Snapshot, jitter: () => number): Snapshot {
  const out: Snapshot = JSON.parse(JSON.stringify(prev));
  (Object.keys(out) as MarketKey[]).forEach((mk) => {
    (Object.keys(out[mk]) as InvestorKey[]).forEach((ik) => {
      const row = out[mk][ik];
      const buyDelta = Math.round(row.buy * jitter() * 0.012);
      const sellDelta = Math.round(row.sell * jitter() * 0.012);
      row.buy = Math.max(100, row.buy + buyDelta);
      row.sell = Math.max(100, row.sell + sellDelta);
    });
  });
  return out;
}

function fmt억(억원: number): string {
  if (Math.abs(억원) >= 10_000) return `${(억원 / 10_000).toFixed(2)}조`;
  return `${억원.toLocaleString("ko-KR")}억`;
}

function net(row: InvestorRow): number {
  return row.buy - row.sell;
}

function buyRatio(row: InvestorRow): number {
  const total = row.buy + row.sell;
  if (total === 0) return 0;
  return (row.buy / total) * 100;
}

function emptyHistory(): NetHistory {
  const out = {} as NetHistory;
  (Object.keys(SEED) as MarketKey[]).forEach((mk) => {
    out[mk] = { foreign: [], institution: [], individual: [] };
  });
  return out;
}

export function LiveInvestorBoard() {
  const [snap, setSnap] = useState<Snapshot>(SEED);
  const [prev, setPrev] = useState<Snapshot>(SEED);
  const [history, setHistory] = useState<NetHistory>(() => emptyHistory());
  const [now, setNow] = useState<string>("");
  const seedRef = useRef(1);
  const marketStatus = useMarketStatus();
  const isOpen = marketStatus === "장중";

  useEffect(() => {
    const fmtTime = () => {
      const d = new Date();
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(
        2,
        "0",
      )}:${String(d.getSeconds()).padStart(2, "0")}`;
    };
    setNow(fmtTime());
    if (!isOpen) return;
    const id = setInterval(() => {
      setSnap((prevSnap) => {
        const next = tick(prevSnap, () => {
          seedRef.current = (seedRef.current * 9301 + 49297) % 233280;
          return seedRef.current / 233280 - 0.5;
        });
        setPrev(prevSnap);
        setHistory((h) => {
          const out: NetHistory = {} as NetHistory;
          (Object.keys(next) as MarketKey[]).forEach((mk) => {
            out[mk] = { foreign: [], institution: [], individual: [] };
            (Object.keys(next[mk]) as InvestorKey[]).forEach((ik) => {
              const series = [...(h[mk]?.[ik] ?? []), net(next[mk][ik])];
              out[mk][ik] = series.slice(-HISTORY_LEN);
            });
          });
          return out;
        });
        return next;
      });
      setNow(fmtTime());
    }, 3000);
    return () => clearInterval(id);
  }, [isOpen]);

  const totals = useMemo(() => {
    const t: Record<MarketKey, { buy: number; sell: number }> = {
      kospi: { buy: 0, sell: 0 },
      kosdaq: { buy: 0, sell: 0 },
      futures: { buy: 0, sell: 0 },
    };
    (Object.keys(snap) as MarketKey[]).forEach((mk) => {
      (Object.keys(snap[mk]) as InvestorKey[]).forEach((ik) => {
        t[mk].buy += snap[mk][ik].buy;
        t[mk].sell += snap[mk][ik].sell;
      });
    });
    return t;
  }, [snap]);

  // 시장 합계: investor net across all markets
  const investorTotals = useMemo(() => {
    const t: Record<InvestorKey, number> = { foreign: 0, institution: 0, individual: 0 };
    (Object.keys(snap) as MarketKey[]).forEach((mk) => {
      (Object.keys(snap[mk]) as InvestorKey[]).forEach((ik) => {
        t[ik] += net(snap[mk][ik]);
      });
    });
    return t;
  }, [snap]);

  return (
    <div className="bm-card overflow-hidden" data-bm-live-board>
      <style>{`
        @keyframes bm-pulse { 0% { transform: scale(1); opacity: .8 } 80% { transform: scale(2.4); opacity: 0 } 100% { transform: scale(2.4); opacity: 0 } }
        @keyframes bm-flash-up {
          0% { background-color: rgba(220,38,38,0.18); }
          100% { background-color: transparent; }
        }
        @keyframes bm-flash-down {
          0% { background-color: rgba(37,99,235,0.18); }
          100% { background-color: transparent; }
        }
        /* 3초마다 번지는 플래시와 퍼지는 LIVE 링은 감속 요청 대상이다.
           키프레임을 인라인으로 넣는 곳이라 motion-reduce 유틸리티가 닿지 않으므로 여기서 끈다. */
        @media (prefers-reduced-motion: reduce) {
          [data-bm-live-board] *,
          [data-bm-live-board] {
            animation: none !important;
          }
        }
      `}</style>

      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ borderBottom: "1px solid var(--bm-border)" }}
      >
        <span className="relative flex size-2.5">
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{
              background: isOpen ? "var(--bm-success)" : "var(--bm-muted)",
              animation: isOpen ? "bm-pulse 1.4s ease-out infinite" : "none",
            }}
          />
          <span
            className="relative inline-flex rounded-full size-2.5"
            style={{ background: isOpen ? "var(--bm-success)" : "var(--bm-muted)" }}
          />
        </span>
        <span
          className="text-[11px] font-extrabold tracking-[0.06em]"
          style={{ color: isOpen ? "var(--bm-success)" : "var(--bm-muted)" }}
        >
          {isOpen ? "LIVE" : marketStatus === "휴장" ? "휴장" : "장마감"}
        </span>
        <span className="text-[12.5px] font-extrabold">
          {isOpen ? "실시간 투자자 매매동향" : "투자자 매매동향 (장 마감 스냅샷)"}
        </span>
        <span
          className="ml-auto bm-num text-[11.5px] font-bold"
          style={{ color: "var(--bm-muted)" }}
        >
          {isOpen ? `${now || "—"} 기준 · 3초 간격` : "정규장 09:00–15:30 KST 동안 갱신"}
        </span>
      </div>

      {/* 시장 합계 요약 */}
      <div
        className="grid grid-cols-3 px-3 py-2 gap-2"
        style={{ borderBottom: "1px solid var(--bm-border)", background: "var(--bm-soft-100)" }}
      >
        {(Object.keys(INVESTOR_LABEL) as InvestorKey[]).map((ik) => {
          const v = investorTotals[ik];
          const up = v >= 0;
          return (
            <div key={ik} className="flex items-center gap-2">
              <span
                className="size-2 rounded-full shrink-0"
                style={{ background: INVESTOR_COLOR[ik] }}
              />
              <span className="text-[11px] font-bold" style={{ color: "var(--bm-muted)" }}>
                {INVESTOR_LABEL[ik]} 시장합계
              </span>
              <span
                className="ml-auto bm-num font-extrabold text-[13px]"
                style={{ color: up ? "var(--bm-up)" : "var(--bm-down)" }}
              >
                {up ? "+" : ""}
                {fmt억(v)}
              </span>
            </div>
          );
        })}
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: "minmax(108px,1fr) repeat(3, minmax(0,1.4fr))" }}
      >
        <HeadCell title="구분" />
        {(Object.keys(MARKET_LABEL) as MarketKey[]).map((mk) => (
          <HeadCell key={mk} title={MARKET_LABEL[mk]} center />
        ))}

        {(Object.keys(INVESTOR_LABEL) as InvestorKey[]).map((ik) => (
          <InvestorRowCells key={ik} ik={ik} snap={snap} prev={prev} history={history} />
        ))}

        <HeadCell title="총 거래량" muted />
        {(Object.keys(totals) as MarketKey[]).map((mk) => (
          <div
            key={mk}
            className="px-2 py-1.5 text-center bm-num font-bold text-[12px]"
            style={{
              borderTop: "1px solid var(--bm-border)",
              borderRight: "1px solid var(--bm-border)",
              color: "var(--bm-text)",
              background: "var(--bm-soft-100)",
            }}
          >
            {fmt억(totals[mk].buy + totals[mk].sell)}
          </div>
        ))}
      </div>
    </div>
  );
}

function HeadCell({ title, center, muted }: { title: string; center?: boolean; muted?: boolean }) {
  return (
    <span
      className="px-2 py-1.5 text-[12px] font-extrabold"
      style={{
        color: muted ? "var(--bm-muted)" : "var(--bm-text)",
        textAlign: center ? "center" : "left",
        borderBottom: "1px solid var(--bm-border)",
        borderRight: "1px solid var(--bm-border)",
        background: "var(--bm-soft-100)",
      }}
    >
      {title}
    </span>
  );
}

function InvestorRowCells({
  ik,
  snap,
  prev,
  history,
}: {
  ik: InvestorKey;
  snap: Snapshot;
  prev: Snapshot;
  history: NetHistory;
}) {
  return (
    <>
      <div
        className="px-2 py-2 text-[12px] font-extrabold flex items-center gap-1.5"
        style={{
          borderRight: "1px solid var(--bm-border)",
          borderTop: "1px solid var(--bm-border)",
        }}
      >
        <span className="size-2 rounded-full" style={{ background: INVESTOR_COLOR[ik] }} />
        {INVESTOR_LABEL[ik]}
      </div>
      {(Object.keys(MARKET_LABEL) as MarketKey[]).map((mk) => {
        const row = snap[mk][ik];
        const prevRow = prev[mk][ik];
        const n = net(row);
        const prevN = net(prevRow);
        const delta = n - prevN;
        const ratio = buyRatio(row);
        const up = n > 0;
        const series = history[mk]?.[ik] ?? [];
        const flashKey = `${mk}-${ik}-${n}`;
        const flashAnim =
          delta > 0
            ? "bm-flash-up 1.6s ease-out"
            : delta < 0
            ? "bm-flash-down 1.6s ease-out"
            : "none";
        return (
          <div
            key={mk + flashKey}
            className="px-2 py-1.5 text-[11.5px]"
            style={{
              borderRight: "1px solid var(--bm-border)",
              borderTop: "1px solid var(--bm-border)",
              animation: flashAnim,
            }}
          >
            <Sparkline values={series} color={INVESTOR_COLOR[ik]} />
            <div className="flex items-baseline justify-between gap-1 mt-0.5">
              <span
                className="bm-num font-extrabold text-[12.5px] whitespace-nowrap"
                style={{ color: up ? "var(--bm-up)" : n < 0 ? "var(--bm-down)" : "var(--bm-text)" }}
              >
                {up ? "+" : ""}
                {fmt억(n)}
              </span>
              <DeltaPill delta={delta} />
            </div>
            <div className="flex items-center justify-between gap-1 mt-1">
              <span
                className="bm-num"
                style={{ color: "var(--bm-up)", fontSize: 10.5, fontWeight: 700 }}
              >
                매수 {fmt억(row.buy)}
              </span>
              <span
                className="bm-num"
                style={{ color: "var(--bm-down)", fontSize: 10.5, fontWeight: 700 }}
              >
                매도 {fmt억(row.sell)}
              </span>
            </div>
            <div
              className="mt-1 h-1.5 rounded-full overflow-hidden flex"
              style={{ background: "var(--bm-soft-100)" }}
            >
              <div style={{ width: `${ratio}%`, background: "var(--bm-up)" }} />
              <div style={{ width: `${100 - ratio}%`, background: "var(--bm-down)" }} />
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="bm-num text-[9.5px] font-bold" style={{ color: "var(--bm-up)" }}>
                매수율 {ratio.toFixed(1)}%
              </span>
              <span className="bm-num text-[9.5px] font-bold" style={{ color: "var(--bm-down)" }}>
                매도율 {(100 - ratio).toFixed(1)}%
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
}

function DeltaPill({ delta }: { delta: number }) {
  if (delta === 0)
    return (
      <span className="bm-num text-[9px] font-bold" style={{ color: "var(--bm-muted)" }}>
        —
      </span>
    );
  const up = delta > 0;
  return (
    <span
      className="bm-num text-[9px] font-extrabold inline-flex items-center gap-0.5"
      style={{ color: up ? "var(--bm-up)" : "var(--bm-down)" }}
    >
      {up ? "▲" : "▼"}
      {fmt억(Math.abs(delta))}
    </span>
  );
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const w = 100;
  const h = 22;
  if (values.length < 2) {
    return (
      <svg
        width="100%"
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        style={{ display: "block" }}
      >
        <line x1={0} x2={w} y1={h / 2} y2={h / 2} stroke="var(--bm-grid)" strokeWidth={1} />
      </svg>
    );
  }
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);
  const range = max - min || 1;
  const step = w / (values.length - 1);
  const yOf = (v: number) => h - ((v - min) / range) * h;
  const last = values[values.length - 1];
  const path = values
    .map((v, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${yOf(v).toFixed(1)}`)
    .join(" ");
  const fillPath = `${path} L${w},${h} L0,${h} Z`;
  return (
    // 고정 100px 폭은 좁은 열에서 셀을 밀어낸다 — 빈 상태 분기와 같이 칸을 꽉 채우게 한다
    <svg
      width="100%"
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="block w-full"
    >
      <line
        x1={0}
        x2={w}
        y1={yOf(0)}
        y2={yOf(0)}
        stroke="var(--bm-grid)"
        strokeDasharray="2 2"
        vectorEffect="non-scaling-stroke"
      />
      <path d={fillPath} fill={color} fillOpacity={0.12} />
      {/* 칸 폭에 맞춰 가로로 늘어나므로 선 굵기는 스케일에서 빼야 두께가 일정하다 */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={w - 1} cy={yOf(last)} r={1.6} fill={color} />
    </svg>
  );
}
