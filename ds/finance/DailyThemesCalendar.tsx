"use client";

import { useState } from "react";
import { AppIcon } from "./AppIcon";
import { DayDetailDrawer } from "./DayDetailDrawer";
import { ThemeDrillDown } from "./ThemeDrillDown";
import { holidayName } from "./lib/marketHolidays";
import type { DailyThemeEntry } from "./lib/dailyThemes";

const THEME_COLORS = [
  "var(--bm-cat-1)", "var(--bm-cat-2)", "var(--bm-cat-3)", "var(--bm-cat-4)",
  "var(--bm-cat-5)", "var(--bm-cat-6)", "var(--bm-cat-7)", "var(--bm-cat-8)",
];

function colorFor(theme: string): string {
  let h = 0;
  for (let i = 0; i < theme.length; i++) h = (h * 31 + theme.charCodeAt(i)) | 0;
  return THEME_COLORS[Math.abs(h) % THEME_COLORS.length];
}

function fmtMoney(won: number): string {
  if (won >= 100_000_000) return `${(won / 100_000_000).toFixed(2)}억`;
  if (won >= 10_000) return `${Math.round(won / 10_000).toLocaleString("ko-KR")}만`;
  return won.toLocaleString("ko-KR");
}

export function DailyThemesCalendar({
  weeks,
  allEntries,
}: {
  weeks: DailyThemeEntry[][];
  allEntries: DailyThemeEntry[];
}) {
  const [selectedDay, setSelectedDay] = useState<DailyThemeEntry | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--bm-card)", border: "1px solid var(--bm-border)" }}
      >
        <div
          className="grid text-center text-[12px] font-extrabold tracking-[0.06em]"
          style={{
            gridTemplateColumns: "repeat(5, 1fr) 150px",
            background: "var(--bm-soft-100)",
            borderBottom: "1px solid var(--bm-border)",
            color: "var(--bm-muted)",
          }}
        >
          {["월", "화", "수", "목", "금"].map((d) => (
            <span key={d} className="py-2.5">
              {d}
            </span>
          ))}
          <span
            className="py-2.5"
            style={{
              borderLeft: "1px solid var(--bm-border)",
              color: "var(--bm-accent-strong)",
            }}
          >
            주간 요약
          </span>
        </div>

        {weeks.map((week, wi) => (
          <div
            key={wi}
            className="grid"
            style={{
              gridTemplateColumns: "repeat(5, 1fr) 150px",
              borderBottom: wi === weeks.length - 1 ? "none" : "1px solid var(--bm-border)",
            }}
          >
            {Array.from({ length: 5 }).map((_, ci) => {
              const entry = week.find((e) => e.weekday === ci + 1);
              if (!entry) {
                return (
                  <div
                    key={ci}
                    style={{ borderRight: "1px solid var(--bm-border)" }}
                  />
                );
              }
              return (
                <DayCell
                  key={entry.date}
                  entry={entry}
                  onPick={() => setSelectedDay(entry)}
                  onPickTheme={(t) => setSelectedTheme(t)}
                />
              );
            })}
            <WeekSummary week={week} onPickTheme={(t) => setSelectedTheme(t)} />
          </div>
        ))}
      </div>

      <DayDetailDrawer entry={selectedDay} onClose={() => setSelectedDay(null)} />
      <ThemeDrillDown
        theme={selectedTheme}
        entries={allEntries}
        onClose={() => setSelectedTheme(null)}
        onPickDay={(d) => {
          setSelectedTheme(null);
          setSelectedDay(d);
        }}
      />
    </>
  );
}

