"use client";

import { Modal } from "@junds/ui";
import { fmtSigned, fmtSignedPct } from "./lib/format";
import { calcFees, useBrokerage } from "./lib/brokerages";

interface PortfolioDay {
  date: string;
  profit: number;
  pct: number;
  sellAmount: number;
  buyAmount: number;
  sellQty: number;
  buyQty: number;
  fees: number;
}

interface DayTrade {
  name: string;
  side: "매도" | "매수";
  qty: number;
  price: number;
  amount: number;
  fee: number;
  pl: number;
}

interface PortfolioDayDetailModalProps {
  open: boolean;
  onClose: () => void;
  day: PortfolioDay | null;
}

const STOCK_POOL: { name: string; sector: string }[] = [
  { name: "보성파워텍", sector: "수소·재생에너지" },
  { name: "씨아이에스", sector: "2차전지" },
  { name: "대원전선", sector: "전선" },
  { name: "한국항공우주", sector: "방산" },
  { name: "SK이노베이션", sector: "에너지" },
  { name: "두산에너빌리티", sector: "발전" },
  { name: "리노공업", sector: "반도체" },
  { name: "에코프로비엠", sector: "2차전지" },
];

export function PortfolioDayDetailModal({
  open,
  onClose,
  day,
}: PortfolioDayDetailModalProps) {
  const { brokerage } = useBrokerage();

  if (!day) {
    return (
      <Modal open={open} onClose={onClose} size="md">
        <Modal.Header onClose={onClose}>매매 상세</Modal.Header>
        <div className="px-5 pb-6 pt-2 text-[13px] text-[color:var(--bm-muted)]">
          선택된 매매일자가 없습니다.
        </div>
      </Modal>
    );
  }

  const trades = synthesizeTrades(day);
  const fees = calcFees(day.buyAmount, day.sellAmount, brokerage);
  const netProfit = day.profit - fees.total;
  const turnover = day.buyAmount + day.sellAmount;
  const profitColor = day.profit >= 0 ? "var(--bm-up)" : "var(--bm-down)";

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <Modal.Header onClose={onClose}>{day.date} 매매 상세</Modal.Header>
      <div className="px-5 pb-5 pt-1 max-h-[75vh] overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="실현손익" value={fmtSigned(day.profit)} color={profitColor} />
          <Stat
            label="실현수익률"
            value={fmtSignedPct(day.pct)}
            color={profitColor}
          />
          <Stat
            label="거래 회전"
            value={turnover.toLocaleString("ko-KR")}
            unit="원"
          />
          <Stat
            label="순손익(세후)"
            value={fmtSigned(Math.round(netProfit))}
            color={netProfit >= 0 ? "var(--bm-up)" : "var(--bm-down)"}
          />
        </div>

        <h4 className="text-[13px] font-extrabold mt-5 mb-2">금액 구성</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat
            label="매도금액"
            value={day.sellAmount.toLocaleString("ko-KR")}
            unit="원"
          />
          <Stat
            label="매수금액"
            value={day.buyAmount.toLocaleString("ko-KR")}
            unit="원"
          />
          <Stat
            label={`수수료 (${brokerage.name.split(" ")[0]})`}
            value={fees.commission.toLocaleString("ko-KR")}
            unit="원"
            muted
          />
          <Stat
            label="거래세 0.18%"
            value={fees.tax.toLocaleString("ko-KR")}
            unit="원"
            muted
          />
        </div>

        <h4 className="text-[13px] font-extrabold mt-5 mb-2">체결 내역</h4>
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid var(--bm-border)" }}
        >
          <table className="w-full text-[12.5px] bm-num">
            <thead
              className="text-[11px] font-bold"
              style={{
                background: "var(--bm-soft-100)",
                color: "var(--bm-muted)",
              }}
            >
              <tr>
                <th className="text-left px-3 py-2">종목</th>
                <th className="text-left px-3 py-2 w-12">구분</th>
                <th className="text-right px-3 py-2 w-16">수량</th>
                <th className="text-right px-3 py-2 w-24">단가</th>
                <th className="text-right px-3 py-2">금액</th>
                <th className="text-right px-3 py-2 w-20">수수료</th>
                <th className="text-right px-3 py-2 w-24">손익</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t, i) => (
                <tr
                  key={`${t.name}-${t.side}-${i}`}
                  style={{
                    borderTop: "1px solid var(--bm-border)",
                  }}
                >
                  <td className="px-3 py-2 font-bold">{t.name}</td>
                  <td className="px-3 py-2">
                    <span
                      className="inline-block rounded px-1.5 py-0.5 text-[10.5px] font-extrabold"
                      style={{
                        background:
                          t.side === "매도"
                            ? "rgba(239,68,68,0.12)"
                            : "rgba(59,130,246,0.12)",
                        color:
                          t.side === "매도" ? "var(--bm-up)" : "var(--bm-down)",
                      }}
                    >
                      {t.side}
                    </span>
                  </td>
                  <td className="text-right px-3 py-2">
                    {t.qty.toLocaleString("ko-KR")}
                  </td>
                  <td className="text-right px-3 py-2">
                    {t.price.toLocaleString("ko-KR")}
                  </td>
                  <td className="text-right px-3 py-2 font-semibold">
                    {t.amount.toLocaleString("ko-KR")}
                  </td>
                  <td
                    className="text-right px-3 py-2"
                    style={{ color: "var(--bm-muted)" }}
                  >
                    {t.fee.toLocaleString("ko-KR")}
                  </td>
                  <td
                    className="text-right px-3 py-2 font-extrabold"
                    style={{
                      color:
                        t.pl === 0
                          ? "var(--bm-muted)"
                          : t.pl > 0
                          ? "var(--bm-up)"
                          : "var(--bm-down)",
                    }}
                  >
                    {t.pl === 0 ? "—" : fmtSigned(t.pl)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-[11.5px] leading-relaxed text-[color:var(--bm-muted)]">
          ※ 체결 내역은 일별 합계 기준으로 자동 분배해 표시한 데모 자료입니다.
          실제 거래 내역은 체결 화면에서 확인해 주세요.
        </p>
      </div>
    </Modal>
  );
}

