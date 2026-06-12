"use client";

import { Tag, Badge } from "@junds/ui";
import { useMemo } from "react";
import { useLivePrice } from "./lib/livePrices";
import {
  strategyFor,
  type StrategyLevel,
  type ScoreBreakdown,
} from "./lib/strategy";
import { AppIcon } from "./AppIcon";

// REC 5단계 톤 — 가격 의미론(up=빨강/down=파랑) 토큰 기반
const RECO_TONE: Record<string, { color: string; bg: string; icon: "trendingUp" | "trendingDown" | "activity" }> = {
  강력매수: {
    color: "var(--bm-up)",
    bg: "color-mix(in srgb, var(--bm-up) 12%, transparent)",
    icon: "trendingUp",
  },
  매수: {
    color: "color-mix(in srgb, var(--bm-up) 55%, var(--bm-muted))",
    bg: "color-mix(in srgb, var(--bm-up) 8%, transparent)",
    icon: "trendingUp",
  },
  관망: {
    color: "var(--bm-muted)",
    bg: "color-mix(in srgb, var(--bm-muted) 12%, transparent)",
    icon: "activity",
  },
  매도: {
    color: "color-mix(in srgb, var(--bm-down) 55%, var(--bm-muted))",
    bg: "color-mix(in srgb, var(--bm-down) 8%, transparent)",
    icon: "trendingDown",
  },
  강력매도: {
    color: "var(--bm-down)",
    bg: "color-mix(in srgb, var(--bm-down) 12%, transparent)",
    icon: "trendingDown",
  },
};