function DayCell({
  entry,
  onPick,
  onPickTheme,
}: {
  entry: DailyThemeEntry;
  onPick: () => void;
  onPickTheme: (theme: string) => void;
}) {
  const day = Number(entry.date.split("-")[2]);
  const isFuture = !entry.isToday && !entry.isHoliday && entry.kospiClose === 0;

  if (entry.isHoliday) {
    const name = holidayName(entry.date);
    return (
      <div
        className="px-3 py-3 min-h-[170px] flex flex-col items-center justify-center"
        style={{
          borderRight: "1px solid var(--bm-border)",
          background: "var(--bm-soft-100)",
          opacity: 0.85,
        }}
      >
        <div className="bm-num text-[12px] font-bold" style={{ color: "var(--bm-muted)" }}>
          {day}
        </div>
        <div
          className="mt-2 inline-flex items-center gap-1 text-[11px] font-extrabold"
          style={{ color: "var(--bm-down)" }}
        >
          <span className="size-1.5 rounded-full" style={{ background: "var(--bm-down)" }} />
          휴장일
        </div>
        {name ? (
          <div
            className="mt-1 text-[10.5px] font-bold leading-tight text-center px-1"
            style={{ color: "var(--bm-down)" }}
          >
            {name}
          </div>
        ) : null}
      </div>
    );
  }

  if (isFuture) {
    return (
      <div
        className="px-3 py-3 min-h-[170px]"
        style={{ borderRight: "1px solid var(--bm-border)" }}
      >
        <div className="bm-num text-[12px] font-bold" style={{ color: "var(--bm-muted)" }}>
          {day}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative"
      style={{
        borderRight: "1px solid var(--bm-border)",
        padding: entry.isToday ? 6 : 0,
      }}
    >
      <button
        type="button"
        onClick={onPick}
        className="w-full text-left transition-colors hover:bg-[color:var(--bm-soft-100)]"
        style={{
          background: entry.isToday ? "rgba(236,72,153,0.06)" : "transparent",
          border: entry.isToday ? "2px solid #ec4899" : "none",
          borderRadius: entry.isToday ? 12 : 0,
          minHeight: 158,
          padding: "12px",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <header className="flex items-start justify-between">
          <span
            className="bm-num font-extrabold text-[12px] inline-flex items-center justify-center"
            style={{
              color: entry.isToday ? "white" : "var(--bm-text)",
              background: entry.isToday ? "#ec4899" : "transparent",
              padding: entry.isToday ? "2px 8px" : 0,
              borderRadius: entry.isToday ? 999 : 0,
            }}
          >
            {day}
          </span>
          <div className="flex flex-col items-end gap-0.5">
            <PctChip label="거" value={entry.거래대금변동} />
            <PctChip label="코" value={entry.코스피변동} />
          </div>
        </header>

        <div className="space-y-1">
          <DataRow icon="lineChart" label="코스피">
            <span
              className="bm-num font-extrabold text-[11.5px]"
              style={{ color: "var(--bm-text)" }}
            >
              {entry.kospiClose.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}
            </span>
          </DataRow>
          <DataRow icon="wallet" label="평가">
            <span
              className="bm-num font-extrabold text-[11.5px]"
              style={{
                color: entry.portfolio >= 70_000_000 ? "var(--bm-up)" : "var(--bm-text)",
              }}
            >
              {fmtMoney(entry.portfolio)}
            </span>
          </DataRow>
        </div>

        {entry.themes.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {entry.themes.slice(0, 4).map((theme) => {
              const c = colorFor(theme);
              return (
                <span
                  key={theme}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPickTheme(theme);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      e.preventDefault();
                      onPickTheme(theme);
                    }
                  }}
                  className="text-[10px] font-extrabold rounded-full px-2 py-[2px] cursor-pointer hover:brightness-110"
                  style={{
                    background: `color-mix(in srgb, ${c} 10%, transparent)`,
                    color: c,
                    border: `1px solid color-mix(in srgb, ${c} 20%, transparent)`,
                  }}
                >
                  {theme}
                </span>
              );
            })}
          </div>
        ) : null}

        {entry.leaders?.length ? (
          <ul className="space-y-0.5 mt-auto">
            {entry.leaders.map((leader) => {
              const up = leader.pct >= 0;
              return (
                <li
                  key={leader.name}
                  className="text-[10.5px] flex items-center gap-1"
                >
                  <AppIcon name="crown" size={10} strokeWidth={2.4} color="var(--bm-warning)" />
                  <span
                    className="font-bold truncate"
                    style={{ color: "var(--bm-text)" }}
                  >
                    {leader.name}
                  </span>
                  <span
                    className="bm-num font-bold ml-auto whitespace-nowrap"
                    style={{ color: "var(--bm-text)", fontSize: 10 }}
                  >
                    {leader.close.toLocaleString("ko-KR")}
                  </span>
                  <span
                    className="bm-num font-extrabold whitespace-nowrap"
                    style={{
                      color: up ? "var(--bm-up)" : "var(--bm-down)",
                      fontSize: 9.5,
                    }}
                  >
                    {up ? "+" : ""}
                    {leader.pct.toFixed(1)}%
                  </span>
                </li>
              );
            })}
          </ul>
        ) : null}
      </button>
    </div>
  );
}

