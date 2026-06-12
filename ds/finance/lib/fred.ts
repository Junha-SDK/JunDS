/**
 * FRED (Federal Reserve Economic Data) Open API 클라이언트.
 *
 * 키가 없으면 throw하지 않고 null 반환 — 라우트 측에서 graceful fallback.
 * ECOS 모듈과 동일한 단순 시계열 형태로 정규화한다.
 */

const BASE = "https://api.stlouisfed.org/fred/series/observations";

export interface FredPoint {
  date: string; // YYYY-MM-DD
  value: number;
}

export interface FredSeries {
  seriesId: string;
  points: FredPoint[];
}

interface FredObservation {
  date: string;
  value: string; // FRED returns values as strings; "." denotes missing
}

interface FredEnvelope {
  observations?: FredObservation[];
  error_code?: number;
  error_message?: string;
}

export function fredKey(): string | null {
  return process.env.FRED_API_KEY?.trim() || null;
}

/**
 * 시계열 조회. 기본은 최신순 desc.
 * - revalidate: 캐시 TTL (초). 거시 지표는 자주 안 바뀌므로 디폴트 1시간.
 */
export async function fetchFredSeries(opts: {
  seriesId: string;
  limit?: number;
  revalidate?: number;
}): Promise<FredSeries | null> {
  const key = fredKey();
  if (!key) return null;
  const url = new URL(BASE);
  url.searchParams.set("series_id", opts.seriesId);
  url.searchParams.set("api_key", key);
  url.searchParams.set("file_type", "json");
  url.searchParams.set("sort_order", "desc");
  url.searchParams.set("limit", String(opts.limit ?? 24));

  // FRED는 가끔 transient 5xx를 뱉어서 1회 재시도(짧은 백오프) 한다.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url.toString(), {
        next: { revalidate: opts.revalidate ?? 3600 },
      });
      if (!res.ok) {
        if (res.status >= 500 && attempt === 0) {
          await new Promise((r) => setTimeout(r, 250));
          continue;
        }
        return null;
      }
      const json = (await res.json()) as FredEnvelope;
      if (!json.observations || json.observations.length === 0) return null;
      const points: FredPoint[] = json.observations
        .filter((o) => o.value !== "." && o.value !== "")
        .map((o) => ({ date: o.date, value: Number(o.value) }))
        .filter((p) => Number.isFinite(p.value));
      if (points.length === 0) return null;
      return { seriesId: opts.seriesId, points };
    } catch {
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 250));
        continue;
      }
      return null;
    }
  }
  return null;
}

/** 가장 최근 값 한 점만 빠르게. */
export async function fetchFredLatest(
  seriesId: string,
  revalidate = 3600,
): Promise<{ date: string; value: number } | null> {
  const s = await fetchFredSeries({ seriesId, limit: 1, revalidate });
  return s ? s.points[0] : null;
}

/**
 * 동일한 series에서 최근값과 12개월 전 값을 받아 YoY 변화율(%)을 계산.
 * CPI 같은 인플레이션 지표에 사용.
 */
export async function fetchFredYoY(
  seriesId: string,
  revalidate = 3600,
): Promise<{ date: string; latest: number; yoyPct: number } | null> {
  const s = await fetchFredSeries({ seriesId, limit: 14, revalidate });
  if (!s || s.points.length < 13) return null;
  const latest = s.points[0];
  const yearAgo = s.points[12]; // points는 desc 순서
  if (!yearAgo || yearAgo.value === 0) return null;
  return {
    date: latest.date,
    latest: latest.value,
    yoyPct: ((latest.value - yearAgo.value) / yearAgo.value) * 100,
  };
}
