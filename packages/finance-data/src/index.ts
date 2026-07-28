/**
 * @junds/finance-data — 클라이언트 안전 배럴.
 *
 * ⚠ 서버 전용 모듈은 여기서 export하지 않는다 (v2 배럴과의 의도적 차이 — DEC-014):
 *   - `@junds/finance-data/kis`   — node:fs/env 의존 + 브라우저 평가 시 즉시 throw
 *   - `@junds/finance-data/yahoo` — yahoo-finance2 전체를 끌고 옴 (서버 권장)
 * 위 둘은 반드시 서브패스로 import한다. 배럴은 브라우저 번들에 안전한
 * 모듈만 담는다 (ecos/fred/rss는 fetch 기반 — 서버 권장이지만 평가 자체는 무해).
 */

export {
  configureFinanceData,
  getFinanceDataConfig,
  type FinanceDataConfig,
  type SeedQuote,
  type FetchInit,
} from "./config.js";

export { TICKER_MAP, INDEX_TICKERS, tickerFor } from "./tickers.js";

export { ecosKey, fetchSeries, ym, ymd } from "./ecos.js";
export type { EcosPoint, EcosSeries } from "./ecos.js";

export { fetchFredLatest, fetchFredSeries, fetchFredYoY, fredKey } from "./fred.js";
export type { FredPoint, FredSeries } from "./fred.js";

export { FEED_SPECS, fetchAllFeeds, fetchRss, parseRss } from "./rss.js";
export type { RssFeedSpec, RssItem } from "./rss.js";

export { summarizeNews } from "./newsSummary.js";
export type { NewsSummary, SummarizableNews } from "./newsSummary.js";

export { parseIndexTickEvent, parseOrderBookTickEvent, parseStreamTickEvent } from "./stream.js";
export type {
  IndexTick,
  OrderBookLevel,
  OrderBookTick,
  StreamTickEvent,
  TickVenue,
} from "./stream.js";

export {
  currentTick,
  getPoolStatus,
  registerPoolCodes,
  seedSnapshotOnce,
  seedTick,
  subscribe,
  subscribePoolStatus,
} from "./livePrices.js";
export type { PoolStatus, RealPriceSource, Tick } from "./livePrices.js";

export { currentIndexTick, subscribeIndex } from "./liveIndices.js";