export function StrategyPanel({ name }: { name: string }) {
  const { price } = useLivePrice(name);
  const strategy = useMemo(() => strategyFor(name), [name]);
  const tone = RECO_TONE[strategy.recommendation];
  const distToBuy = ((price - strategy.buyZones[0].price) / strategy.buyZones[0].price) * 100;
  const distToStop = ((price - strategy.stopLoss.price) / strategy.stopLoss.price) * 100;

  return (
    <section
      className="bm-card overflow-hidden"
      style={{ border: "1px solid var(--bm-border)" }}
    >
      <header
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--bm-border)" }}
      >
        <div className="flex items-center gap-2">
          <AppIcon name="target" size={16} strokeWidth={2.2} color="var(--bm-accent-strong)" />
          <h2 className="font-extrabold text-[14px]">매매 전략</h2>
          <Badge variant="info" size="sm">
            데모 알고리즘
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-[color:var(--bm-muted)]">
          <span className="bm-num">손익비 {strategy.riskRewardRatio.toFixed(1)} : 1</span>
        </div>
      </header>

      <div className="p-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{ background: tone.bg }}
        >
          <div
            className="size-10 rounded-full grid place-items-center"
            style={{ background: tone.color, color: "white" }}
          >
            <AppIcon name={tone.icon} size={20} strokeWidth={2.4} />
          </div>
          <div className="flex-1">
            <div className="text-[11px] font-bold" style={{ color: tone.color }}>
              현재 추천
            </div>
            <div className="text-[18px] font-extrabold" style={{ color: tone.color }}>
              {strategy.recommendation}
            </div>
          </div>
          <div className="text-right pr-3" style={{ borderRight: "1px solid rgba(0,0,0,0.08)" }}>
            <div className="text-[10.5px] text-[color:var(--bm-muted)] font-bold">추천 점수</div>
            <div
              className="bm-num font-extrabold text-[16px]"
              style={{ color: tone.color }}
            >
              {strategy.recommendationScore.toFixed(0)}
              <span className="text-[10.5px] font-semibold ml-0.5" style={{ color: "var(--bm-muted)" }}>
                /100
              </span>
            </div>
          </div>
          <div className="text-right pl-1">
            <div className="text-[10.5px] text-[color:var(--bm-muted)] font-bold">신뢰도</div>
            <div
              className="bm-num font-extrabold text-[16px]"
              style={{ color: tone.color }}
            >
              {(strategy.confidence * 100).toFixed(0)}
              <span className="text-[10.5px] font-semibold ml-0.5" style={{ color: "var(--bm-muted)" }}>
                %
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <KpiTile label="스윙 점수" value={`${strategy.swingScore}`} unit="/100" />
          <KpiTile label="B1까지" value={`${distToBuy >= 0 ? "+" : ""}${distToBuy.toFixed(2)}`} unit="%" tone={distToBuy <= 0 ? "buy" : "neutral"} />
          <KpiTile label="손절까지" value={`${distToStop.toFixed(2)}`} unit="%" tone={distToStop > 5 ? "buy" : "stop"} />
        </div>
      </div>

      <ReasonPanel
        breakdown={strategy.scoreBreakdown}
        reasons={strategy.reasons}
        recommendation={strategy.recommendation}
        confidence={strategy.confidence}
        tone={tone}
      />

      <div className="px-4 pb-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ZoneColumn title="매수 구간" tone="buy" levels={strategy.buyZones} current={price} />
        <ZoneColumn title="익절 구간" tone="sell" levels={strategy.takeProfitZones} current={price} />
        <StopColumn level={strategy.stopLoss} current={price} />
      </div>

      <div
        className="px-4 py-3 grid grid-cols-1 md:grid-cols-3 gap-3"
        style={{ background: "var(--bm-soft-100)", borderTop: "1px solid var(--bm-border)" }}
      >
        <PositionTile label="안전형" pct={strategy.positionSize.conservative} color="var(--bm-info)" />
        <PositionTile label="균형형" pct={strategy.positionSize.balanced} color="var(--bm-accent-strong)" />
        <PositionTile label="공격형" pct={strategy.positionSize.aggressive} color="var(--bm-up)" />
      </div>

      {strategy.notes.length > 0 ? (
        <div
          className="px-4 py-3 space-y-1.5 text-[12.5px]"
          style={{ borderTop: "1px solid var(--bm-border)" }}
        >
          {strategy.notes.map((note, i) => (
            <div key={i} className="flex items-start gap-2 leading-relaxed">
              <span className="mt-[3px] shrink-0" style={{ color: "var(--bm-muted)" }}>
                <AppIcon name="info" size={12} strokeWidth={2.2} />
              </span>
              <span>{note}</span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function KpiTile({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: "buy" | "stop" | "neutral";
}) {
  const color =
    tone === "buy" ? "var(--bm-up)" : tone === "stop" ? "var(--bm-down)" : "var(--bm-text)";
  return (
    <div
      className="rounded-xl px-3 py-2 text-center"
      style={{ background: "var(--bm-soft-100)" }}
    >
      <div className="text-[10.5px] font-bold" style={{ color: "var(--bm-muted)" }}>
        {label}
      </div>
      <div className="bm-num font-extrabold text-[14px] mt-0.5" style={{ color }}>
        {value}
        {unit ? <span className="text-[10.5px] ml-0.5 font-semibold">{unit}</span> : null}
      </div>
    </div>
  );
}

function ZoneColumn({
  title,
  tone,
  levels,
  current,
}: {
  title: string;
  tone: "buy" | "sell";
  levels: StrategyLevel[];
  current: number;
}) {
  const accent = tone === "buy" ? "var(--bm-up)" : "var(--bm-accent-strong)";
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 px-1">
        <AppIcon
          name={tone === "buy" ? "arrowDown" : "arrowUp"}
          size={13}
          strokeWidth={2.4}
          color={accent}
        />
        <h3 className="text-[12.5px] font-extrabold" style={{ color: accent }}>
          {title}
        </h3>
      </div>
      {levels.map((level) => {
        const dist = ((current - level.price) / level.price) * 100;
        return (
          <div
            key={level.label}
            className="rounded-xl px-3 py-2.5 flex items-center justify-between"
            style={{ border: "1px solid var(--bm-border)", background: "var(--bm-card)" }}
          >
            <div className="flex items-center gap-2">
              <Tag color={tone === "buy" ? "red" : "teal"}>{level.label}</Tag>
              <div className="text-[11.5px] leading-tight">
                <div className="font-bold">{level.description}</div>
              </div>
            </div>
            <div className="text-right bm-num">
              <div className="font-extrabold text-[14px]" style={{ color: accent }}>
                {level.price.toLocaleString("ko-KR")}
              </div>
              <div className="text-[10.5px] font-semibold" style={{ color: "var(--bm-muted)" }}>
                {dist >= 0 ? "+" : ""}
                {dist.toFixed(2)}%
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StopColumn({ level, current }: { level: StrategyLevel; current: number }) {
  const dist = ((current - level.price) / level.price) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 px-1">
        <AppIcon name="alert" size={13} strokeWidth={2.4} color="var(--bm-down)" />
        <h3 className="text-[12.5px] font-extrabold" style={{ color: "var(--bm-down)" }}>
          손절선
        </h3>
      </div>
      <div
        className="rounded-xl px-3 py-3.5"
        style={{
          border: "1px solid color-mix(in srgb, var(--bm-down) 30%, transparent)",
          background: "color-mix(in srgb, var(--bm-down) 5%, transparent)",
        }}
      >
        <div className="flex items-center justify-between">
          <Tag color="blue">{level.label}</Tag>
          <div className="text-right bm-num">
            <div
              className="font-extrabold text-[18px]"
              style={{ color: "var(--bm-down)" }}
            >
              {level.price.toLocaleString("ko-KR")}
            </div>
            <div
              className="text-[10.5px] font-semibold"
              style={{ color: "var(--bm-muted)" }}
            >
              {dist.toFixed(2)}% 거리
            </div>
          </div>
        </div>
        <p className="text-[12px] mt-2 font-semibold leading-relaxed" style={{ color: "var(--bm-down)" }}>
          {level.description}
        </p>
      </div>
    </div>
  );
}

function ReasonPanel({
  breakdown,
  reasons,
  recommendation,
  confidence,
  tone,
}: {
  breakdown: ScoreBreakdown;
  reasons: string[];
  recommendation: string;
  confidence: number;
  tone: { color: string; bg: string };
}) {
  const confidencePct = Math.round(confidence * 100);
  const confidenceLabel =
    confidencePct >= 85
      ? "매우 확신"
      : confidencePct >= 70
      ? "확신"
      : confidencePct >= 55
      ? "약간 확신"
      : "관망에 가까움";

  return (
    <details
      className="px-4 pb-3"
      style={{ borderTop: "1px solid var(--bm-border)" }}
    >
      <summary
        className="cursor-pointer list-none py-3 flex items-center gap-2 text-[12.5px] font-extrabold select-none"
        style={{ color: "var(--bm-text)" }}
      >
        <AppIcon name="info" size={13} strokeWidth={2.4} color={tone.color} />
        <span>왜 "{recommendation}"인가요? — 추천 근거 보기</span>
        <span
          className="ml-auto text-[10.5px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: tone.bg, color: tone.color }}
        >
          신뢰도 {confidencePct}% · {confidenceLabel}
        </span>
      </summary>

      <div className="mt-1 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-3">
        {/* 점수 산식 분해 */}
        <div
          className="rounded-xl p-3 text-[12px] leading-relaxed"
          style={{ background: "var(--bm-soft-100)", border: "1px solid var(--bm-border)" }}
        >
          <div className="text-[11px] font-extrabold mb-2" style={{ color: "var(--bm-muted)" }}>
            추천 점수 산식 (0~100)
          </div>
          <ul className="space-y-1.5">
            <BreakdownRow
              label="시작 점수"
              detail="모든 종목은 중립 50점에서 출발"
              value={`${breakdown.base.toFixed(0)}점`}
              valueColor="var(--bm-text)"
            />
            <BreakdownRow
              label={`등락률 ${breakdown.changePct >= 0 ? "+" : ""}${breakdown.changePct.toFixed(2)}% × ${breakdown.changeWeight}`}
              detail="당일 시세 모멘텀이 강할수록 가산"
              value={`${breakdown.changeContribution >= 0 ? "+" : ""}${breakdown.changeContribution.toFixed(1)}점`}
              valueColor={breakdown.changeContribution >= 0 ? "var(--bm-up)" : "var(--bm-down)"}
            />
            <BreakdownRow
              label={`손익비 ${breakdown.riskRewardRatio.toFixed(2)} : 1 × ${breakdown.rrWeight}`}
              detail="목표가까지 상승폭 ÷ 손절까지 하락폭"
              value={`${breakdown.rrContribution >= 0 ? "+" : ""}${breakdown.rrContribution.toFixed(1)}점`}
              valueColor={breakdown.rrContribution >= 0 ? "var(--bm-up)" : "var(--bm-down)"}
            />
            <li
              className="flex items-baseline justify-between gap-2 pt-1.5 mt-1"
              style={{ borderTop: "1px dashed var(--bm-border)" }}
            >
              <span className="font-extrabold">합계 (클램프 후)</span>
              <span className="bm-num font-extrabold text-[14px]" style={{ color: tone.color }}>
                {breakdown.finalScore.toFixed(0)} / 100
              </span>
            </li>
          </ul>

          <div className="mt-2 pt-2 text-[11px] leading-relaxed" style={{ borderTop: "1px solid var(--bm-border)", color: "var(--bm-muted)" }}>
            <strong className="font-extrabold" style={{ color: "var(--bm-text)" }}>판정 기준:</strong>{" "}
            ≥80 강력매수 · ≥62 매수 · 39~61 관망 · ≤38 매도 · ≤20 강력매도
          </div>
        </div>

        {/* 신뢰도 의미 + 자연어 근거 */}
        <div
          className="rounded-xl p-3 text-[12px] leading-relaxed"
          style={{ background: "var(--bm-card)", border: "1px solid var(--bm-border)" }}
        >
          <div className="text-[11px] font-extrabold mb-2" style={{ color: "var(--bm-muted)" }}>
            신뢰도 의미
          </div>
          <p className="mb-2.5">
            신뢰도는 추천 점수가 중립값(50점)에서 얼마나 멀리 떨어져 있는지를 0.45~0.95 범위로 환산한 값입니다.
            점수가 양극단(0 또는 100)에 가까울수록 라벨에 대한 확신이 높습니다.
          </p>

          <div className="text-[11px] font-extrabold mb-1.5" style={{ color: "var(--bm-muted)" }}>
            자연어 근거
          </div>
          <ul className="space-y-1">
            {reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span
                  className="mt-[5px] shrink-0 size-1.5 rounded-full"
                  style={{ background: tone.color }}
                />
                <span>{r}</span>
              </li>
            ))}
          </ul>

          <div
            className="mt-3 pt-2 text-[10.5px] leading-relaxed"
            style={{ borderTop: "1px dashed var(--bm-border)", color: "var(--bm-muted)" }}
          >
            ⚠ 본 점수는 데모 알고리즘(등락률 + 손익비 가중합)으로 산출된 참고용 신호이며, 투자 권유가 아닙니다.
          </div>
        </div>
      </div>
    </details>
  );
}

function BreakdownRow({
  label,
  detail,
  value,
  valueColor,
}: {
  label: string;
  detail: string;
  value: string;
  valueColor: string;
}) {
  return (
    <li className="flex items-baseline justify-between gap-2">
      <div className="min-w-0 flex-1">
        <div className="font-bold">{label}</div>
        <div className="text-[10.5px]" style={{ color: "var(--bm-muted)" }}>
          {detail}
        </div>
      </div>
      <span className="bm-num font-extrabold text-[12.5px] shrink-0" style={{ color: valueColor }}>
        {value}
      </span>
    </li>
  );
}

function PositionTile({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div
      className="rounded-xl px-3 py-2 flex items-center justify-between"
      style={{ background: "var(--bm-card)", border: "1px solid var(--bm-border)" }}
    >
      <div>
        <div className="text-[10.5px] font-bold" style={{ color: "var(--bm-muted)" }}>
          {label} 포지션
        </div>
        <div className="bm-num font-extrabold text-[16px]" style={{ color }}>
          {pct}%
        </div>
      </div>
      <div className="text-[10.5px] font-semibold" style={{ color: "var(--bm-muted)" }}>
        총자산 대비
      </div>
    </div>
  );
}
