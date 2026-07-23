/**
 * v2 시그니처 패리티 — 컴파일 타임 검증.
 *
 * 아래 타입 별칭은 v2(ds/finance/lib)의 공개 함수 시그니처를 그대로 옮겨 적은
 * 것이다. 이 파일은 `npm run typecheck`(tsc)가 검사한다 — 패키지 함수가 v2
 * 모양에 대입 불가능해지면 컴파일 에러로 잡힌다. (vitest 는 esbuild 변환이라
 * 타입 오류를 잡지 않는다 — 런타임 단언은 존재/종류 확인만 한다.)
 *
 * v2 원본 대조: ds/finance/lib/{kis,ecos,fred,rss,newsSummary,tickers,yahoo,livePrices}.ts
 */
import { describe, it, expect } from "vitest";
import type YahooFinance from "yahoo-finance2";

import { yahoo } from "../src/yahoo.js";
import {
  kisCodeFor, fetchQuote, fetchChart, fetchOrderBook, fetchInvestorFlow, fetchIndex,
  type KisQuote, type KisCandle, type KisOrderBook, type KisInvestorFlow, type KisIndex,
  type ChartPeriod, type IndexCode,
} from "../src/kis.js";
import { ecosKey, fetchSeries, ymd, ym, type EcosSeries } from "../src/ecos.js";
import {
  fredKey, fetchFredSeries, fetchFredLatest, fetchFredYoY, type FredSeries,
} from "../src/fred.js";
import {
  parseRss, fetchRss, fetchAllFeeds, FEED_SPECS, type RssItem, type RssFeedSpec,
} from "../src/rss.js";
import { summarizeNews, type NewsSummary, type SummarizableNews } from "../src/newsSummary.js";
import { TICKER_MAP, INDEX_TICKERS, tickerFor } from "../src/tickers.js";
import { subscribe, currentTick, seedTick, type Tick, type TickVenue } from "../src/livePrices.js";

/* ── v2 ds/finance/lib/yahoo.ts ── */
const _yahoo: () => InstanceType<typeof YahooFinance> = yahoo;

/* ── v2 ds/finance/lib/kis.ts ── */
const _kisCodeFor: (input: string) => string | null = kisCodeFor;
const _fetchQuote: (name: string, venue?: "J" | "NX" | "UN") => Promise<KisQuote | null> = fetchQuote;
const _fetchChart: (
  name: string, period?: ChartPeriod, fromDate?: string, toDate?: string,
) => Promise<KisCandle[]> = fetchChart;
const _fetchOrderBook: (name: string) => Promise<KisOrderBook | null> = fetchOrderBook;
const _fetchInvestorFlow: () => Promise<KisInvestorFlow> = fetchInvestorFlow;
const _fetchIndex: (code: IndexCode) => Promise<KisIndex> = fetchIndex;

/* ── v2 ds/finance/lib/ecos.ts ── */
const _ecosKey: () => string | null = ecosKey;
const _fetchSeries: (opts: {
  statCode: string; cycle: "D" | "M" | "Q" | "Y"; start: string; end: string;
  itemCode: string; rows?: number; revalidate?: number;
}) => Promise<EcosSeries | null> = fetchSeries;
const _ymd: (d: Date) => string = ymd;
const _ym: (d: Date) => string = ym;

/* ── v2 ds/finance/lib/fred.ts ── */
const _fredKey: () => string | null = fredKey;
const _fetchFredSeries: (opts: {
  seriesId: string; limit?: number; revalidate?: number;
}) => Promise<FredSeries | null> = fetchFredSeries;
const _fetchFredLatest: (
  seriesId: string, revalidate?: number,
) => Promise<{ date: string; value: number } | null> = fetchFredLatest;
const _fetchFredYoY: (
  seriesId: string, revalidate?: number,
) => Promise<{ date: string; latest: number; yoyPct: number } | null> = fetchFredYoY;

/* ── v2 ds/finance/lib/rss.ts ── */
const _parseRss: (xml: string, source: string) => RssItem[] = parseRss;
const _fetchRss: (spec: RssFeedSpec, revalidate?: number) => Promise<RssItem[]> = fetchRss;
const _fetchAllFeeds: (specs?: RssFeedSpec[], revalidate?: number) => Promise<RssItem[]> = fetchAllFeeds;
const _feedSpecs: RssFeedSpec[] = FEED_SPECS;

/* ── v2 ds/finance/lib/newsSummary.ts ── */
const _summarizeNews: (items: SummarizableNews[], maxSentences?: number) => NewsSummary = summarizeNews;

/* ── v2 ds/finance/lib/tickers.ts ── */
const _tickerMap: Record<string, string> = TICKER_MAP;
const _indexTickers: { readonly kospi: "^KS11"; readonly kosdaq: "^KQ11" } = INDEX_TICKERS;
const _tickerFor: (name: string) => string | null = tickerFor;

/* ── v2 ds/finance/lib/livePrices.ts (스토어 계층) ── */
const _subscribe: (name: string, cb: (t: Tick) => void) => () => void = subscribe;
const _currentTick: (name: string) => Tick = currentTick;
const _seedTick: (
  name: string, price: number, changePct: number, venue?: TickVenue,
) => void = seedTick;

describe("v2 signature parity", () => {
  it("이관 함수 전부 함수형으로 export 됨 (컴파일 통과 자체가 시그니처 검증)", () => {
    const fns = [
      _yahoo, _kisCodeFor, _fetchQuote, _fetchChart, _fetchOrderBook,
      _fetchInvestorFlow, _fetchIndex, _ecosKey, _fetchSeries, _ymd, _ym,
      _fredKey, _fetchFredSeries, _fetchFredLatest, _fetchFredYoY,
      _parseRss, _fetchRss, _fetchAllFeeds, _summarizeNews, _tickerFor,
      _subscribe, _currentTick, _seedTick,
    ];
    for (const fn of fns) expect(typeof fn).toBe("function");
    expect(Array.isArray(_feedSpecs)).toBe(true);
    expect(typeof _tickerMap).toBe("object");
    expect(_indexTickers.kospi).toBe("^KS11");
  });
});
