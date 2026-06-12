"use client";

import { useMemo, useState } from "react";
import { Tag, Timeline, type TimelineItem } from "@junds/ui";
import { AppIcon } from "./AppIcon";
import { DisclosureToneBadge } from "./DisclosureToneBadge";
import type { Disclosure } from "./lib/financials";
import { classifyDisclosure } from "./lib/disclosureTone";

const TONES: Record<
  Disclosure["category"],
  "primary" | "success" | "warning" | "danger" | "neutral"
> = {
  정기: "primary",
  수시: "warning",
  주요사항: "danger",
  지분: "success",
  기타: "neutral",
};

const TAG_COLORS: Record<
  Disclosure["category"],
  "blue" | "orange" | "red" | "green" | "gray"
> = {
  정기: "blue",
  수시: "orange",
  주요사항: "red",
  지분: "green",
  기타: "gray",
};

const PALETTE: Record<Disclosure["category"], string> = {
  정기: "#3b82f6",
  수시: "#f59e0b",
  주요사항: "#ef4444",
  지분: "#16a34a",
  기타: "#94a3b8",
};

const ICONS: Record<Disclosure["category"], string> = {
  정기: "📋",
  수시: "📰",
  주요사항: "⚠️",
  지분: "👥",
  기타: "📎",
};

const FILTERS: Disclosure["category"][] = [
  "정기",
  "수시",
  "주요사항",
  "지분",
  "기타",
];

export function DisclosuresClient({
  items,
  symbol,
}: {
  items: Disclosure[];
  symbol: string;
}) {
  const [filter, setFilter] = useState<Disclosure["category"] | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((d) => {
      if (filter !== "all" && d.category !== filter) return false;
      if (q && !d.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [filter, items, query]);

  const recent = items.slice(0, 30).filter((d) => {
    const t = new Date(d.date).getTime();
    return Date.now() - t < 30 * 86400_000;
  }).length;

  const major = items.filter((d) => d.category === "주요사항").length;

  const timelineItems: TimelineItem[] = filtered.map((d) => {
    const tone = classifyDisclosure(d.title);
    return {
      key: d.id,
      title: d.title,
      description: (
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <Tag color={TAG_COLORS[d.category]}>{d.category}</Tag>
          {tone.confidence > 0 ? (
            <DisclosureToneBadge classification={tone} compact />
          ) : null}
          <span className="text-[11px]" style={{ color: "var(--bm-muted)" }}>
            {symbol}
          </span>
          <span className="text-[11px]" style={{ color: "var(--bm-muted)" }}>
            공시 ID: {d.id}
          </span>
        </div>
      ),
      time: d.date,
      color: TONES[d.category],
    };
  });

  return (
    <>
      {/* 요약 카드 */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-1">
        <SummaryCard
          icon="📑"
          label="전체 공시"
          value={items.length}
          accent="#0d9488"
        />
        <SummaryCard
          icon="🆕"
          label="최근 30일"
          value={recent}
          accent="#0ea5e9"
        />
        <SummaryCard
          icon="⚠️"
          label="주요사항"
          value={major}
          accent="#ef4444"
        />
        <SummaryCard
          icon="🔍"
          label="현재 필터"
          value={filtered.length}
          accent="#f59e0b"
          hint={filter === "all" ? "전체" : filter}
        />
      </section>

      {/* 검색 */}
      <section className="bm-card mt-3 p-2 flex items-center gap-2">
        <AppIcon
          name="search"
          size={14}
          strokeWidth={2.2}
          color="var(--bm-muted)"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="공시 제목으로 검색…"
          className="flex-1 bg-transparent outline-none text-[13px] py-1.5 placeholder:text-[color:var(--bm-muted)]"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="px-2 py-1 rounded-full text-[11px] font-bold"
            style={{
              background: "var(--bm-soft-100)",
              color: "var(--bm-muted)",
            }}
          >
            <AppIcon name="close" size={12} strokeWidth={2.2} />
          </button>
        ) : null}
      </section>

      {/* 분류별 칩 */}
      <div className="mt-3 flex items-center gap-2 bm-scroll-x">
        <FilterChip
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label="전체"
          count={items.length}
        />
        {FILTERS.map((f) => {
          const count = items.filter((d) => d.category === f).length;
          return (
            <FilterChip
              key={f}
              active={filter === f}
              onClick={() => setFilter(f)}
              label={f}
              count={count}
              icon={ICONS[f]}
              accent={PALETTE[f]}
            />
          );
        })}
      </div>

      <section className="bm-card mt-3 px-4 py-4">
        {timelineItems.length === 0 ? (
          <div className="py-10 text-center">
            <div className="text-[28px]">🔍</div>
            <p
              className="text-[13px] font-bold mt-1.5"
              style={{ color: "var(--bm-text)" }}
            >
              해당 조건의 공시가 없습니다.
            </p>
            <p
              className="text-[11.5px] mt-0.5"
              style={{ color: "var(--bm-muted)" }}
            >
              검색어를 비우거나 다른 분류를 선택해보세요.
            </p>
          </div>
        ) : (
          <Timeline items={timelineItems} lineStyle="solid" />
        )}
      </section>

      <p className="mt-3 text-[11px] text-[color:var(--bm-muted)] px-1 leading-relaxed">
        실제 공시는 DART(전자공시시스템)에서 확인하실 수 있습니다. 본 페이지는
        데모용 결정적 mock 데이터입니다.
      </p>
    </>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  accent,
  hint,
}: {
  icon: string;
  label: string;
  value: number;
  accent: string;
  hint?: string;
}) {
  return (
    <div
      className="bm-card px-4 py-3 flex items-center gap-3"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <span
        className="inline-flex items-center justify-center rounded-xl shrink-0"
        style={{
          width: 36,
          height: 36,
          background: `${accent}1F`,
          fontSize: 18,
        }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <div
          className="text-[10.5px] font-bold truncate"
          style={{ color: "var(--bm-muted)" }}
        >
          {label}
        </div>
        <div className="bm-num font-extrabold text-[18px]" style={{ color: accent }}>
          {value}
          {hint ? (
            <span
              className="ml-1 text-[10.5px] font-bold"
              style={{ color: "var(--bm-muted)" }}
            >
              {hint}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  count,
  icon,
  accent,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count: number;
  icon?: string;
  accent?: string;
}) {
  const baseColor = accent ?? "var(--bm-text)";
  return (
    <button
      type="button"
      onClick={onClick}
      className="bm-pill shrink-0 font-bold inline-flex items-center gap-1.5 transition-colors"
      style={{
        background: active
          ? accent
            ? `${accent}`
            : "var(--bm-text)"
          : "var(--bm-card)",
        color: active ? "white" : baseColor,
        border: active
          ? "none"
          : `1px solid ${accent ? `${accent}55` : "var(--bm-border)"}`,
        padding: "6px 12px",
        fontSize: 12,
      }}
    >
      {icon ? <span className="text-[13px]">{icon}</span> : null}
      {label}
      <span
        className="bm-num font-extrabold text-[10.5px]"
        style={{ opacity: 0.85 }}
      >
        {count}
      </span>
    </button>
  );
}
