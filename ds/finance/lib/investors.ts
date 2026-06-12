/**
 * Investor mode profiles — inspired by ButterAI's multi-agent scoring approach.
 * Each investor has weighted criteria reflecting their published philosophy,
 * applied to Korean stocks (KRX).
 */

export type InvestorId =
  | "buffett"
  | "lynch"
  | "munger"
  | "graham"
  | "wood"
  | "greenblatt"
  | "dalio"
  | "ackman";

export interface InvestorProfile {
  id: InvestorId;
  name: string;
  korean: string;
  era: string;
  emoji: string;
  accent: string;
  /** One-line philosophy */
  tagline: string;
  /** Korean stock context: things they would and wouldn't touch */
  koreanContext: string;
  /** Famous quotes */
  quotes: string[];
  /** Books / source */
  source: string;
  /** Weight of each criterion category (sum ~ 1.0) */
  weights: {
    valuation: number;
    quality: number;
    growth: number;
    moat: number;
    dividend: number;
    momentum: number;
    risk: number;
  };
  /** Hard preferences */
  preferences: {
    maxPER?: number;
    maxPBR?: number;
    minROE?: number;
    minDivYield?: number;
    preferLargeCap?: boolean;
    avoidLeverage?: boolean;
    holdHorizonYears?: number;
  };
}

