/**
 * @junds/finance-data 런타임 설정.
 *
 * v2(ds/finance/lib)는 API 엔드포인트(`/api/kis/*`, `/api/quotes`)와 시드 소스
 * (`findStock` — 데모 mock)를 하드코딩했다. 이 패키지는 프레임워크·앱 무관이므로
 * 그 결합을 주입 지점으로 승격한다. 기본값은 v2와 동일 — 설정 없이 쓰면 v2와
 * 완전히 같은 경로를 때린다 (시그니처·동작 보존).
 */

/** 클라 스토어(livePrices/liveIndices)가 시드 폴백으로 쓸 종목 스냅샷. */
export interface SeedQuote {
  price: number;
  change: number;
}

export interface FinanceDataConfig {
  /** KIS REST 스냅샷 프록시 — v2 기본 `/api/kis/quotes?codes=...` */
  kisQuotesUrl: string;
  /** Yahoo 배치 시세 프록시(폴백) — v2 기본 `/api/quotes?symbols=...` */
  batchQuotesUrl: string;
  /** KIS WebSocket→SSE 브리지 — v2 기본 `/api/kis/stream` */
  streamUrl: string;
  /**
   * 틱 스토어 초기 시드 조회. v2에서는 데모 mock(`findStock`)이었다.
   * 미설정 시 시드 없음(가격 0) — 실데이터(SSE/REST)가 도착하면 채워진다.
   */
  seedLookup: (name: string) => SeedQuote | undefined;
}

const config: FinanceDataConfig = {
  kisQuotesUrl: "/api/kis/quotes",
  batchQuotesUrl: "/api/quotes",
  streamUrl: "/api/kis/stream",
  seedLookup: () => undefined,
};

/** 부분 설정 병합. 앱 부트스트랩(클라 진입점)에서 1회 호출을 권장. */
export function configureFinanceData(partial: Partial<FinanceDataConfig>): void {
  Object.assign(config, partial);
}

/** 현재 설정 조회 — 호출 시점 값 (스토어들은 매 호출마다 읽는다). */
export function getFinanceDataConfig(): FinanceDataConfig {
  return config;
}

/**
 * Next.js `fetch` 확장(`next: { revalidate }`) 힌트를 프레임워크 무관 타입으로 표기.
 * Next 서버 런타임에서는 캐시 TTL로 동작하고, 그 외 런타임에서는 무해하게 무시된다.
 */
export type FetchInit = RequestInit & { next?: { revalidate?: number } };
