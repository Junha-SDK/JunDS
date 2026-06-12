"use client";

import { useMemo, useState } from "react";
import {
  useTradeJournal,
  reviewTrade,
  journalStats,
  type TradeEntry,
  type TradeSide,
} from "./lib/tradeJournal";
import { useLivePrice } from "./lib/livePrices";
import { searchStocks } from "./lib/stocks";
import { AppIcon } from "./AppIcon";

export function TradeJournal() {
  const { items, add, remove, hydrated } = useTradeJournal();
  const [open, setOpen] = useState(false);
  const stats = useMemo(() => journalStats(items), [items]);

  if (!hydrated) {
    return (
      <section className="bm-card-lg p-5">
        <div className="bm-skeleton h-32 w-full" />
      </section>
    );
  }

  return (
    <section className="bm-card-lg overflow-hidden">
      <div className="bm-section-head">
        <div className="bm-section-title">
          <AppIcon name="newspaper" size={14} strokeWidth={2.4} color="var(--bm-accent-strong)" />
          매매 일지
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="bm-btn-pill"
          data-active={open}
        >
          <AppIcon name="plus" size={12} strokeWidth={2.6} />
          기록 추가
        </button>
      </div>

      {/* Stat bar */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-px"
        style={{ background: "var(--bm-border)" }}
      >
        <Stat label="총 매매" value={`${stats.totalTrades}건`} />
        <Stat label="매수" value={`${stats.buys}건`} tone="up" />
        <Stat label="매도" value={`${stats.sells}건`} tone="down" />
        <Stat
          label="이번달"
          value={`${stats.byMonth[stats.byMonth.length - 1]?.count ?? 0}건`}
        />
      </div>

      {/* Add form */}
      {open ? <NewTradeForm onAdd={(e) => { add(e); setOpen(false); }} onCancel={() => setOpen(false)} /> : null}

      {/* List */}
      {items.length === 0 ? (
        <div className="bm-empty">
          <div className="bm-empty-icon">
            <AppIcon name="newspaper" size={20} strokeWidth={2} color="var(--bm-muted)" />
          </div>
          <div className="bm-empty-title">기록된 매매가 없습니다</div>
          <div className="bm-empty-desc">첫 매매를 기록하면 회고와 분류가 자동 생성됩니다.</div>
        </div>
      ) : (
        <ul>
          {items.map((t) => (
            <TradeRow key={t.id} entry={t} onDelete={() => remove(t.id)} />
          ))}
        </ul>
      )}
    </section>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "up" | "down";
}) {
  const color = tone === "up" ? "var(--bm-up)" : tone === "down" ? "var(--bm-down)" : "var(--bm-text)";
  return (
    <div className="bm-stat-tile">
      <span className="bm-stat-tile-label">{label}</span>
      <span className="bm-stat-tile-value" style={{ color }}>{value}</span>
    </div>
  );
}

function TradeRow({
  entry,
  onDelete,
}: {
  entry: TradeEntry;
  onDelete: () => void;
}) {
  const { price } = useLivePrice(entry.name);
  const review = reviewTrade(entry, price || entry.price);
  const sideColor = entry.side === "buy" ? "var(--bm-up)" : "var(--bm-down)";
  const pctColor =
    review.pctVsCurrent >= 0 ? "var(--bm-up)" : "var(--bm-down)";
  const klassColor: Record<typeof review.classification, string> = {
    유지: "var(--bm-muted)",
    수익실현: "var(--bm-up)",
    손절: "var(--bm-down)",
    추격매수: "#a855f7",
    물타기: "var(--bm-warning)",
  };
  return (
    <li
      className="px-4 py-3 flex items-center gap-3"
      style={{ borderTop: "1px solid var(--bm-border)" }}
    >
      <span
        className="text-[10.5px] font-extrabold px-2 h-6 rounded-md grid place-items-center"
        style={{
          color: sideColor,
          background:
            entry.side === "buy" ? "var(--bm-up-soft)" : "var(--bm-down-soft)",
        }}
      >
        {entry.side === "buy" ? "매수" : "매도"}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-extrabold text-[13.5px] truncate">{entry.name}</span>
          <span
            className="bm-num text-[11px]"
            style={{ color: "var(--bm-muted)" }}
          >
            {entry.qty}주 × {entry.price.toLocaleString("ko-KR")}원
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-[11px]"
             style={{ color: "var(--bm-muted)" }}>
          <span className="bm-num">{new Date(entry.at).toLocaleDateString("ko-KR")}</span>
          {entry.note ? <span className="truncate">· {entry.note}</span> : null}
        </div>
      </div>
      <div className="text-right shrink-0">
        <span
          className="bm-num font-extrabold text-[13px]"
          style={{ color: pctColor }}
        >
          {review.pctVsCurrent >= 0 ? "+" : ""}
          {(review.pctVsCurrent * 100).toFixed(2)}%
        </span>
        <div
          className="text-[10.5px] font-extrabold mt-0.5"
          style={{ color: klassColor[review.classification] }}
        >
          {review.classification}
        </div>
      </div>
      <button
        onClick={onDelete}
        aria-label="삭제"
        className="size-7 rounded-full grid place-items-center hover:bg-[var(--bm-soft-100)] shrink-0"
        style={{ color: "var(--bm-muted)" }}
      >
        <AppIcon name="close" size={14} strokeWidth={2.2} />
      </button>
    </li>
  );
}

function NewTradeForm({
  onAdd,
  onCancel,
}: {
  onAdd: (entry: { name: string; side: TradeSide; qty: number; price: number; note?: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [side, setSide] = useState<TradeSide>("buy");
  const [qty, setQty] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [note, setNote] = useState("");
  const [query, setQuery] = useState("");
  const suggestions = useMemo(() => (query.trim() ? searchStocks(query.trim(), 6) : []), [query]);
  const valid = name.trim() && qty > 0 && price > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        onAdd({ name: name.trim(), side, qty, price, note: note.trim() || undefined });
      }}
      className="px-4 py-4 flex flex-col gap-3"
      style={{ borderTop: "1px solid var(--bm-border)", background: "var(--bm-soft-100)" }}
    >
      <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_140px_140px] gap-2">
        <div className="relative">
          <input
            value={name || query}
            onChange={(e) => {
              setQuery(e.target.value);
              setName("");
            }}
            placeholder="종목명"
            className="w-full h-10 px-3 rounded-lg outline-none text-[13px] font-bold"
            style={{
              background: "var(--bm-card)",
              border: "1px solid var(--bm-border)",
            }}
          />
          {query.trim() && suggestions.length > 0 ? (
            <ul className="absolute z-10 left-0 right-0 mt-1 bm-card-lg overflow-hidden max-h-48 overflow-y-auto">
              {suggestions.map((s) => (
                <li key={s.name}>
                  <button
                    type="button"
                    onClick={() => {
                      setName(s.name);
                      setQuery("");
                    }}
                    className="w-full px-3 py-2 text-left text-[13px] font-bold hover:bg-[var(--bm-soft-100)]"
                  >
                    {s.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <select
          value={side}
          onChange={(e) => setSide(e.target.value as TradeSide)}
          className="h-10 px-3 rounded-lg outline-none text-[13px] font-bold"
          style={{ background: "var(--bm-card)", border: "1px solid var(--bm-border)" }}
        >
          <option value="buy">매수</option>
          <option value="sell">매도</option>
        </select>
        <input
          type="number"
          min={0}
          value={qty || ""}
          onChange={(e) => setQty(Number(e.target.value))}
          placeholder="수량"
          className="h-10 px-3 rounded-lg outline-none text-[13px] font-bold bm-num"
          style={{ background: "var(--bm-card)", border: "1px solid var(--bm-border)" }}
        />
        <input
          type="number"
          min={0}
          value={price || ""}
          onChange={(e) => setPrice(Number(e.target.value))}
          placeholder="단가"
          className="h-10 px-3 rounded-lg outline-none text-[13px] font-bold bm-num"
          style={{ background: "var(--bm-card)", border: "1px solid var(--bm-border)" }}
        />
      </div>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="이유 (선택, 예: 1분기 호실적 기대)"
        className="w-full h-10 px-3 rounded-lg outline-none text-[13px]"
        style={{ background: "var(--bm-card)", border: "1px solid var(--bm-border)" }}
      />
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 px-4 rounded-full text-[12px] font-extrabold"
          style={{ background: "var(--bm-card)", border: "1px solid var(--bm-border)", color: "var(--bm-text)" }}
        >
          취소
        </button>
        <button
          type="submit"
          disabled={!valid}
          className="h-9 px-4 rounded-full text-[12px] font-extrabold text-white disabled:opacity-50"
          style={{ background: "var(--bm-accent-strong)" }}
        >
          기록 저장
        </button>
      </div>
    </form>
  );
}
