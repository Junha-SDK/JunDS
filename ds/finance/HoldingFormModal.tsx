"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { searchStocks, findStock } from "./lib/stocks";
import type { Holding } from "./lib/holdings";
import { AppIcon } from "./AppIcon";

interface HoldingFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (h: Holding) => void;
  /** Optional initial values for "edit" mode; when set, name is locked. */
  initial?: { name: string; qty: number; avgCost: number };
  /** Locks the name field to this stock for "add" mode (pre-filled from a stock page). */
  presetName?: string;
  title?: string;
  submitLabel?: string;
}

export function HoldingFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  presetName,
  title,
  submitLabel,
}: HoldingFormModalProps) {
  const lockedName = initial?.name ?? presetName ?? "";
  const isLocked = Boolean(initial || presetName);
  const [name, setName] = useState(lockedName);
  const [query, setQuery] = useState(lockedName);
  const [qty, setQty] = useState<string>(initial ? String(initial.qty) : "");
  const [avgCost, setAvgCost] = useState<string>(initial ? String(initial.avgCost) : "");
  const [showSuggest, setShowSuggest] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setName(lockedName);
    setQuery(lockedName);
    setQty(initial ? String(initial.qty) : "");
    setAvgCost(initial ? String(initial.avgCost) : "");
    setShowSuggest(false);
  }, [open, initial, lockedName]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const suggestions = useMemo(() => {
    if (initial) return [];
    return searchStocks(query, 6);
  }, [query, initial]);

  const stock = useMemo(() => findStock(name), [name]);

  if (!open) return null;

  const effectiveName = name || query.trim();
  const qtyNum = Number(qty);
  const costNum = Number(avgCost);
  const valid = effectiveName.length > 0 && qtyNum > 0 && costNum > 0;

  function applyMarketPrice() {
    if (stock?.price) setAvgCost(String(stock.price));
  }

  function submit() {
    if (!valid) return;
    onSubmit({ name: effectiveName, qty: qtyNum, avgCost: costNum });
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center px-4"
      style={{ background: "rgba(15, 23, 42, 0.45)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        // 스크림 위에 뜬 다이얼로그 — 그림자 한 겹으로는 배경에서 떨어지지 않는다
        className="bm-card w-full max-w-md rounded-2xl overflow-hidden shadow-[0_24px_60px_-12px_rgba(0,0,0,0.45),0_8px_20px_-8px_rgba(0,0,0,0.3)]"
        style={{ border: "1px solid var(--bm-border)" }}
      >
        <header
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: "1px solid var(--bm-border)" }}
        >
          <h3 className="font-extrabold text-[15px]">
            {title ?? (initial ? "보유 종목 수정" : "보유 종목 추가")}
          </h3>
          {!initial && presetName ? <span className="sr-only">{presetName}</span> : null}
          <button
            type="button"
            aria-label="close"
            onClick={onClose}
            className="grid place-items-center size-7 rounded-full cursor-pointer transition-colors duration-150 hover:bg-[color:var(--bm-soft-100)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--bm-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bm-card)]"
            style={{ color: "var(--bm-muted)" }}
          >
            <AppIcon name="close" size={16} strokeWidth={2.2} />
          </button>
        </header>

        <div className="p-5 space-y-4">
          <div className="space-y-1.5 relative">
            <label className="text-[11.5px] font-bold" style={{ color: "var(--bm-muted)" }}>
              종목
            </label>
            <input
              type="text"
              value={query}
              disabled={isLocked}
              placeholder="종목명 입력 (예: 삼성전자)"
              onChange={(e) => {
                setQuery(e.target.value);
                setName("");
                setShowSuggest(true);
              }}
              onFocus={() => setShowSuggest(true)}
              onBlur={() => setTimeout(() => setShowSuggest(false), 120)}
              // outline-none 만 걸려 있어 포커스가 어디 있는지 전혀 보이지 않았다 — 링으로 되돌려 준다
              className="w-full px-3 h-10 rounded-lg outline-none text-[13.5px] font-bold transition-shadow duration-150 focus-visible:ring-2 focus-visible:ring-[color:var(--bm-accent)]"
              style={{
                background: isLocked ? "var(--bm-soft-100)" : "var(--bm-card)",
                border: "1px solid var(--bm-border)",
              }}
            />
            {showSuggest && !isLocked && suggestions.length > 0 ? (
              <ul
                // 다이얼로그 안에서 한 겹 더 떠 있는 목록 — shadow-lg 한 겹으로는 폼과 겹쳐 보인다
                className="absolute left-0 right-0 mt-1 max-h-[240px] overflow-y-auto overscroll-contain rounded-xl z-10 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.4),0_4px_10px_-4px_rgba(0,0,0,0.25)]"
                style={{ background: "var(--bm-card)", border: "1px solid var(--bm-border)" }}
              >
                {suggestions.map((s) => (
                  <li key={s.name}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setName(s.name);
                        setQuery(s.name);
                        if (s.price && !avgCost) setAvgCost(String(s.price));
                        setShowSuggest(false);
                      }}
                      className="w-full px-3 py-2 flex items-center justify-between gap-2 cursor-pointer transition-colors duration-150 hover:bg-[color:var(--bm-soft-100)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--bm-accent)]"
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-[13px] truncate">{s.name}</span>
                        {s.sector ? (
                          <span
                            className="text-[11px] truncate"
                            style={{ color: "var(--bm-muted)" }}
                          >
                            · {s.sector}
                          </span>
                        ) : null}
                      </span>
                      <span
                        className="bm-num text-[12px] font-semibold shrink-0"
                        style={{ color: "var(--bm-muted)" }}
                      >
                        {s.price ? s.price.toLocaleString("ko-KR") : "—"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            {name && stock?.sector ? (
              <div className="text-[11px] font-semibold" style={{ color: "var(--bm-muted)" }}>
                선택됨:{" "}
                <span className="font-bold" style={{ color: "var(--bm-text)" }}>
                  {name}
                </span>{" "}
                · {stock.sector}
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11.5px] font-bold" style={{ color: "var(--bm-muted)" }}>
                수량 (주)
              </label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="0"
                className="w-full px-3 h-10 rounded-lg outline-none text-right bm-num font-bold text-[13.5px] tabular-nums transition-shadow duration-150 focus-visible:ring-2 focus-visible:ring-[color:var(--bm-accent)]"
                style={{ background: "var(--bm-card)", border: "1px solid var(--bm-border)" }}
              />
            </div>
            <div className="space-y-1.5">
              <label
                className="text-[11.5px] font-bold flex items-center justify-between"
                style={{ color: "var(--bm-muted)" }}
              >
                <span>평균 단가 (원)</span>
                {stock?.price ? (
                  <button
                    type="button"
                    onClick={applyMarketPrice}
                    className="text-[10.5px] font-bold cursor-pointer rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--bm-accent)]"
                    style={{ color: "var(--bm-accent-strong)" }}
                  >
                    현재가로 채우기
                  </button>
                ) : null}
              </label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={avgCost}
                onChange={(e) => setAvgCost(e.target.value)}
                placeholder="0"
                className="w-full px-3 h-10 rounded-lg outline-none text-right bm-num font-bold text-[13.5px] tabular-nums transition-shadow duration-150 focus-visible:ring-2 focus-visible:ring-[color:var(--bm-accent)]"
                style={{ background: "var(--bm-card)", border: "1px solid var(--bm-border)" }}
              />
            </div>
          </div>

          {qtyNum > 0 && costNum > 0 ? (
            <div
              className="rounded-lg px-3 py-2.5 flex items-center justify-between"
              style={{ background: "var(--bm-soft-100)" }}
            >
              <span className="text-[12px] font-bold" style={{ color: "var(--bm-muted)" }}>
                매입금액
              </span>
              <span className="bm-num font-extrabold text-[15px]">
                {Math.round(qtyNum * costNum).toLocaleString("ko-KR")} 원
              </span>
            </div>
          ) : null}
        </div>

        <footer
          className="px-5 py-3.5 flex items-center justify-end gap-2"
          style={{ borderTop: "1px solid var(--bm-border)", background: "var(--bm-soft-100)" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-9 rounded-lg text-[13px] font-bold cursor-pointer transition-colors duration-150 hover:bg-[color:var(--bm-soft-200)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--bm-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bm-soft-100)]"
            style={{ background: "var(--bm-card)", border: "1px solid var(--bm-border)" }}
          >
            취소
          </button>
          <button
            type="button"
            disabled={!valid}
            onClick={submit}
            className="px-4 h-9 rounded-lg text-[13px] font-bold transition-[filter,opacity] duration-150 enabled:cursor-pointer enabled:hover:brightness-110 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--bm-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bm-soft-100)]"
            style={{
              background: valid ? "var(--bm-accent-strong)" : "var(--bm-muted)",
              color: "var(--bm-card)",
              opacity: valid ? 1 : 0.6,
            }}
          >
            {submitLabel ?? (initial ? "저장" : "추가")}
          </button>
        </footer>
      </div>
    </div>
  );
}