function Stat({
  label,
  value,
  unit,
  color,
  muted,
}: {
  label: string;
  value: string;
  unit?: string;
  color?: string;
  muted?: boolean;
}) {
  return (
    <div
      className="rounded-xl px-3 py-2.5"
      style={{ background: "var(--bm-soft-100)" }}
    >
      <div
        className="text-[10.5px] font-bold"
        style={{ color: "var(--bm-muted)" }}
      >
        {label}
      </div>
      <div
        className="bm-num font-extrabold text-[15px] mt-0.5"
        style={{ color: color ?? (muted ? "var(--bm-text)" : "var(--bm-text)") }}
      >
        {value}
        {unit ? (
          <span className="text-[10.5px] ml-0.5 font-semibold opacity-70">
            {unit}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function synthesizeTrades(day: PortfolioDay): DayTrade[] {
  const seed = day.date.replace(/\D/g, "");
  const seedNum = parseInt(seed, 10) || 1;
  const rng = mulberry32(seedNum);

  const items: DayTrade[] = [];

  if (day.sellAmount > 0 && day.sellQty > 0) {
    const splits = splitInto(day.sellAmount, day.sellQty, day.profit, rng, 2);
    for (const s of splits) {
      const idx = Math.floor(rng() * STOCK_POOL.length);
      items.push({
        name: STOCK_POOL[idx].name,
        side: "매도",
        qty: s.qty,
        price: s.qty === 0 ? 0 : Math.round(s.amount / s.qty),
        amount: s.amount,
        fee: Math.round(s.amount * 0.00015),
        pl: s.pl,
      });
    }
  }

  if (day.buyAmount > 0 && day.buyQty > 0) {
    const splits = splitInto(day.buyAmount, day.buyQty, 0, rng, 2);
    for (const s of splits) {
      const idx = Math.floor(rng() * STOCK_POOL.length);
      items.push({
        name: STOCK_POOL[idx].name,
        side: "매수",
        qty: s.qty,
        price: s.qty === 0 ? 0 : Math.round(s.amount / s.qty),
        amount: s.amount,
        fee: Math.round(s.amount * 0.00015),
        pl: 0,
      });
    }
  }

  return items;
}

function splitInto(
  amount: number,
  qty: number,
  pl: number,
  rng: () => number,
  pieces: number,
): { amount: number; qty: number; pl: number }[] {
  const result: { amount: number; qty: number; pl: number }[] = [];
  let remainingAmount = amount;
  let remainingQty = qty;
  let remainingPl = pl;
  for (let i = 0; i < pieces - 1; i++) {
    const ratio = 0.35 + rng() * 0.3;
    const a = Math.round(remainingAmount * ratio);
    const q = Math.max(1, Math.round(remainingQty * ratio));
    const p = Math.round(remainingPl * ratio);
    result.push({ amount: a, qty: q, pl: p });
    remainingAmount -= a;
    remainingQty -= q;
    remainingPl -= p;
  }
  result.push({
    amount: Math.max(0, remainingAmount),
    qty: Math.max(0, remainingQty),
    pl: remainingPl,
  });
  return result;
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
