/**
 * Keyword-based DART disclosure tone classifier.
 *
 * Korean retail investors react sharply to disclosures: 증자/감자/CB는 즉시
 * 반응한다. 키워드 룰만으로도 80%+ 분류는 가능하다는 가정.
 */

export type DisclosureTone = "positive" | "negative" | "neutral";
export type DisclosureCategory =
  | "earnings" // 실적·매출·이익
  | "financing" // 증자·감자·CB·BW
  | "treasury" // 자사주
  | "governance" // 임원·합병·분할
  | "ownership" // 최대주주·5%·지분
  | "dividend" // 배당
  | "guidance" // 사업전망·전환
  | "litigation" // 소송·횡령·배임
  | "other";

export interface ClassifiedDisclosure {
  tone: DisclosureTone;
  category: DisclosureCategory;
  /** Confidence 0..1 — higher when multiple rules fire. */
  confidence: number;
  /** Matched keywords for transparency. */
  matched: string[];
}

interface Rule {
  keyword: string;
  tone: DisclosureTone;
  category: DisclosureCategory;
  /** Weight contribution toward confidence. */
  weight: number;
}

const RULES: Rule[] = [
  // financing — 대부분 단기 악재
  { keyword: "유상증자", tone: "negative", category: "financing", weight: 1.0 },
  { keyword: "주주배정", tone: "negative", category: "financing", weight: 0.6 },
  { keyword: "제3자배정", tone: "negative", category: "financing", weight: 0.7 },
  { keyword: "전환사채", tone: "negative", category: "financing", weight: 0.7 },
  { keyword: "신주인수권부사채", tone: "negative", category: "financing", weight: 0.7 },
  { keyword: "교환사채", tone: "negative", category: "financing", weight: 0.5 },
  { keyword: "CB", tone: "negative", category: "financing", weight: 0.5 },
  { keyword: "BW", tone: "negative", category: "financing", weight: 0.5 },
  { keyword: "감자", tone: "negative", category: "financing", weight: 0.9 },
  { keyword: "무상감자", tone: "negative", category: "financing", weight: 1.0 },

  // treasury — 호재
  { keyword: "자기주식 취득", tone: "positive", category: "treasury", weight: 1.0 },
  { keyword: "자사주 매입", tone: "positive", category: "treasury", weight: 1.0 },
  { keyword: "자사주 소각", tone: "positive", category: "treasury", weight: 1.2 },
  { keyword: "자기주식소각", tone: "positive", category: "treasury", weight: 1.2 },

  // dividend — 호재
  { keyword: "배당금", tone: "positive", category: "dividend", weight: 0.6 },
  { keyword: "현금배당", tone: "positive", category: "dividend", weight: 0.7 },
  { keyword: "주식배당", tone: "positive", category: "dividend", weight: 0.5 },
  { keyword: "특별배당", tone: "positive", category: "dividend", weight: 0.9 },

  // earnings — 컨텍스트 의존, 기본 neutral
  { keyword: "분기보고서", tone: "neutral", category: "earnings", weight: 0.4 },
  { keyword: "사업보고서", tone: "neutral", category: "earnings", weight: 0.4 },
  { keyword: "잠정실적", tone: "neutral", category: "earnings", weight: 0.6 },
  { keyword: "매출액 또는 손익구조", tone: "neutral", category: "earnings", weight: 0.7 },
  { keyword: "영업실적", tone: "neutral", category: "earnings", weight: 0.6 },

  // guidance — 일반적으로 긍정 (수주·계약·진출)
  { keyword: "단일판매", tone: "positive", category: "guidance", weight: 0.7 },
  { keyword: "공급계약", tone: "positive", category: "guidance", weight: 0.8 },
  { keyword: "수주", tone: "positive", category: "guidance", weight: 0.8 },
  { keyword: "기술이전", tone: "positive", category: "guidance", weight: 0.7 },
  { keyword: "사업양수", tone: "positive", category: "guidance", weight: 0.5 },

  // governance
  { keyword: "합병", tone: "neutral", category: "governance", weight: 0.5 },
  { keyword: "분할", tone: "negative", category: "governance", weight: 0.6 }, // 분할 = 일반적으로 단기 악재
  { keyword: "물적분할", tone: "negative", category: "governance", weight: 0.9 },
  { keyword: "인적분할", tone: "neutral", category: "governance", weight: 0.4 },
  { keyword: "이사회", tone: "neutral", category: "governance", weight: 0.2 },
  { keyword: "대표이사 변경", tone: "neutral", category: "governance", weight: 0.5 },

  // ownership
  { keyword: "최대주주 변경", tone: "neutral", category: "ownership", weight: 0.7 },
  { keyword: "주식등의대량보유", tone: "neutral", category: "ownership", weight: 0.6 },
  { keyword: "임원·주요주주 특정증권등 소유", tone: "neutral", category: "ownership", weight: 0.4 },

  // litigation — 강한 악재
  { keyword: "횡령", tone: "negative", category: "litigation", weight: 1.5 },
  { keyword: "배임", tone: "negative", category: "litigation", weight: 1.5 },
  { keyword: "소송", tone: "negative", category: "litigation", weight: 0.8 },
  { keyword: "고발", tone: "negative", category: "litigation", weight: 0.9 },
  { keyword: "거래정지", tone: "negative", category: "litigation", weight: 1.2 },
  { keyword: "관리종목", tone: "negative", category: "litigation", weight: 1.4 },
  { keyword: "상장폐지", tone: "negative", category: "litigation", weight: 2.0 },
];