export const INVESTORS: Record<InvestorId, InvestorProfile> = {
  buffett: {
    id: "buffett",
    name: "Warren Buffett",
    korean: "워런 버핏",
    era: "1965–현재 · 버크셔 해서웨이",
    emoji: "🦉",
    accent: "#1d4ed8",
    tagline: "이해 가능한 사업 · 강력한 해자 · 합리적 가격",
    koreanContext:
      "한국에선 은행·소비재·필수재처럼 ‘이해 가능한 사업 모델’과 강한 브랜드를 가진 종목을 선호합니다. 코스닥 성장주, 이슈성 테마, 재무가 약한 회사는 거의 손대지 않습니다.",
    quotes: [
      "값을 치르는 것이 비용이고, 받는 것이 가치다 (Price is what you pay, value is what you get)",
      "10년간 보유할 자신이 없으면 10분도 보유하지 마라",
      "위대한 회사를 적정 가격에 사는 것이, 평범한 회사를 헐값에 사는 것보다 낫다",
    ],
    source: "Berkshire Hathaway letters · 1965~",
    weights: {
      valuation: 0.18,
      quality: 0.30,
      growth: 0.10,
      moat: 0.20,
      dividend: 0.08,
      momentum: 0.04,
      risk: 0.10,
    },
    preferences: {
      maxPER: 22,
      maxPBR: 4,
      minROE: 12,
      minDivYield: 1.0,
      preferLargeCap: true,
      avoidLeverage: true,
      holdHorizonYears: 10,
    },
  },
  lynch: {
    id: "lynch",
    name: "Peter Lynch",
    korean: "피터 린치",
    era: "1977–1990 · 마젤란 펀드 (연 29%)",
    emoji: "🔍",
    accent: "#16a34a",
    tagline: "내가 아는 사업, PEG ≤ 1, 텐배거 후보",
    koreanContext:
      "‘일상에서 보이는 회사’ 원칙으로 한국에선 편의점·식음료·생활용품·게임 같이 본인이 직접 써본 제품의 회사를 우선 봅니다. PEG가 1 이하인 성장주를 가장 좋아합니다.",
    quotes: [
      "당신이 사용해 본 회사를 사라 (Invest in what you know)",
      "PEG가 1보다 낮으면 매수, 0.5라면 행운",
      "텐배거(10배 종목)는 모두 시장이 무시하던 시절이 있었다",
    ],
    source: "One Up On Wall Street · Beating the Street",
    weights: {
      valuation: 0.15,
      quality: 0.18,
      growth: 0.30,
      moat: 0.10,
      dividend: 0.05,
      momentum: 0.12,
      risk: 0.10,
    },
    preferences: {
      maxPER: 30,
      minROE: 10,
      preferLargeCap: false,
      holdHorizonYears: 3,
    },
  },
  munger: {
    id: "munger",
    name: "Charlie Munger",
    korean: "찰리 멍거",
    era: "1962–2023 · 버크셔 부회장",
    emoji: "🧠",
    accent: "var(--bm-accent-strong)",
    tagline: "위대한 사업을 적정 가격에 · 멍청한 짓을 피하는 것",
    koreanContext:
      "삼성전자·NAVER·카카오 같이 한국에서도 산업 1위에 가까운, 자본수익률이 꾸준히 높은 ‘훌륭한 회사’를 선호합니다. 단기 트레이딩, 레버리지, IPO 직후 종목은 멀리합니다.",
    quotes: [
      "위대한 회사는 위대한 가격에서가 아니라, 합리적 가격에서 사면 된다",
      "투자에서 벌고 싶다면, 멍청한 짓을 안 하는 것만으로도 충분하다",
      "역으로 생각하라 (Invert, always invert)",
    ],
    source: "Poor Charlie's Almanack",
    weights: {
      valuation: 0.12,
      quality: 0.36,
      growth: 0.12,
      moat: 0.22,
      dividend: 0.04,
      momentum: 0.04,
      risk: 0.10,
    },
    preferences: {
      maxPER: 25,
      maxPBR: 5,
      minROE: 15,
      preferLargeCap: true,
      avoidLeverage: true,
      holdHorizonYears: 15,
    },
  },
  graham: {
    id: "graham",
    name: "Benjamin Graham",
    korean: "벤저민 그레이엄",
    era: "1934 · 가치투자의 아버지",
    emoji: "📚",
    accent: "#475569",
    tagline: "안전마진 · 청산가치 이하 · 보수적 PER",
    koreanContext:
      "한국에선 청산가치 이하로 거래되는 ‘담배꽁초 주식’을 찾습니다. 저PBR·저PER·자기자본이 충분한 지주사·중공업·조선 일부가 후보. 성장은 거의 보지 않습니다.",
    quotes: [
      "안전마진(margin of safety) 없이는 투자가 아니라 투기다",
      "시장은 단기엔 투표기, 장기엔 저울이다",
      "Mr. Market은 매일 다른 가격을 부른다 — 무시하거나 이용하라",
    ],
    source: "Security Analysis · The Intelligent Investor",
    weights: {
      valuation: 0.40,
      quality: 0.18,
      growth: 0.05,
      moat: 0.05,
      dividend: 0.12,
      momentum: 0.00,
      risk: 0.20,
    },
    preferences: {
      maxPER: 15,
      maxPBR: 1.5,
      minROE: 8,
      minDivYield: 2.0,
      avoidLeverage: true,
    },
  },
  wood: {
    id: "wood",
    name: "Cathie Wood",
    korean: "캐시 우드",
    era: "2014–현재 · ARK Invest",
    emoji: "🚀",
    accent: "#ec4899",
    tagline: "파괴적 혁신 · 5년 후 매출 10배 · 가격 무관",
    koreanContext:
      "한국에서 AI·로봇·2차전지·바이오·우주 같이 ‘5년 안에 시장 자체를 새로 만들 수 있는 기업’을 우선 검토합니다. PER·PBR보다 매출 성장률을 봅니다.",
    quotes: [
      "혁신은 처음에는 비싸고 나중에는 폭발한다",
      "5년 시계열로 보면 단기 변동성은 의미없다",
      "단기 변동성 ≠ 진짜 리스크. 진짜 리스크는 혁신을 놓치는 것",
    ],
    source: "ARK Big Ideas · 연간 리포트",
    weights: {
      valuation: 0.05,
      quality: 0.10,
      growth: 0.45,
      moat: 0.10,
      dividend: 0.00,
      momentum: 0.20,
      risk: 0.10,
    },
    preferences: {
      preferLargeCap: false,
      holdHorizonYears: 5,
    },
  },
  greenblatt: {
    id: "greenblatt",
    name: "Joel Greenblatt",
    korean: "조엘 그린블랫",
    era: "1985–현재 · Gotham Capital",
    emoji: "✨",
    accent: "#a855f7",
    tagline: "매직 포뮬러: 자본수익률 + 이익수익률 상위",
    koreanContext:
      "한국 상장사 중 ROC(자본수익률)와 EY(이익수익률, EBIT/EV)가 모두 상위인 종목을 정량적으로 선별합니다. 이슈·소문 무시. 분기별 리밸런싱.",
    quotes: [
      "싸게 사고 좋은 회사를 사라 (Cheap and good)",
      "단순한 공식이 시장을 이긴다",
      "투자자가 가장 큰 적은 자기 자신",
    ],
    source: "The Little Book That Beats the Market",
    weights: {
      valuation: 0.30,
      quality: 0.30,
      growth: 0.10,
      moat: 0.05,
      dividend: 0.05,
      momentum: 0.05,
      risk: 0.15,
    },
    preferences: {
      maxPER: 20,
      minROE: 15,
      avoidLeverage: true,
      holdHorizonYears: 1,
    },
  },
  dalio: {
    id: "dalio",
    name: "Ray Dalio",
    korean: "레이 달리오",
    era: "1975–현재 · Bridgewater",
    emoji: "🌐",
    accent: "var(--bm-warning)",
    tagline: "모든 계절에 대비 · 분산 · 부채 사이클",
    koreanContext:
      "한국 시장 자체를 매크로 사이클(금리·환율·중국 모멘텀) 안에서 봅니다. 개별 종목보다 ‘섹터 분산’과 ‘리스크 패리티’를 강조 — 반도체·바이오·내수·금리 4축에 걸쳐 분산.",
    quotes: [
      "고통 + 반성 = 진보",
      "분산은 ‘공짜 점심’ 중 가장 가까운 것",
      "현금은 쓰레기다 (in inflationary regimes)",
    ],
    source: "Principles · Big Debt Crises",
    weights: {
      valuation: 0.10,
      quality: 0.15,
      growth: 0.10,
      moat: 0.05,
      dividend: 0.10,
      momentum: 0.20,
      risk: 0.30,
    },
    preferences: {
      preferLargeCap: true,
      avoidLeverage: true,
      holdHorizonYears: 5,
    },
  },
  ackman: {
    id: "ackman",
    name: "Bill Ackman",
    korean: "빌 애크먼",
    era: "2004–현재 · Pershing Square",
    emoji: "🎯",
    accent: "var(--bm-up)",
    tagline: "집중투자 · 단순한 비즈니스 · 행동주의",
    koreanContext:
      "10개 미만의 종목에 집중투자. 한국에선 지배구조 개선·자사주 소각·배당 확대 가능성이 있는 대형 지주사·블루칩에 관심. 변동성을 ‘기회’로 봅니다.",
    quotes: [
      "투자는 적은 종목에 집중해야 한다 (8–12개)",
      "단순하고 예측 가능한 사업을 적정 가격에",
      "장기 보유의 본질은 ‘잘못된 매도를 피하는 것’",
    ],
    source: "Pershing Square 연간 서한",
    weights: {
      valuation: 0.20,
      quality: 0.25,
      growth: 0.15,
      moat: 0.20,
      dividend: 0.05,
      momentum: 0.05,
      risk: 0.10,
    },
    preferences: {
      maxPER: 25,
      minROE: 12,
      preferLargeCap: true,
      holdHorizonYears: 7,
    },
  },
};