function PctChip({ label, value }: { label: string; value: number }) {
  const up = value >= 0;
  return (
    <span
      className="bm-num font-bold inline-flex items-center gap-0.5"
      style={{ fontSize: 9.5, color: up ? "var(--bm-up)" : "var(--bm-down)" }}
    >
      <span style={{ color: "var(--bm-muted)" }}>{label}</span>
      {up ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
}

function DataRow({
  icon,
  label,
  children,
}: {
  icon: React.ComponentProps<typeof AppIcon>["name"];
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-1">
      <span
        className="inline-flex items-center gap-1 text-[10px] font-bold"
        style={{ color: "var(--bm-muted)" }}
      >
        <AppIcon name={icon} size={10} strokeWidth={2.2} />
        {label}
      </span>
      {children}
    </div>
  );
}

function WeekSummary({
  week,
  onPickTheme,
}: {
  week: DailyThemeEntry[];
  onPickTheme: (theme: string) => void;
}) {
  const trading = week.filter((e) => !e.isHoliday && e.kospiClose > 0);
  if (trading.length === 0) {
    return (
      <div
        className="px-3 py-3 flex items-center justify-center text-[11px] font-bold"
        style={{
          borderLeft: "1px solid var(--bm-border)",
          color: "var(--bm-muted)",
          background: "var(--bm-soft-100)",
          opacity: 0.7,
        }}
      >
        —
      </div>
    );
  }

  const first = trading[0];
  const last = trading[trading.length - 1];
  const kospiPct = ((last.kospiClose - first.kospiClose) / first.kospiClose) * 100;
  const portfolioPct = first.portfolio
    ? ((last.portfolio - first.portfolio) / first.portfolio) * 100
    : 0;

  const themeCount = new Map<string, number>();
  trading.forEach((d) =>
    d.themes.forEach((t) => themeCount.set(t, (themeCount.get(t) ?? 0) + 1))
  );
  const dominant = [...themeCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([t]) => t);

  const leaderSet = new Map<string, number>();
  trading.forEach((d) =>
    d.leaders?.forEach((l) => leaderSet.set(l.name, (leaderSet.get(l.name) ?? 0) + 1))
  );
  const topLeaders = [...leaderSet.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([n]) => n);

  return (
    <div
      className="px-3 py-3 flex flex-col gap-1.5"
      style={{
        borderLeft: "1px solid var(--bm-border)",
        background: "rgba(13,148,136,0.04)",
      }}
    >
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] font-extrabold" style={{ color: "var(--bm-muted)" }}>
          코스피
        </span>
        <span
          className="bm-num font-extrabold text-[12px]"
          style={{ color: kospiPct >= 0 ? "var(--bm-up)" : "var(--bm-down)" }}
        >
          {kospiPct >= 0 ? "+" : ""}
          {kospiPct.toFixed(2)}%
        </span>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] font-extrabold" style={{ color: "var(--bm-muted)" }}>
          평가
        </span>
        <span
          className="bm-num font-extrabold text-[12px]"
          style={{ color: portfolioPct >= 0 ? "var(--bm-up)" : "var(--bm-down)" }}
        >
          {portfolioPct >= 0 ? "+" : ""}
          {portfolioPct.toFixed(2)}%
        </span>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] font-extrabold" style={{ color: "var(--bm-muted)" }}>
          영업일
        </span>
        <span className="bm-num font-extrabold text-[11px]" style={{ color: "var(--bm-text)" }}>
          {trading.length}일
        </span>
      </div>
      {dominant.length > 0 ? (
        <div className="mt-0.5">
          <div className="text-[9.5px] font-extrabold mb-0.5" style={{ color: "var(--bm-muted)" }}>
            주도 테마
          </div>
          <div className="flex flex-wrap gap-1">
            {dominant.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onPickTheme(t)}
                className="text-[9.5px] font-extrabold rounded-full px-1.5 py-[1px] hover:brightness-110"
                style={{
                  background: "color-mix(in srgb, var(--bm-accent-strong) 10%, transparent)",
                  color: "var(--bm-accent-strong)",
                  border: "1px solid color-mix(in srgb, var(--bm-accent-strong) 24%, transparent)",
                  cursor: "pointer",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {topLeaders.length > 0 ? (
        <div>
          <div className="text-[9.5px] font-extrabold mb-0.5" style={{ color: "var(--bm-muted)" }}>
            왕관 종목
          </div>
          <ul className="space-y-0.5">
            {topLeaders.map((n) => (
              <li
                key={n}
                className="text-[10px] font-bold flex items-center gap-1 truncate"
                style={{ color: "var(--bm-text)" }}
              >
                <AppIcon name="crown" size={9} strokeWidth={2.4} color="var(--bm-warning)" />
                {n}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
