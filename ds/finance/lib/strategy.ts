import { findStock } from "./stocks";

export interface StrategyLevel {
  label: string;
  price: number;
  description: string;
  tone: "buy" | "sell" | "stop" | "neutral";
}

/**
 * 추천 점수가 어떤 입력으로부터 만들어졌는지 사용자에게 보여주기 위한 분해.
 * 점수 = base + changeContribution + rrContribution → 0~100 클램프.
 */
export interface ScoreBreakdown {
  /** 시작 베이스 점수 (중립 = 50) */
  base: number;
  /** 등락률 (%) 입력값 */
  changePct: number;
  /** 등락률 가중치 (점수 = changePct × weight) */
  changeWeight: number;
  /** 등락률이 점수에 기여한 양 (양수 = 가산, 음수 = 차감) */
  changeContribution: number;
  /** 손익비 (T2 대비 손절까지 거리의 비율) */
  riskRewardRatio: number;
  /** 손익비 가중치 (점수 = rr × weight) */
  rrWeight: number;
  /** 손익비가 점수에 기여한 양 */
  rrContribution: number;
  /** 클램프 이전 합계 (디버깅/검증용) */
  rawTotal: number;
  /** 최종 점수 (0~100) */
  finalScore: number;
}

/** 추천 라벨이 어떤 점수 구간에서 결정되는지에 대한 임계값. */
export const RECOMMENDATION_THRESHOLDS = {
  강력매수: 80,
  매수: 62,
  매도: 38,
  강력매도: 20,
} as const;

export interface StrategySnapshot {
  current: number;
  recommendation: "강력매수" | "매수" | "관망" | "매도" | "강력매도";
  recommendationScore: number; // 0-100
  /** 신뢰도(0~1). 점수가 50에서 멀수록 라벨에 대한 확신이 높다. */
  confidence: number;
  /** 추천 점수가 어떻게 계산됐는지에 대한 분해 — UI에서 그대로 보여줌. */
  scoreBreakdown: ScoreBreakdown;
  /** 사람이 읽을 수 있는 추천 근거 (예: "등락률 +14.6%가 점수를 +21.9 끌어올렸습니다"). */
  reasons: string[];
  riskRewardRatio: number;
  positionSize: { conservative: number; balanced: number; aggressive: number };
  buyZones: StrategyLevel[];
  takeProfitZones: StrategyLevel[];
  stopLoss: StrategyLevel;
  highestPriorityBuy: StrategyLevel;
  swingScore: number; // 0-100
  notes: string[];
}

function hashSeed(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return Math.abs(h) || 1;
}