/**
 * Classify a disclosure title (and optional body) into tone/category.
 * Multiple rules may fire; their weighted sum determines confidence.
 */
export function classifyDisclosure(
  title: string,
  body?: string,
): ClassifiedDisclosure {
  const haystack = `${title} ${body ?? ""}`;
  const hits: Rule[] = [];
  for (const rule of RULES) {
    if (haystack.includes(rule.keyword)) hits.push(rule);
  }
  if (hits.length === 0) {
    return { tone: "neutral", category: "other", confidence: 0, matched: [] };
  }
  // Tone score: positive +1, negative -1, weighted
  let toneScore = 0;
  let weightSum = 0;
  // Category vote
  const catVotes: Partial<Record<DisclosureCategory, number>> = {};
  for (const r of hits) {
    weightSum += r.weight;
    if (r.tone === "positive") toneScore += r.weight;
    else if (r.tone === "negative") toneScore -= r.weight;
    catVotes[r.category] = (catVotes[r.category] ?? 0) + r.weight;
  }
  const tone: DisclosureTone =
    toneScore > 0.2 ? "positive" : toneScore < -0.2 ? "negative" : "neutral";
  const category = (Object.entries(catVotes).sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0] ?? "other") as DisclosureCategory;
  const confidence = Math.min(1, weightSum / 1.5);
  return {
    tone,
    category,
    confidence,
    matched: hits.map((r) => r.keyword),
  };
}

/** Korean labels for category, for UI display. */
export const CATEGORY_LABELS: Record<DisclosureCategory, string> = {
  earnings: "실적",
  financing: "자금조달",
  treasury: "자사주",
  governance: "지배구조",
  ownership: "지분",
  dividend: "배당",
  guidance: "사업",
  litigation: "분쟁/제재",
  other: "기타",
};

/** Tone colors aligned with bm tokens. */
export const TONE_TOKENS: Record<
  DisclosureTone,
  { fg: string; bg: string; label: string }
> = {
  positive: { fg: "var(--bm-up)", bg: "var(--bm-up-soft)", label: "호재" },
  negative: { fg: "var(--bm-down)", bg: "var(--bm-down-soft)", label: "악재" },
  neutral: {
    fg: "var(--bm-muted)",
    bg: "var(--bm-soft-100)",
    label: "중립",
  },
};
