/**
 * Heuristic news summary — extractive (no LLM).
 *
 * Approach:
 *  1. Tokenize titles + descriptions to extract Korean noun-ish chunks.
 *  2. Score sentences by keyword frequency × position weight (lead bias).
 *  3. Tone = positive/negative keyword count delta.
 *  4. Return top sentences + key terms.
 *
 * Server-safe: pure functions. Inputs are NewsList items already fetched.
 */

export interface SummarizableNews {
  title: string;
  description?: string;
  source?: string;
  publishedAt: string;
}

export interface NewsSummary {
  /** 1–3 sentence extractive summary, joined. */
  summary: string;
  /** Distinct sentences chosen, in order. */
  sentences: string[];
  /** Top key terms with counts. */
  keyTerms: { term: string; count: number }[];
  /** Net tone in [-1, 1]. */
  tone: number;
  /** Item count contributing to summary. */
  itemCount: number;
}

const POSITIVE_TERMS = [
  "호실적", "역대 최대", "신고가", "수주", "공급계약", "기술이전",
  "흑자전환", "급등", "강세", "상향", "확대", "성장", "돌파", "수출",
  "혁신", "신규", "최대", "수혜", "자사주", "배당", "특허",
];
const NEGATIVE_TERMS = [
  "하향", "급락", "약세", "감자", "유상증자", "감소", "적자전환",
  "손실", "리콜", "소송", "거래정지", "관리종목", "상장폐지",
  "횡령", "배임", "매각", "철수", "파업", "리스크",
];

const STOPWORDS = new Set([
  "그리고", "그러나", "하지만", "또한", "이번", "지난", "최근", "오늘",
  "내일", "관련", "위해", "위한", "있다", "이다", "있는", "했다", "하는",
  "에서", "으로", "에는", "이는", "라고", "라며", "보다", "에서는",
]);

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?。！？])\s+|\n+/g)
    .map((s) => s.trim())
    .filter((s) => s.length >= 8);
}

function tokenize(text: string): string[] {
  // Crude: split on whitespace + punctuation; keep tokens of length 2..12 with hangul
  return text
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/g)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && t.length <= 12 && !STOPWORDS.has(t));
}

function countTone(text: string): number {
  let pos = 0;
  let neg = 0;
  for (const k of POSITIVE_TERMS) if (text.includes(k)) pos++;
  for (const k of NEGATIVE_TERMS) if (text.includes(k)) neg++;
  const total = pos + neg;
  return total === 0 ? 0 : (pos - neg) / total;
}

export function summarizeNews(items: SummarizableNews[], maxSentences = 3): NewsSummary {
  if (items.length === 0) {
    return { summary: "", sentences: [], keyTerms: [], tone: 0, itemCount: 0 };
  }

  // Build term frequency from titles (weight 2x) and descriptions
  const tf = new Map<string, number>();
  for (const it of items) {
    for (const w of tokenize(it.title)) tf.set(w, (tf.get(w) ?? 0) + 2);
    if (it.description)
      for (const w of tokenize(it.description)) tf.set(w, (tf.get(w) ?? 0) + 1);
  }

  // Candidate sentences pool — both titles and description sentences
  const candidates: { text: string; weight: number; idx: number }[] = [];
  items.forEach((it, idx) => {
    candidates.push({ text: it.title, weight: 1.5, idx });
    if (it.description) {
      const sents = splitSentences(it.description);
      sents.forEach((s, si) => {
        candidates.push({ text: s, weight: 1.0 - si * 0.15, idx });
      });
    }
  });

  // Score each candidate
  const scored = candidates.map((c) => {
    const tokens = tokenize(c.text);
    const score =
      tokens.reduce((s, t) => s + (tf.get(t) ?? 0), 0) *
      Math.max(0.3, c.weight);
    return { ...c, score };
  });
  scored.sort((a, b) => b.score - a.score);

  // Pick top non-redundant sentences
  const picked: string[] = [];
  const seenItems = new Set<number>();
  for (const c of scored) {
    if (picked.length >= maxSentences) break;
    if (seenItems.has(c.idx)) continue; // diversify across items
    if (picked.some((p) => similarity(p, c.text) > 0.6)) continue;
    picked.push(c.text);
    seenItems.add(c.idx);
  }

  const keyTerms = [...tf.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([term, count]) => ({ term, count }));

  // Tone across all titles+descs
  const toneText = items.map((i) => `${i.title} ${i.description ?? ""}`).join(" ");
  const tone = countTone(toneText);

  return {
    summary: picked.join(" "),
    sentences: picked,
    keyTerms,
    tone,
    itemCount: items.length,
  };
}

/** Jaccard similarity over token sets. */
function similarity(a: string, b: string): number {
  const sa = new Set(tokenize(a));
  const sb = new Set(tokenize(b));
  if (sa.size === 0 || sb.size === 0) return 0;
  let inter = 0;
  for (const x of sa) if (sb.has(x)) inter++;
  const union = sa.size + sb.size - inter;
  return union === 0 ? 0 : inter / union;
}
