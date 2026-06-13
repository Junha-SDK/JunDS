"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ConsensusRow } from "./lib/consensus";
import { INVESTORS, INVESTOR_LIST } from "./lib/investors";
import type { InvestorId } from "./lib/investors";
import { AppIcon } from "./AppIcon";

interface ConsensusScreenerProps {
  rows: ConsensusRow[];
  /** When provided, restrict the filter chips to this id list */
  bullishness?: Record<InvestorId, number>;
}

type SortKey = "avgScore" | "bullCount" | "topScore" | "change";

const SORT_LABELS: Record<SortKey, string> = {
  avgScore: "평균 점수",
  bullCount: "매수 인원",
  topScore: "최고 점수",
  change: "오늘 등락률",
};

export function ConsensusScreener({ rows, bullishness }: ConsensusScreenerProps) {
  const [minBulls, setMinBulls] = useState(0);
  const [sort, setSort] = useState<SortKey>("avgScore");
  const [filterInvestor, setFilterInvestor] = useState<InvestorId | "all">("all");

  const filtered = useMemo(() => {
    let r = rows.filter((row) => row.bullCount >= minBulls);
    if (filterInvestor !== "all") {
      r = r.filter((row) => row.bulls.includes(filterInvestor));
    }
    r = [...r].sort((a, b) => {
      if (sort === "bullCount") return b.bullCount - a.bullCount || b.avgScore - a.avgScore;
      if (sort === "topScore") return b.topScore - a.topScore;
      if (sort === "change") return b.change - a.change;
      return b.avgScore - a.avgScore;
    });
    return r;
  }, [rows, minBulls, sort, filterInvestor]);

  return (
    <section className="bm-card-lg overflow-hidden">
      {/* Filter strip */}
      <div className="bm-section-head flex-wrap gap-3">
        <div className="bm-section-title">
          <AppIcon name="sparkles" size={14} strokeWidth={2.4} color="var(--bm-accent-strong)" />
          위원회 합의 스크리너
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            aria-label="정렬 기준"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="text-[12px] font-bold rounded-md px-2 h-7 outline-none"
            style={{
              background: "var(--bm-soft-100)",
              border: "1px solid var(--bm-border)",
              color: "var(--bm-text)",
            }}
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
              <option key={k} value={k}>
                {SORT_LABELS[k]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bull-count slider */}
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ borderBottom: "1px solid var(--bm-border)" }}
      >
        <span
          className="text-[11px] font-extrabold tracking-wide uppercase"
          style={{ color: "var(--bm-muted)" }}
        >
          최소 ▲ 인원
        </span>
        <div className="flex items-center gap-1.5">
          {[0, 3, 5, 6, 7, 8].map((n) => (
            <button
              key={n}
              onClick={() => setMinBulls(n)}
              className="h-7 min-w-[34px] rounded-md text-[12px] font-extrabold transition-colors"
              style={{
                background: minBulls === n ? "var(--bm-accent-strong)" : "var(--bm-soft-100)",
                // on-accent: accent-strong 은 다크모드 거의 흰색 — #fff 면 글씨 소실 (라이트 동일).
                color: minBulls === n ? "var(--bm-on-accent)" : "var(--bm-text)",
                border: `1px solid ${minBulls === n ? "var(--bm-accent-strong)" : "var(--bm-border)"}`,
              }}
            >
              {n === 0 ? "전체" : `${n}+`}
            </button>
          ))}
        </div>
        <span
          className="ml-auto text-[11.5px] bm-num"
          style={{ color: "var(--bm-muted)" }}
        >
          {filtered.length}개 종목
        </span>
      </div>

      {/* Investor chip row */}
      <div
        className="px-4 py-2.5 flex items-center gap-2 overflow-x-auto bm-scroll-x"
        style={{ borderBottom: "1px solid var(--bm-border)" }}
      >
        <button
          onClick={() => setFilterInvestor("all")}
          className="bm-chip shrink-0"
          style={{
            background: filterInvestor === "all" ? "var(--bm-accent-soft-bg)" : "var(--bm-soft-100)",
            color: filterInvestor === "all" ? "var(--bm-accent-strong)" : "var(--bm-text)",
            borderColor: filterInvestor === "all" ? "var(--bm-accent)" : "transparent",
          }}
        >
          전체 위원
        </button>
        {INVESTOR_LIST.map((inv) => {
          const isOn = filterInvestor === inv.id;
          const count = bullishness?.[inv.id];
          return (
            <button
              key={inv.id}
              onClick={() => setFilterInvestor(inv.id)}
              className="bm-chip shrink-0"
              title={`${inv.name} 매수 의견 종목만 보기`}
              style={{
                background: isOn ? "var(--bm-accent-soft-bg)" : "var(--bm-soft-100)",
                color: isOn ? "var(--bm-accent-strong)" : "var(--bm-text)",
                borderColor: isOn ? "var(--bm-accent)" : "transparent",
              }}
            >
              <span aria-hidden>{inv.emoji}</span>
              <span>{inv.name.split(" ").slice(-1)[0]}</span>
              {count != null ? (
                <span
                  className="bm-num text-[10px] font-extrabold"
                  style={{ opacity: 0.7 }}
                >
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bm-empty">
          <div className="bm-empty-icon">
            <AppIcon name="search" size={20} strokeWidth={2} color="var(--bm-muted)" />
          </div>
          <div className="bm-empty-title">조건에 맞는 종목이 없습니다</div>
          <div className="bm-empty-desc">필터를 완화해 보세요.</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="bm-table text-[13px]">
            <thead>
              <tr>
                <th>종목</th>
                <th>현재가</th>
                <th>등락률</th>
                <th>PER</th>
                <th>ROE</th>
                <th>▲ 매수</th>
                <th>▼ 매도</th>
                <th>평균 점수</th>
                <th>지지자</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.name}>
                  <td>
                    <Link
                      href={`/stock/${encodeURIComponent(row.name)}/investor`}
                      className="font-extrabold hover:underline"
                    >
                      {row.name}
                    </Link>
                    {row.sector ? (
                      <span
                        className="ml-1.5 text-[10.5px] font-bold"
                        style={{ color: "var(--bm-muted)" }}
                      >
                        {row.sector}
                      </span>
                    ) : null}
                  </td>
                  <td className="bm-num">{row.price.toLocaleString("ko-KR")}</td>
                  <td
                    className="bm-num font-bold"
                    style={{ color: row.change >= 0 ? "var(--bm-up)" : "var(--bm-down)" }}
                  >
                    {row.change >= 0 ? "+" : ""}
                    {row.change.toFixed(2)}%
                  </td>
                  <td className="bm-num bm-td-muted">{row.per?.toFixed(1) ?? "—"}</td>
                  <td className="bm-num bm-td-muted">
                    {row.roe != null ? `${row.roe.toFixed(1)}%` : "—"}
                  </td>
                  <td className="bm-num font-extrabold" style={{ color: "var(--bm-up)" }}>
                    {row.bullCount}
                  </td>
                  <td
                    className="bm-num font-bold"
                    style={{ color: row.bearCount > 0 ? "var(--bm-down)" : "var(--bm-muted)" }}
                  >
                    {row.bearCount}
                  </td>
                  <td className="bm-num font-extrabold">{row.avgScore.toFixed(2)}</td>
                  <td>
                    <div className="flex items-center gap-0.5 justify-end">
                      {row.bulls.slice(0, 8).map((id) => (
                        <span
                          key={id}
                          title={INVESTORS[id].name}
                          className="text-[14px] leading-none"
                        >
                          {INVESTORS[id].emoji}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
