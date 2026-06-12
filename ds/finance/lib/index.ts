// Auto-generated barrel for ds/finance/lib

export { ACCENT_PRESETS, DEFAULT_ACCENT, applyAccent, buildAccentTokens, isValidHex, readAccent, useAccent } from "./accentColor";
export type { AccentPreset, AccentTokens } from "./accentColor";
export { addAlert, getAlerts, markTriggered, reactivate, removeAlert, useAlerts } from "./alerts";
export type { AlertDirection, PriceAlert } from "./alerts";
export { COOKIE_NAME, GUEST_TTL_SECONDS_DEFAULT, OWNER_TTL_SECONDS, checkOwnerPassword, issueGuestToken, issueOwnerToken, signToken, verifyToken } from "./auth";
export type { AuthClaims, Role } from "./auth";
export { BROKERAGES, DEFAULT_BROKERAGE_ID, TRANSACTION_TAX, calcFees, getBrokerage, useBrokerage } from "./brokerages";
export type { Brokerage } from "./brokerages";
export { candleSeries, metricsFor, priceSeries } from "./compareData";
export type { CompareMetric } from "./compareData";
export { DAILY_THEMES, weeklyRows } from "./dailyThemes";
export type { DailyThemeEntry, LeaderStock } from "./dailyThemes";
export { ecosKey, fetchSeries, ym, ymd } from "./ecos";
export type { EcosPoint, EcosSeries } from "./ecos";
export { fetchFredLatest, fetchFredSeries, fetchFredYoY, fredKey } from "./fred";
export type { FredPoint, FredSeries } from "./fred";
export { fetchChart, fetchIndex, fetchInvestorFlow, fetchOrderBook, fetchQuote, kisCodeFor } from "./kis";
export type { ChartPeriod, IndexCode, KisAskBidLevel, KisCandle, KisIndex, KisInvestorFlow, KisOrderBook, KisQuote } from "./kis";
export { disclosuresFor, quarterlyFor } from "./financials";
export type { Disclosure, QuarterRow } from "./financials";
export { fmtDate, fmtKR억, fmtNumber, fmtPct, fmtSigned, fmtSignedPct, fmtTime, priceColorClass } from "./format";
export { heatmapColor } from "./heatmapColor";
export { HEATMAP_FLAT, HEATMAP_GROUPS } from "./heatmapData";
export type { HeatmapGroup } from "./heatmapData";
export { useHoldings } from "./holdings";
export type { Holding } from "./holdings";
export { buildFlow } from "./investorFlow";
export type { DayFlow } from "./investorFlow";
export { INVESTORS, INVESTOR_LIST, scoreAllInvestors, scoreForInvestor } from "./investors";
export type { FundamentalSnapshot, InvestorId, InvestorProfile, InvestorScoreCard } from "./investors";
export { currentTick, seedTick, subscribe, useLivePrice, useLivePrices, useRealPrices, useRealPricesSnapshot } from "./livePrices";
export {
  useKoreaTime,
  toKoreaParts,
  formatKoreaClock,
  formatKoreaClock24,
  formatKoreaDate,
  formatKoreaDateShort,
} from "./koreaTime";
export type { KoreaTime } from "./koreaTime";
export { useLiveIndex } from "./liveIndices";
export type { IndexTick } from "./liveIndices";
export { useLiveOrderBook } from "./liveOrderBook";
export type { OrderBookLevel, OrderBookTick } from "./liveOrderBook";
export { buildMonthDays, fmtISO, holidayName, holidaysInMonth, isLiveSession, isMarketClosed, isMarketOpenNow, isNxtSession, isWeekend, marketStatusLabel, pad2 } from "./marketHolidays";
export type { MarketHoliday, MarketSessionLabel, MonthDay } from "./marketHolidays";
export { CLOSE_PICKS, LIMIT_HITS, OPEN_PICKS, limitHitsByTime, sortedPicks } from "./marketSignals";
export type { LimitHit, PickItem } from "./marketSignals";
export { FZONE_CARDS, GOLDZONE_CARDS, NXT_ROWS, PORTFOLIO_DAYS, SCHEDULE, SFZONE_CARDS, SWING38_CARDS, THEMES, makeOrderBook, seedCandles, seedSeries, seedSurgeCandles } from "./mock";
export type { Candle, FZoneCard, IpoMeta, NxtRow, OrderRow, ScheduleItem, ScheduleKind, ThemeBlock, ThemeStock, ZoneKind } from "./mock";
export { MONTHLY_THEMES, findMonthly, ytdReturn } from "./monthlyThemes";
export type { MonthlyThemeEntry } from "./monthlyThemes";
export { clearRecent, recordVisit, useRecentlyViewed } from "./recentlyViewed";
export { FEED_SPECS, fetchAllFeeds, fetchRss, parseRss } from "./rss";
export type { RssFeedSpec, RssItem } from "./rss";
export { STOCKS, findStock, searchStocks } from "./stocks";
export type { StockInfo } from "./stocks";
export { strategyFor } from "./strategy";
export type { StrategyLevel, StrategySnapshot } from "./strategy";
export { FOREIGN_GAIN_RATE, KR_BASIC_DEDUCTION, KR_DIVIDEND_WITHHOLDING, KR_LARGE_SHAREHOLDER_RATE_HIGH, KR_LARGE_SHAREHOLDER_RATE_LOW, KR_LARGE_SHAREHOLDER_THRESHOLD, TRANSACTION_TAX_RATE, US_DIVIDEND_KR_ADDON, US_DIVIDEND_LOCAL, estimateDividends, estimateDomesticGain, estimateForeignGain } from "./tax";
export type { DividendInput, DividendResult, DomesticGainInput, DomesticGainResult, ForeignGainInput, ForeignGainResult } from "./tax";
export { useThemeMode } from "./themeMode";
export type { ThemeMode } from "./themeMode";
export { INDEX_TICKERS, TICKER_MAP, tickerFor } from "./tickers";
export { useMarketStatus } from "./useMarketStatus";
export type { MarketStatus } from "./useMarketStatus";
export { useWatchlist } from "./watchlist";
export { yahoo } from "./yahoo";

// Consensus screener
export {
  scoreConsensusRow,
  scoreUniverse,
  consensusOverview,
  snapshotForName,
} from "./consensus";
export type { ConsensusRow, ConsensusFilter } from "./consensus";

// Disclosure tone classifier
export {
  classifyDisclosure,
  CATEGORY_LABELS,
  TONE_TOKENS,
} from "./disclosureTone";
export type {
  ClassifiedDisclosure,
  DisclosureTone,
  DisclosureCategory,
} from "./disclosureTone";

// Backtest
export { backtestInvestor } from "./backtest";
export type {
  BacktestPoint,
  BacktestResult,
  BacktestOptions,
} from "./backtest";

// Trade journal
export { useTradeJournal, reviewTrade, journalStats } from "./tradeJournal";
export type {
  TradeEntry,
  TradeSide,
  TradeReview,
  JournalStats,
} from "./tradeJournal";

// News summary
export { summarizeNews } from "./newsSummary";
export type { NewsSummary, SummarizableNews } from "./newsSummary";

// Position derivation (lot history from trade journal)
export {
  derivePositionsFromTrades,
  mergePositions,
  buildPositions,
  summarizeRealized,
} from "./positions";
export type { DerivedPosition, PositionLot, RealizedSell, RealizedSummary } from "./positions";

// Daily portfolio snapshots
export { captureSnapshot, useSnapshots } from "./snapshots";
export type { PortfolioSnapshot, SnapshotHoldingSlice, SnapshotInput } from "./snapshots";
