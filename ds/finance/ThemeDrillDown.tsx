"use client";

import { useEffect, useMemo } from "react";
import { AppIcon } from "./AppIcon";
import type { DailyThemeEntry } from "./lib/dailyThemes";

interface ThemeDrillDownProps {
  theme: string | null;
  entries: DailyThemeEntry[];
  onClose: () => void;
  onPickDay?: (entry: DailyThemeEntry) => void;
}

export function ThemeDrillDown({ theme, entries, onClose, onPickDay }: ThemeDrillDownProps) {
  useEffect(() => {
    if (!theme) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [theme, onClose]);

  const stats = useMemo(() => {
    if (!theme) return null;
    const matches = entries.filter((e) => e.themes.includes(theme));
    if (matches.length === 0) return null;
    const avgKospi = matches.reduce((s, m) => s + m.코스피변동, 0) / matches.length;
    const avgVolume = matches.reduce((s, m) => s + m.거래대금변동, 0) / matches.length;
    const upDays = matches.filter((m) => m.코스피변동 > 0).length;
    const leaderAgg = new Map<string, { count: number; pctSum: number; lastClose: number }>();
    matches.forEach((m) =>
      m.leaders?.forEach((l) => {
        const cur = leaderAgg.get(l.name) ?? { count: 0, pctSum: 0, lastClose: l.close };
        cur.count += 1;
        cur.pctSum += l.pct;
        cur.lastClose = l.close;
        leaderAgg.set(l.name, cur);
      }),
    );
    const leaders = [...leaderAgg.entries()]
      .map(([name, v]) => ({
        name,
        count: v.count,
        avgPct: v.pctSum / v.count,
        lastClose: v.lastClose,
      }))
      .sort((a, b) => b.count - a.count || b.avgPct - a.avgPct);
    return { matches, avgKospi, avgVolume, upDays, leaders };
  }, [theme, entries]);

  if (!theme) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(15,23,42,0.45)" }}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${theme} 테마 분석`}
        className="fixed top-1/2 left-1/2 z-50 w-[560px] max-w-[95vw] max-h-[85vh] overflow-y-auto overscroll-contain rounded-2xl"
        style={{
          transform: "translate(-50%, -50%)",
          background: "var(--bm-card)",
          border: "1px solid var(--bm-border)",
          // 한 겹 그림자는 스크림 위에서 떠 보이지 않는다 — 넓은 겹 + 좁은 겹 + 상단 인셋
          boxShadow:
            "0 24px 60px -20px rgba(15,23,42,0.45), 0 8px 20px -8px rgba(15,23,42,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        <header
          className="px-4 py-3 flex items-center gap-2 sticky top-0 z-10"
          style={{ background: "var(--bm-card)", borderBottom: "1px solid var(--bm-border)" }}
        >
          <span
            className="text-[14px] font-extrabold rounded-full px-3 py-1 truncate"
            style={{
              // 글자색과 같은 accent 에서 파생시킨다 — 고정 teal rgba 는 강조색을 바꾸면 어긋난다
              background: "color-mix(in srgb, var(--bm-accent-strong) 12%, transparent)",
              color: "var(--bm-accent-strong)",
              border: "1px solid color-mix(in srgb, var(--bm-accent-strong) 32%, transparent)",
            }}
          >
            #{theme}
          </span>
          <span className="text-[13px] font-extrabold ml-1 shrink-0 whitespace-nowrap">
            테마 분석
          </span>
          <button
            type="button"
            onClick={onClose}
            className={[
              "ml-auto size-8 shrink-0 rounded-full grid place-items-center cursor-pointer",
              // 배경이 인라인 스타일이라 hover:bg-* 는 먹지 않는다 — 이 디렉터리 관례대로 밝기로 반응한다
              "transition-[filter,transform] duration-150 hover:brightness-95 active:scale-95 motion-reduce:active:scale-100",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--bm-accent-strong)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bm-card)]",
            ].join(" ")}
            style={{ background: "var(--bm-soft-100)", color: "var(--bm-muted)" }}
            aria-label="닫기"
          >
            ✕
          </button>
        </header>

        {!stats ? (
          <div className="p-6 text-center text-[12px]" style={{ color: "var(--bm-muted)" }}>
            데이터 없음
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-2 p-4">
              <Stat label="등장일" value={`${stats.matches.length}일`} />
              <Stat
                label="평균 코스피"
                value={`${stats.avgKospi >= 0 ? "+" : ""}${stats.avgKospi.toFixed(2)}%`}
                tone={stats.avgKospi >= 0 ? "up" : "down"}
              />
              <Stat
                label="평균 거래대금"
                value={`${stats.avgVolume >= 0 ? "+" : ""}${stats.avgVolume.toFixed(2)}%`}
                tone={stats.avgVolume >= 0 ? "up" : "down"}
              />
              <Stat label="상승일" value={`${stats.upDays}/${stats.matches.length}`} />
            </div>

            <section className="px-4 pb-3">
              <SectionTitle title={`등장 일자 (${stats.matches.length}일)`} />
              <ul
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid var(--bm-border)" }}
              >
                {stats.matches.map((m, i) => {
                  const day = Number(m.date.split("-")[2]);
                  const month = Number(m.date.split("-")[1]);
                  const wd = ["일", "월", "화", "수", "목", "금", "토"][m.weekday];
                  const up = m.코스피변동 >= 0;
                  return (
                    <li
                      key={m.date}
                      className={
                        onPickDay
                          ? "px-3 py-2 grid items-center gap-2 transition-[filter] duration-150 hover:brightness-95"
                          : "px-3 py-2 grid items-center gap-2"
                      }
                      style={{
                        gridTemplateColumns: "70px 1fr auto",
                        borderBottom:
                          i === stats.matches.length - 1 ? "none" : "1px solid var(--bm-border)",
                        background: i % 2 === 0 ? "transparent" : "var(--bm-soft-100)",
                        cursor: onPickDay ? "pointer" : "default",
                      }}
                      onClick={onPickDay ? () => onPickDay(m) : undefined}
                    >
                      <span className="bm-num font-extrabold text-[12px]">
                        {String(month).padStart(2, "0")}/{String(day).padStart(2, "0")} ({wd})
                      </span>
                      <div className="flex flex-wrap items-center gap-1 min-w-0">
                        {m.themes.slice(0, 4).map((t) => (
                          <span
                            key={t}
                            className="text-[9.5px] font-extrabold rounded-full px-1.5 py-[1px] whitespace-nowrap"
                            style={{
                              background:
                                t === theme
                                  ? "color-mix(in srgb, var(--bm-accent-strong) 18%, transparent)"
                                  : "var(--bm-soft-100)",
                              color: t === theme ? "var(--bm-accent-strong)" : "var(--bm-muted)",
                              border:
                                t === theme
                                  ? "1px solid color-mix(in srgb, var(--bm-accent-strong) 36%, transparent)"
                                  : "1px solid var(--bm-border)",
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <span
                        className="bm-num font-extrabold text-[12px]"
                        style={{ color: up ? "var(--bm-up)" : "var(--bm-down)" }}
                      >
                        {up ? "+" : ""}
                        {m.코스피변동.toFixed(2)}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>

            {stats.leaders.length > 0 ? (
              <section className="px-4 pb-4">
                <SectionTitle title="관련 왕관 종목" />
                <ul
                  className="rounded-xl overflow-hidden"
                  style={{ border: "1px solid var(--bm-border)" }}
                >
                  {stats.leaders.map((l, i) => {
                    const up = l.avgPct >= 0;
                    return (
                      <li
                        key={l.name}
                        className="px-3 py-2 grid items-center"
                        style={{
                          gridTemplateColumns: "auto 1fr auto auto",
                          gap: 10,
                          borderBottom:
                            i === stats.leaders.length - 1 ? "none" : "1px solid var(--bm-border)",
                          background: i % 2 === 0 ? "transparent" : "var(--bm-soft-100)",
                        }}
                      >
                        <AppIcon
                          name="crown"
                          size={13}
                          strokeWidth={2.4}
                          color="var(--bm-warning)"
                        />
                        <span className="font-extrabold text-[12.5px] truncate">{l.name}</span>
                        <span
                          className="bm-num text-[10.5px] font-bold"
                          style={{ color: "var(--bm-muted)" }}
                        >
                          {l.count}회 등장
                        </span>
                        <div className="flex flex-col items-end leading-tight">
                          <span className="bm-num font-extrabold text-[12px]">
                            {l.lastClose.toLocaleString("ko-KR")}
                          </span>
                          <span
                            className="bm-num font-extrabold text-[10.5px]"
                            style={{ color: up ? "var(--bm-up)" : "var(--bm-down)" }}
                          >
                            평균 {up ? "+" : ""}
                            {l.avgPct.toFixed(2)}%
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}
          </>
        )}
      </div>
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

function Stat({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  const color =
    tone === "up" ? "var(--bm-up)" : tone === "down" ? "var(--bm-down)" : "var(--bm-text)";
  return (
    <div
      className="px-2.5 py-2 rounded-xl"
      style={{ background: "var(--bm-soft-100)", border: "1px solid var(--bm-border)" }}
    >
      <div className="text-[10px] font-extrabold" style={{ color: "var(--bm-muted)" }}>
        {label}
      </div>
      <div className="bm-num font-extrabold text-[13px] mt-0.5" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