export const INVESTOR_LIST: InvestorProfile[] = Object.values(INVESTORS);

export interface FundamentalSnapshot {
  price: number;
  marketCap?: number;
  per?: number;
  pbr?: number;
  roe?: number;
  divYield?: number;
  /** Recent change % (used for momentum) */
  changePct: number;
  /** 52w hi/lo position 0..1 (low → 0, high → 1) */
  pricePosition52w?: number;
  /** YoY revenue growth from financials, 0..N */
  revenueGrowthYoY?: number;
  /** Operating margin */
  opMargin?: number;
  /** Sector */
  sector?: string;
}

export interface InvestorScoreCard {
  investor: InvestorId;
  /** Final composite score, -1.0 ~ +1.0 */
  score: number;
  /** Confidence 0..1 */
  confidence: number;
  /** Human verdict */
  verdict: "강력매수" | "매수" | "관망" | "매도" | "강력매도";
  /** Sub-scores per dimension, -1..+1 */
  components: {
    valuation: number;
    quality: number;
    growth: number;
    moat: number;
    dividend: number;
    momentum: number;
    risk: number;
  };
  /** Plain-text reasoning items, ranked by importance */
  reasons: string[];
  /** Risks / mismatches */
  risks: string[];
  /** Suggested entry / target / stop in won (if BUY) */
  plan?: {
    entryLow: number;
    entryHigh: number;
    target: number;
    stop: number;
    sizePct: number;
    horizon: string;
  };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function verdictFor(score: number): InvestorScoreCard["verdict"] {
  if (score >= 0.55) return "강력매수";
  if (score >= 0.2) return "매수";
  if (score <= -0.55) return "강력매도";
  if (score <= -0.2) return "매도";
  return "관망";
}

/**
 * Run an investor's scoring rubric against a fundamental snapshot.
 * Inspired by ButterAI's agent pattern: each dimension produces a sub-score
 * in [-1, 1], then weighted aggregate produces the final verdict.
 */
export function scoreForInvestor(
  inv: InvestorProfile,
  f: FundamentalSnapshot,
  name: string,
): InvestorScoreCard {
  const reasons: string[] = [];
  const risks: string[] = [];

  // Valuation: PER + PBR vs investor's max
  let valuation = 0;
  if (f.per != null && inv.preferences.maxPER) {
    if (f.per <= inv.preferences.maxPER * 0.7) {
      valuation += 0.6;
      reasons.push(`PER ${f.per.toFixed(1)}배 — ${inv.korean}의 기준(${inv.preferences.maxPER}배)보다 30%↓ 저평가`);
    } else if (f.per <= inv.preferences.maxPER) {
      valuation += 0.25;
      reasons.push(`PER ${f.per.toFixed(1)}배 — 허용 범위 내`);
    } else if (f.per > inv.preferences.maxPER * 1.5) {
      valuation -= 0.55;
      risks.push(`PER ${f.per.toFixed(1)}배 — ${inv.korean} 기준의 1.5배 초과 (고평가)`);
    } else {
      valuation -= 0.25;
      risks.push(`PER ${f.per.toFixed(1)}배 — 살짝 비쌈`);
    }
  }
  if (f.pbr != null && inv.preferences.maxPBR) {
    if (f.pbr <= inv.preferences.maxPBR * 0.6) {
      valuation += 0.4;
      reasons.push(`PBR ${f.pbr.toFixed(2)}배 — 청산가치 근접`);
    } else if (f.pbr <= inv.preferences.maxPBR) {
      valuation += 0.15;
    } else {
      valuation -= 0.3;
      risks.push(`PBR ${f.pbr.toFixed(2)}배 — 자산가치 대비 비쌈`);
    }
  }

  // Quality: ROE + operating margin
  let quality = 0;
  if (f.roe != null) {
    if (f.roe >= 18) {
      quality += 0.7;
      reasons.push(`ROE ${f.roe.toFixed(1)}% — 자본을 매우 효율적으로 굴림`);
    } else if (f.roe >= (inv.preferences.minROE ?? 10)) {
      quality += 0.35;
      reasons.push(`ROE ${f.roe.toFixed(1)}% — 기준 충족`);
    } else if (f.roe >= 5) {
      quality -= 0.15;
    } else {
      quality -= 0.55;
      risks.push(`ROE ${f.roe.toFixed(1)}% — 자본 비효율`);
    }
  }
  if (f.opMargin != null) {
    if (f.opMargin >= 15) {
      quality += 0.3;
      reasons.push(`영업이익률 ${f.opMargin.toFixed(1)}% — 가격결정력 강함`);
    } else if (f.opMargin < 5) {
      quality -= 0.25;
      risks.push(`영업이익률 ${f.opMargin.toFixed(1)}% — 마진 압박`);
    }
  }

  // Growth
  let growth = 0;
  if (f.revenueGrowthYoY != null) {
    const g = f.revenueGrowthYoY;
    if (g >= 0.25) {
      growth += 0.8;
      reasons.push(`매출 YoY ${(g * 100).toFixed(0)}% 성장 — 폭발적`);
    } else if (g >= 0.10) {
      growth += 0.4;
      reasons.push(`매출 YoY ${(g * 100).toFixed(0)}% — 견조한 성장`);
    } else if (g >= 0) {
      growth += 0.1;
    } else {
      growth -= 0.3;
      risks.push(`매출 YoY ${(g * 100).toFixed(0)}% — 역성장`);
    }
  }

  // Moat (proxy: marketCap, sector quality)
  let moat = 0;
  if (f.marketCap != null) {
    const mcap兆 = f.marketCap / 1_000_000_000_000;
    if (mcap兆 >= 100) {
      moat += 0.6;
      reasons.push(`시총 ${mcap兆.toFixed(0)}조 — 산업 지배적 규모`);
    } else if (mcap兆 >= 10) {
      moat += 0.3;
    } else if (mcap兆 < 0.5 && inv.preferences.preferLargeCap) {
      moat -= 0.3;
      risks.push(`시총 ${(mcap兆 * 10).toFixed(1)}천억 — ${inv.korean}이 선호하는 규모 미달`);
    }
  }
  // Strong-moat sectors per investor heuristic
  if (
    f.sector &&
    /반도체|증권|바이오|플랫폼|2차전지/.test(f.sector) &&
    (inv.id === "buffett" || inv.id === "munger")
  ) {
    moat += 0.15;
  }

  // Dividend
  let dividend = 0;
  if (f.divYield != null) {
    if (f.divYield >= 4) {
      dividend += 0.7;
      reasons.push(`배당수익률 ${f.divYield.toFixed(2)}% — 인컴 매력`);
    } else if (f.divYield >= (inv.preferences.minDivYield ?? 0)) {
      dividend += 0.3;
    } else if (inv.preferences.minDivYield && f.divYield < inv.preferences.minDivYield) {
      dividend -= 0.2;
    }
  }

  // Momentum (recent change)
  let momentum = 0;
  if (f.changePct >= 5) {
    momentum += 0.5;
    if (inv.id !== "wood" && inv.id !== "lynch") {
      risks.push(`최근 ${f.changePct.toFixed(1)}% 상승 — 단기 과열 가능`);
    } else {
      reasons.push(`모멘텀 +${f.changePct.toFixed(1)}% — 추세 진행 중`);
    }
  } else if (f.changePct <= -5) {
    momentum -= 0.4;
    if (inv.id === "graham" || inv.id === "buffett" || inv.id === "munger") {
      reasons.push(`최근 ${f.changePct.toFixed(1)}% 하락 — Mr. Market 할인 기회`);
      // Value investors INVERT momentum penalty
      momentum = Math.abs(momentum) * 0.7;
    }
  }
  if (f.pricePosition52w != null) {
    if (f.pricePosition52w >= 0.85 && inv.id !== "wood") {
      momentum -= 0.25;
      risks.push(`52주 최고가 근접 (${(f.pricePosition52w * 100).toFixed(0)}%)`);
    } else if (f.pricePosition52w <= 0.25) {
      if (inv.id === "graham") {
        momentum += 0.4;
        reasons.push(`52주 최저가 근접 — 그레이엄형 안전마진 후보`);
      }
    }
  }

  // Risk: leverage proxy + extreme prices
  let risk = 0;
  if (inv.preferences.avoidLeverage) {
    // We don't have D/E directly — penalize tiny caps as a proxy for leverage/risk
    if (f.marketCap != null && f.marketCap < 100_000_000_000) {
      risk -= 0.2;
      risks.push(`소형주 — 변동성·유동성 리스크`);
    }
  }
  if (Math.abs(f.changePct) > 20) {
    risk -= 0.3;
    risks.push(`일간 변동 ±${Math.abs(f.changePct).toFixed(0)}% — 변동성 극단`);
  }

  // Aggregate
  const w = inv.weights;
  const composite =
    valuation * w.valuation +
    quality * w.quality +
    growth * w.growth +
    moat * w.moat +
    dividend * w.dividend +
    momentum * w.momentum +
    risk * w.risk;
  const score = clamp(composite, -1, 1);
  const confidence = clamp(0.5 + Math.abs(score) * 0.4, 0.45, 0.95);
  const verdict = verdictFor(score);

  // Plan
  let plan: InvestorScoreCard["plan"] | undefined;
  if (verdict === "매수" || verdict === "강력매수") {
    const entryLow = Math.round(f.price * 0.97);
    const entryHigh = Math.round(f.price * 1.005);
    const horizonY = inv.preferences.holdHorizonYears ?? 3;
    const targetMul = inv.id === "wood" ? 2.5 : inv.id === "graham" ? 1.4 : 1.6;
    const target = Math.round(f.price * targetMul);
    const stopMul = inv.id === "graham" ? 0.85 : inv.id === "wood" ? 0.7 : 0.88;
    const stop = Math.round(f.price * stopMul);
    const sizePct =
      inv.id === "ackman" ? 12 :
      inv.id === "wood" ? 6 :
      inv.id === "buffett" || inv.id === "munger" ? 10 :
      8;
    plan = {
      entryLow,
      entryHigh,
      target,
      stop,
      sizePct,
      horizon: `${horizonY}년+`,
    };
  }

  // Sort reasons / risks (already roughly ordered by importance)
  if (reasons.length === 0) reasons.push(`${inv.korean}의 핵심 기준에 강한 신호 없음 — 관망`);

  return {
    investor: inv.id,
    score,
    confidence,
    verdict,
    components: { valuation, quality, growth, moat, dividend, momentum, risk },
    reasons: reasons.slice(0, 5),
    risks: risks.slice(0, 4),
    plan,
  };
}

/**
 * Run all investors against a snapshot — used for the overview page.
 */
export function scoreAllInvestors(f: FundamentalSnapshot, name: string): InvestorScoreCard[] {
  return INVESTOR_LIST.map((inv) => scoreForInvestor(inv, f, name));
}
