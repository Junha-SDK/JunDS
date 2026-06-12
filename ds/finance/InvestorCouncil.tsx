"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { InvestorId, InvestorScoreCard } from "./lib/investors";
import { INVESTORS } from "./lib/investors";
import { AppIcon } from "./AppIcon";

interface InvestorCouncilProps {
  symbol: string;
}

interface ApiResponse {
  symbol: string;
  ticker: string;
  cards: InvestorScoreCard[];
}

export function InvestorCouncil({ symbol }: InvestorCouncilProps) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<InvestorId>("buffett");

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    fetch(`/api/investor?symbol=${encodeURIComponent(symbol)}`)
      .then(async (r) => {
        const json = await r.json();
        if (cancelled) return;
        if (!r.ok) throw new Error(json.error ?? `HTTP ${r.status}`);
        setData(json);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [symbol]);

  if (error) {
    return (
      <section className="bm-card px-4 py-6 text-center">
        <p className="text-[13px] text-[color:var(--bm-muted)]">
          AI 투자자 분석을 불러오지 못했습니다 ({error}).
        </p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="bm-card px-4 py-6">
        <div className="flex items-center justify-center gap-2 text-[12px] text-[color:var(--bm-muted)]">
          <span className="size-2 rounded-full animate-pulse" style={{ background: "#0d9488" }} />
          AI 투자자 위원회 소집 중…
        </div>
      </section>
    );
  }

  const sorted = [...data.cards].sort((a, b) => b.score - a.score);
  const active = data.cards.find((c) => c.investor === activeId) ?? sorted[0];
  const profile = INVESTORS[active.investor];

  const buyers = sorted.filter((c) => c.score >= 0.2).length;
  const sellers = sorted.filter((c) => c.score <= -0.2).length;
  const consensusScore =
    sorted.reduce((s, c) => s + c.score, 0) / Math.max(1, sorted.length);

  return (
    <section className="bm-card overflow-hidden">
      <header
        className="px-4 py-3 flex items-center justify-between flex-wrap gap-2"
        style={{ borderBottom: "1px solid var(--bm-border)" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center justify-center size-7 rounded-lg"
            style={{ background: "var(--bm-accent-soft-bg)", color: "var(--bm-accent-strong)" }}
          >
            <AppIcon name="sparkles" size={14} strokeWidth={2.4} />
          </span>
          <h2 className="font-extrabold text-[14px]">AI 투자자 위원회</h2>
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "var(--bm-soft-100)", color: "var(--bm-muted)" }}
          >
            ButterAI 스타일 · 8명 분석
          </span>
        </div>
        <ConsensusBadge buyers={buyers} sellers={sellers} score={consensusScore} />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside style={{ borderRight: "1px solid var(--bm-border)" }}>
          <ul className="divide-y" style={{ borderColor: "var(--bm-border)" }}>
            {sorted.map((card) => {
              const p = INVESTORS[card.investor];
              const isActive = card.investor === activeId;
              const verdictColor = verdictColorFor(card.verdict);
              return (
                <li key={card.investor}>
                  <button
                    type="button"
                    onClick={() => setActiveId(card.investor)}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 transition-colors"
                    style={{
                      background: isActive ? "var(--bm-soft-100)" : "transparent",
                      borderLeft: isActive
                        ? `3px solid ${p.accent}`
                        : "3px solid transparent",
                    }}
                  >
                    <span
                      className="inline-flex items-center justify-center size-9 rounded-xl text-[18px] shrink-0"
                      style={{
                        background: `${p.accent}1a`,
                        color: p.accent,
                      }}
                    >
                      {p.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-[13.5px] truncate">{p.korean}</div>
                      <div
                        className="text-[10.5px] font-bold truncate"
                        style={{ color: "var(--bm-muted)" }}
                      >
                        {p.tagline}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div
                        className="bm-num font-extrabold text-[12px]"
                        style={{ color: verdictColor }}
                      >
                        {card.verdict}
                      </div>
                      <div
                        className="bm-num text-[10.5px] font-bold"
                        style={{ color: "var(--bm-muted)" }}
                      >
                        점수 {(card.score * 100).toFixed(0)}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="p-5">
          <header className="flex items-start gap-3 mb-4">
            <span
              className="inline-flex items-center justify-center size-12 rounded-2xl text-[26px] shrink-0"
              style={{ background: `${profile.accent}1a`, color: profile.accent }}
            >
              {profile.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2 flex-wrap">
                <h3 className="font-extrabold text-[18px] tracking-tight">{profile.korean}</h3>
                <span className="text-[12px] font-bold" style={{ color: "var(--bm-muted)" }}>
                  {profile.name}
                </span>
              </div>
              <p
                className="text-[11.5px] font-bold mt-0.5"
                style={{ color: profile.accent }}
              >
                {profile.tagline}
              </p>
              <p
                className="text-[11.5px] mt-1 leading-relaxed"
                style={{ color: "var(--bm-muted)" }}
              >
                {profile.koreanContext}
              </p>
            </div>
          </header>

          <div
            className="rounded-xl px-4 py-3 mb-4 flex items-center gap-3"
            style={{
              background: `${verdictColorFor(active.verdict)}14`,
              border: `1px solid ${verdictColorFor(active.verdict)}40`,
            }}
          >
            <div
              className="size-12 rounded-full grid place-items-center text-white"
              style={{ background: verdictColorFor(active.verdict) }}
            >
              <AppIcon
                name={active.score >= 0 ? "trendingUp" : "trendingDown"}
                size={20}
                strokeWidth={2.4}
              />
            </div>
            <div className="flex-1">
              <div
                className="text-[10.5px] font-extrabold tracking-wider uppercase"
                style={{ color: verdictColorFor(active.verdict) }}
              >
                {profile.korean}의 결론
              </div>
              <div
                className="font-extrabold text-[20px] leading-tight"
                style={{ color: verdictColorFor(active.verdict) }}
              >
                {active.verdict}
              </div>
            </div>
            <div className="text-right">
              <Stat
                label="점수"
                value={`${(active.score * 100).toFixed(0)}`}
                tone={active.score >= 0 ? "up" : "down"}
              />
              <Stat
                label="신뢰도"
                value={`${(active.confidence * 100).toFixed(0)}%`}
              />
            </div>
          </div>

          <ComponentBars components={active.components} accent={profile.accent} />

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReasonList
              title="왜 이런 결론을 내렸는가"
              icon="sparkles"
              tone={profile.accent}
              items={active.reasons}
            />
            <ReasonList
              title="유의 사항 / 미스매치"
              icon="alert"
              tone="#f97316"
              items={active.risks}
            />
          </div>

          {active.plan ? (
            <div
              className="mt-4 rounded-xl px-4 py-3"
              style={{
                background: "var(--bm-soft-100)",
                border: "1px solid var(--bm-border)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-extrabold text-[13px] flex items-center gap-1.5">
                  <AppIcon name="target" size={13} strokeWidth={2.4} color={profile.accent} />
                  매매 플랜 (참고용)
                </h4>
                <span
                  className="text-[10.5px] font-extrabold px-2 py-0.5 rounded-full"
                  style={{ background: profile.accent, color: "white" }}
                >
                  {active.plan.horizon}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bm-num">
                <PlanCell label="진입(저)" value={active.plan.entryLow} tone="up" />
                <PlanCell label="진입(고)" value={active.plan.entryHigh} tone="up" />
                <PlanCell label="목표가" value={active.plan.target} tone="up" big />
                <PlanCell label="손절선" value={active.plan.stop} tone="down" />
                <PlanCell label="비중" value={`${active.plan.sizePct}%`} />
              </div>
            </div>
          ) : null}

          <details className="mt-4 group">
            <summary
              className="cursor-pointer text-[11.5px] font-bold inline-flex items-center gap-1"
              style={{ color: "var(--bm-muted)" }}
            >
              <AppIcon name="info" size={12} strokeWidth={2.2} />
              {profile.korean}이 자주 인용하는 말 / 출처
            </summary>
            <ul className="mt-2 space-y-1 text-[11.5px] leading-relaxed pl-4">
              {profile.quotes.map((q) => (
                <li
                  key={q}
                  className="italic"
                  style={{ color: "var(--bm-text-soft)" }}
                >
                  “{q}”
                </li>
              ))}
              <li
                className="text-[10.5px] mt-1.5 not-italic"
                style={{ color: "var(--bm-muted)" }}
              >
                {profile.era} · {profile.source}
              </li>
            </ul>
          </details>

          <p
            className="mt-4 text-[10.5px] leading-relaxed"
            style={{ color: "var(--bm-muted)" }}
          >
            ⚠️ 본 분석은 ButterAI 스타일의 룰 기반 시뮬레이션이며 각 인물의 공개된 투자 철학을 단순 모사한 것입니다. 실제 매수·매도 권유가 아닙니다.{" "}
            <Link href="/investors" className="underline">
              모든 투자자 모드 보기
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

function ConsensusBadge({
  buyers,
  sellers,
  score,
}: {
  buyers: number;
  sellers: number;
  score: number;
}) {
  const tone = score >= 0.2 ? "up" : score <= -0.2 ? "down" : "neutral";
  const color = tone === "up" ? "var(--bm-up)" : tone === "down" ? "var(--bm-down)" : "var(--bm-muted)";
  const label = tone === "up" ? "위원회 매수 우위" : tone === "down" ? "위원회 매도 우위" : "위원회 의견 분분";
  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
      style={{ background: "var(--bm-soft-100)", border: "1px solid var(--bm-border)" }}
    >
      <span
        className="bm-num text-[11px] font-extrabold inline-flex items-center gap-1"
        style={{ color }}
      >
        ▲ {buyers}
      </span>
      <span style={{ color: "var(--bm-border)" }}>·</span>
      <span
        className="bm-num text-[11px] font-extrabold inline-flex items-center gap-1"
        style={{ color: "var(--bm-down)" }}
      >
        ▼ {sellers}
      </span>
      <span className="w-px h-3" style={{ background: "var(--bm-border)" }} />
      <span className="text-[11px] font-extrabold" style={{ color }}>
        {label}
      </span>
    </div>
  );
}

function ComponentBars({
  components,
  accent,
}: {
  components: InvestorScoreCard["components"];
  accent: string;
}) {
  const labels: { key: keyof InvestorScoreCard["components"]; label: string }[] = [
    { key: "valuation", label: "가치" },
    { key: "quality", label: "품질" },
    { key: "growth", label: "성장" },
    { key: "moat", label: "해자" },
    { key: "dividend", label: "배당" },
    { key: "momentum", label: "모멘텀" },
    { key: "risk", label: "리스크" },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
      {labels.map(({ key, label }) => {
        const v = components[key];
        const pct = Math.max(-1, Math.min(1, v));
        const w = Math.abs(pct) * 100;
        const color = pct >= 0 ? accent : "#94a3b8";
        return (
          <div key={key}>
            <div className="flex items-center justify-between text-[10.5px] font-bold">
              <span style={{ color: "var(--bm-muted)" }}>{label}</span>
              <span className="bm-num" style={{ color: pct >= 0 ? color : "var(--bm-muted)" }}>
                {pct >= 0 ? "+" : ""}
                {(pct * 100).toFixed(0)}
              </span>
            </div>
            <div
              className="mt-1 h-1.5 rounded-full overflow-hidden flex"
              style={{ background: "var(--bm-soft-100)" }}
            >
              {pct < 0 ? (
                <div className="h-full" style={{ width: "50%" }}>
                  <div
                    className="h-full rounded-l-full"
                    style={{
                      marginLeft: `${50 - w / 2}%`,
                      width: `${w / 2}%`,
                      background: "#94a3b8",
                    }}
                  />
                </div>
              ) : (
                <>
                  <div style={{ width: "50%" }} />
                  <div
                    className="h-full rounded-r-full"
                    style={{ width: `${w / 2}%`, background: color }}
                  />
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ReasonList({
  title,
  icon,
  tone,
  items,
}: {
  title: string;
  icon: React.ComponentProps<typeof AppIcon>["name"];
  tone: string;
  items: string[];
}) {
  return (
    <div
      className="rounded-xl px-3.5 py-3"
      style={{ background: "var(--bm-soft-100)", border: "1px solid var(--bm-border)" }}
    >
      <h4
        className="font-extrabold text-[12px] inline-flex items-center gap-1.5 mb-2"
        style={{ color: tone }}
      >
        <AppIcon name={icon} size={12} strokeWidth={2.4} />
        {title}
      </h4>
      <ul className="space-y-1.5">
        {items.length === 0 ? (
          <li className="text-[12px] text-[color:var(--bm-muted)]">— 해당 사항 없음 —</li>
        ) : (
          items.map((it, i) => (
            <li key={i} className="text-[12.5px] leading-relaxed flex items-start gap-1.5">
              <span className="mt-[7px] size-1 rounded-full shrink-0" style={{ background: tone }} />
              <span>{it}</span>
            </li>
          ))
        )}
      </ul>
    </div>
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
  const color =
    tone === "up" ? "var(--bm-up)" : tone === "down" ? "var(--bm-down)" : "var(--bm-text)";
  return (
    <div className="text-right">
      <div className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: "var(--bm-muted)" }}>
        {label}
      </div>
      <div className="bm-num font-extrabold text-[14px]" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function PlanCell({
  label,
  value,
  tone,
  big,
}: {
  label: string;
  value: number | string;
  tone?: "up" | "down";
  big?: boolean;
}) {
  const color = tone === "up" ? "var(--bm-up)" : tone === "down" ? "var(--bm-down)" : "var(--bm-text)";
  return (
    <div
      className="rounded-lg px-3 py-2"
      style={{ background: "var(--bm-card)", border: "1px solid var(--bm-border)" }}
    >
      <div className="text-[10px] font-bold" style={{ color: "var(--bm-muted)" }}>
        {label}
      </div>
      <div
        className="bm-num font-extrabold mt-0.5"
        style={{ color, fontSize: big ? 16 : 13.5 }}
      >
        {typeof value === "number" ? value.toLocaleString("ko-KR") : value}
      </div>
    </div>
  );
}

function verdictColorFor(verdict: InvestorScoreCard["verdict"]): string {
  switch (verdict) {
    case "강력매수":
      return "#dc2626";
    case "매수":
      return "#ef4444";
    case "관망":
      return "#64748b";
    case "매도":
      return "#3b82f6";
    case "강력매도":
      return "#1d4ed8";
  }
}
