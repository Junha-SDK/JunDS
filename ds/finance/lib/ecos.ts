/**
 * ECOS (한국은행 경제통계시스템) Open API 클라이언트.
 *
 * 키가 없으면 throw하지 않고 null 반환 — 라우트 측에서 graceful fallback.
 * 응답은 단순한 시계열 형태로 정규화한다.
 */

const BASE = "https://ecos.bok.or.kr/api/StatisticSearch";

export interface EcosPoint {
  date: string; // YYYYMMDD / YYYYMM / YYYY
  value: number;
}

export interface EcosSeries {
  statCode: string;
  statName: string;
  itemCode: string;
  itemName: string;
  unit: string;
  cycle: "D" | "M" | "Q" | "Y";
  points: EcosPoint[];
}

interface EcosRow {
  STAT_CODE: string;
  STAT_NAME: string;
  ITEM_CODE1: string;
  ITEM_NAME1: string;
  UNIT_NAME: string;
  TIME: string;
  DATA_VALUE: string;
}

interface EcosEnvelope {
  StatisticSearch?: {
    list_total_count?: number;
    row?: EcosRow[];
  };
  RESULT?: { CODE: string; MESSAGE: string };
}

export function ecosKey(): string | null {
  return process.env.ECOS_API_KEY?.trim() || null;
}

/**
 * 시계열 조회.
 * cycle: D(일) M(월) Q(분기) A(연)
 * start/end: cycle에 맞는 형식 (D=YYYYMMDD, M=YYYYMM, Q=YYYYQN 형태로 ECOS 자체 사용)
 */
export async function fetchSeries(opts: {
  statCode: string;
  cycle: "D" | "M" | "Q" | "Y";
  start: string;
  end: string;
  itemCode: string;
  rows?: number;
  revalidate?: number;
}): Promise<EcosSeries | null> {
  const key = ecosKey();
  if (!key) return null;

  const cycle = opts.cycle === "Y" ? "A" : opts.cycle;
  const rows = opts.rows ?? 500;
  const url = `${BASE}/${key}/json/kr/1/${rows}/${opts.statCode}/${cycle}/${opts.start}/${opts.end}/${opts.itemCode}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: opts.revalidate ?? 1800 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as EcosEnvelope;
    const list = json.StatisticSearch?.row;
    if (!list || list.length === 0) return null;
    const points: EcosPoint[] = list
      .map((r) => ({ date: r.TIME, value: Number(r.DATA_VALUE) }))
      .filter((p) => Number.isFinite(p.value));
    if (points.length === 0) return null;
    const head = list[0];
    return {
      statCode: head.STAT_CODE,
      statName: head.STAT_NAME,
      itemCode: head.ITEM_CODE1,
      itemName: head.ITEM_NAME1,
      unit: head.UNIT_NAME,
      cycle: opts.cycle,
      points,
    };
  } catch {
    return null;
  }
}

/** YYYYMMDD format helpers. */
export function ymd(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

export function ym(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
}