export function strategyFor(name: string): StrategySnapshot {
  const stock = findStock(name);
  const seed = hashSeed(name);
  const r = (i: number) => ((seed * (i + 17)) % 1000) / 1000;
  const current = stock?.price ?? 60_000;
  const change = stock?.change ?? 0;

  // Buy levels (B1/B2/B3) at -2%/-5%/-9% from current with adjustment
  const b1 = Math.round(current * (1 - 0.025 - r(1) * 0.01));
  const b2 = Math.round(current * (1 - 0.055 - r(2) * 0.015));
  const b3 = Math.round(current * (1 - 0.09 - r(3) * 0.02));

  // Take profit (T1/T2/T3) at +5%/+10%/+18% from current
  const t1 = Math.round(current * (1 + 0.05 + r(4) * 0.015));
  const t2 = Math.round(current * (1 + 0.1 + r(5) * 0.025));
  const t3 = Math.round(current * (1 + 0.18 + r(6) * 0.04));

  // Stop loss at -12%
  const stop = Math.round(current * (1 - 0.12 - r(7) * 0.02));

  const upside = (t2 - current) / current;
  const downside = (current - stop) / current;
  const rr = downside === 0 ? 0 : upside / downside;

  // 추천 점수 산식: base 50 + 등락률 × 1.5 + 손익비 × 8 (0~100 클램프)
  const BASE = 50;
  const CHANGE_WEIGHT = 1.5;
  const RR_WEIGHT = 8;
  const changeContribution = change * CHANGE_WEIGHT;
  const rrContribution = rr * RR_WEIGHT;
  const rawTotal = BASE + changeContribution + rrContribution;
  const score = Math.max(0, Math.min(100, rawTotal));

  let recommendation: StrategySnapshot["recommendation"] = "관망";
  if (score >= RECOMMENDATION_THRESHOLDS.강력매수) recommendation = "강력매수";
  else if (score >= RECOMMENDATION_THRESHOLDS.매수) recommendation = "매수";
  else if (score <= RECOMMENDATION_THRESHOLDS.강력매도) recommendation = "강력매도";
  else if (score <= RECOMMENDATION_THRESHOLDS.매도) recommendation = "매도";

  // 신뢰도: 점수가 중립(50)에서 멀수록 라벨 확신이 높다고 본다.
  // 0.45(거의 모름) ~ 0.95(매우 확신) 범위로 클램프.
  const confidence = Math.max(0.45, Math.min(0.95, 0.5 + (Math.abs(score - 50) / 50) * 0.45));

  const swingScore = Math.max(0, Math.min(100, Math.round(40 + Math.abs(change) * 2.5 + rr * 5)));

  const scoreBreakdown: ScoreBreakdown = {
    base: BASE,
    changePct: change,
    changeWeight: CHANGE_WEIGHT,
    changeContribution,
    riskRewardRatio: rr,
    rrWeight: RR_WEIGHT,
    rrContribution,
    rawTotal,
    finalScore: score,
  };

  // 사용자에게 보여줄 자연어 근거
  const reasons: string[] = [];
  reasons.push(
    `시작 점수 ${BASE}점 + 등락률 ${change >= 0 ? "+" : ""}${change.toFixed(2)}% × ${CHANGE_WEIGHT} = ${changeContribution >= 0 ? "+" : ""}${changeContribution.toFixed(1)}점`,
  );
  reasons.push(
    `손익비 ${rr.toFixed(2)} : 1 × ${RR_WEIGHT} = ${rrContribution >= 0 ? "+" : ""}${rrContribution.toFixed(1)}점 (T2 ${t2.toLocaleString("ko-KR")} ↗ vs SL ${stop.toLocaleString("ko-KR")} ↘ 기준)`,
  );
  reasons.push(
    `합계 ${rawTotal.toFixed(1)}점 → 0~100 클램프 후 ${score.toFixed(0)}점 → "${recommendation}" 판정 (≥80 강력매수 / ≥62 매수 / ≤38 매도 / ≤20 강력매도)`,
  );

  const notes: string[] = [];
  if (change > 10) notes.push("단기 급등 후 차익실현 매물 출회 가능 — 분할 매수 권장");
  else if (change > 3) notes.push("강한 매수세 진입 중. 추세 추종 시 짧은 손절선 필요");
  else if (change > 0) notes.push("매수세 우위. 시장 개장 직후 갭 확인 후 진입");
  else if (change > -3) notes.push("관망 구간. B1 도달 시 1차 분할 매수 고려");
  else notes.push("약세 흐름. 손절선 이탈 시 추가 하락 가능 — 보수적 접근");

  if (rr >= 2.5) notes.push(`목표 대비 위험 비율 ${rr.toFixed(1)} : 1 — 매력적 손익비`);
  else if (rr < 1.2) notes.push(`목표 대비 위험 비율 ${rr.toFixed(1)} : 1 — 손익비 낮음, 분할 진입`);

  return {
    current,
    recommendation,
    recommendationScore: score,
    confidence,
    scoreBreakdown,
    reasons,
    riskRewardRatio: rr,
    positionSize: {
      conservative: 5,
      balanced: 10,
      aggressive: 20,
    },
    buyZones: [
      { label: "B1", price: b1, description: "1차 매수 — 단기 지지", tone: "buy" },
      { label: "B2", price: b2, description: "2차 매수 — 추가 분할", tone: "buy" },
      { label: "B3", price: b3, description: "3차 매수 — 강한 지지선", tone: "buy" },
    ],
    takeProfitZones: [
      { label: "T1", price: t1, description: "단기 차익 — 1/3 매도", tone: "sell" },
      { label: "T2", price: t2, description: "중기 목표 — 1/3 매도", tone: "sell" },
      { label: "T3", price: t3, description: "장기 목표 — 잔여 매도", tone: "sell" },
    ],
    stopLoss: {
      label: "SL",
      price: stop,
      description: "손절선 — 이탈 시 무조건 매도",
      tone: "stop",
    },
    highestPriorityBuy: { label: "B1", price: b1, description: "1차 매수 추천가", tone: "buy" },
    swingScore,
    notes,
  };
}
