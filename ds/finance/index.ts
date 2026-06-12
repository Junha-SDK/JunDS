// Auto-generated barrel for ds/finance
// Conflict policy: components win, then lib, then charts.

export { AlertButton } from "./AlertButton";
export { AlertHeaderButton } from "./AlertHeaderButton";
export { AlertManager } from "./AlertManager";
export { AlertSheet } from "./AlertSheet";
export { AppHeader } from "./AppHeader";
export { AppIcon } from "./AppIcon";
export type { IconName } from "./AppIcon";
export { AreaChart } from "./AreaChart";
export { BmSwitch } from "./BmSwitch";
export type { BmSwitchProps, BmSwitchSize } from "./BmSwitch";
export { BottomNav } from "./BottomNav";
export { CandleChart } from "./CandleChart";
export type { MarkerLine } from "./CandleChart";
export { ChartRangePicker } from "./ChartRangePicker";
export {
  CommandPaletteHost,
  registerCommandItemsProvider,
  notifyCommandItemsChanged,
} from "./CommandPaletteHost";
export type { CommandItemsProvider } from "./CommandPaletteHost";
export { ConsensusScreener } from "./ConsensusScreener";
export { BacktestRunner } from "./BacktestRunner";
export { DisclosureToneBadge } from "./DisclosureToneBadge";
export { PortfolioCouncil } from "./PortfolioCouncil";
export { ThemeNewsSummary } from "./ThemeNewsSummary";
export { TradeJournal } from "./TradeJournal";
export { DailyThemesCalendar } from "./DailyThemesCalendar";
export { DayDetailDrawer } from "./DayDetailDrawer";
export { DisclosuresClient } from "./DisclosuresClient";
export { DonutChart } from "./DonutChart";
export type { DonutSlice } from "./DonutChart";
export { FXBoard } from "./FXBoard";
export { FZoneCard } from "./FZoneCard";
export { FZoneHelpModal } from "./FZoneHelpModal";
export { HoldingFormModal } from "./HoldingFormModal";
export { InvestorCouncil } from "./InvestorCouncil";
export { InvestorFlowChart, buildFlow } from "./InvestorFlowChart";
export { InvestorRanking } from "./InvestorRanking";
export { KeyValueGridClient } from "./KeyValueGridClient";
export { LiveInvestorBoard } from "./LiveInvestorBoard";
export { LivePctBadge, LivePrice, LiveStatusDot } from "./LivePrice";
export { LivePriceText, LivePctText, LiveStackedCell } from "./LiveCell";
export { GlobalKisSeeder } from "./GlobalKisSeeder";
export { LiveIndexCard } from "./LiveIndexCard";
export { LiveMarketStats } from "./LiveMarketStats";
export { LiveSectorStrength } from "./LiveSectorStrength";
export { LiveInvestorFlowCards } from "./LiveInvestorFlowCards";
export { LiveMicroKpiRow } from "./LiveMicroKpiRow";
export { LiveOrderBook } from "./LiveOrderBook";
export { LiveStockHeroChart } from "./LiveStockHeroChart";
export { LiveStockTable } from "./LiveStockTable";
export { LiveTicker } from "./LiveTicker";
export { LiveTopMovers } from "./LiveTopMovers";
export { Logo } from "./Logo";
export { MarketAlertBanner } from "./MarketAlertBanner";
export { MarketHeaderBadge } from "./MarketHeader";
export { MarketHeatmap, heatmapColor } from "./MarketHeatmap";
export type { HeatmapCell } from "./MarketHeatmap";
export { MarketIndexChart } from "./MarketIndexChart";
export { ClosePicksCard, LimitHitsCard, OpenPicksCard } from "./MarketSignals";
export { MiniCandle } from "./MiniCandle";
export { MultiLineChart } from "./MultiLineChart";
export { MyPositionPanel } from "./MyPositionPanel";
export { NewsList } from "./NewsList";
export type { NewsItem } from "./NewsList";
export { PageEmptyState } from "./PageEmptyState";
export { PageShell } from "./PageShell";
export { PortfolioDayDetailModal } from "./PortfolioDayDetailModal";
export { PortfolioHeatmap } from "./PortfolioHeatmap";
export { PositionBar } from "./PositionBar";
export { HotPctChip, PriceBadge } from "./PriceBadge";
export { QuarterBarChart } from "./QuarterBarChart";
export { RealCandleChart } from "./RealCandleChart";
export { RealQuoteHeader } from "./RealQuoteHeader";
export { RecentVisitTracker } from "./RecentVisitTracker";
export { RecentlyViewed } from "./RecentlyViewed";
export { SearchBox } from "./SearchBox";
export { SegmentedPill } from "./SegmentedPill";
export type { SegmentOption, SegmentedPillProps } from "./SegmentedPill";
export { Sidebar } from "./Sidebar";
export { Sparkline } from "./Sparkline";
export { StarButton } from "./StarButton";
export { StockTopBar } from "./StockTopBar";
export { StrategyPanel } from "./StrategyPanel";
export { ThemeCard, ThemePillCard } from "./ThemeCard";
export { ThemeDrillDown } from "./ThemeDrillDown";
export { ThemeTagList } from "./ThemeTagList";
export { ThemeToggle } from "./ThemeToggle";
export { TopBar } from "./TopBar";
export { WatchlistWidget } from "./WatchlistWidget";
export { ACCENT_PRESETS, DEFAULT_ACCENT, applyAccent, buildAccentTokens, isValidHex, readAccent, useAccent } from "./lib/accentColor";
export type { AccentPreset, AccentTokens } from "./lib/accentColor";
export { addAlert, getAlerts, markTriggered, reactivate, removeAlert, useAlerts } from "./lib/alerts";
export type { AlertDirection, PriceAlert } from "./lib/alerts";
export { BROKERAGES, DEFAULT_BROKERAGE_ID, TRANSACTION_TAX, calcFees, getBrokerage, useBrokerage } from "./lib/brokerages";
export type { Brokerage } from "./lib/brokerages";
export { candleSeries, metricsFor, priceSeries } from "./lib/compareData";
export type { CompareMetric } from "./lib/compareData";
export { DAILY_THEMES, weeklyRows } from "./lib/dailyThemes";
export type { DailyThemeEntry, LeaderStock } from "./lib/dailyThemes";
export { disclosuresFor, quarterlyFor } from "./lib/financials";
export type { Disclosure, QuarterRow } from "./lib/financials";
export { fmtDate, fmtKR억, fmtNumber, fmtPct, fmtSigned, fmtSignedPct, fmtTime, priceColorClass } from "./lib/format";
export { HEATMAP_FLAT, HEATMAP_GROUPS } from "./lib/heatmapData";
export type { HeatmapGroup } from "./lib/heatmapData";
export { useHoldings } from "./lib/holdings";
export type { Holding } from "./lib/holdings";
export type { DayFlow } from "./lib/investorFlow";
export { INVESTORS, INVESTOR_LIST, scoreAllInvestors, scoreForInvestor } from "./lib/investors";
export type { FundamentalSnapshot, InvestorId, InvestorProfile, InvestorScoreCard } from "./lib/investors";
export { currentTick, seedTick, subscribe, useLivePrice, useLivePrices, useRealPrices, useRealPricesSnapshot } from "./lib/livePrices";
export type { ChartType, ChartIndicators, CompareLine, EventMarker } from "./CandleChart";
export {
  useKoreaTime,
  toKoreaParts,
  formatKoreaClock,
  formatKoreaClock24,
  formatKoreaDate,
  formatKoreaDateShort,
} from "./lib/koreaTime";
export type { KoreaTime } from "./lib/koreaTime";
export { useLiveIndex } from "./lib/liveIndices";
export type { IndexTick } from "./lib/liveIndices";
export { useLiveOrderBook } from "./lib/liveOrderBook";
export type { OrderBookLevel, OrderBookTick } from "./lib/liveOrderBook";
export { buildMonthDays, fmtISO, holidayName, holidaysInMonth, isMarketClosed, isMarketOpenNow, isWeekend, marketStatusLabel, pad2 } from "./lib/marketHolidays";
export type { MarketHoliday, MonthDay } from "./lib/marketHolidays";
export { CLOSE_PICKS, LIMIT_HITS, OPEN_PICKS, limitHitsByTime, sortedPicks } from "./lib/marketSignals";
export type { LimitHit, PickItem } from "./lib/marketSignals";
export { FZONE_CARDS, GOLDZONE_CARDS, NXT_ROWS, PORTFOLIO_DAYS, SCHEDULE, SFZONE_CARDS, SWING38_CARDS, THEMES, makeOrderBook, seedCandles, seedSeries, seedSurgeCandles } from "./lib/mock";
export type { Candle, IpoMeta, NxtRow, OrderRow, ScheduleItem, ScheduleKind, ThemeBlock, ThemeStock, ZoneKind } from "./lib/mock";
export { MONTHLY_THEMES, findMonthly, ytdReturn } from "./lib/monthlyThemes";
export type { MonthlyThemeEntry } from "./lib/monthlyThemes";
export { clearRecent, recordVisit, useRecentlyViewed } from "./lib/recentlyViewed";
export { STOCKS, findStock, searchStocks } from "./lib/stocks";
export type { StockInfo } from "./lib/stocks";
export { strategyFor } from "./lib/strategy";
export type { StrategyLevel, StrategySnapshot } from "./lib/strategy";
export { FOREIGN_GAIN_RATE, KR_BASIC_DEDUCTION, KR_DIVIDEND_WITHHOLDING, KR_LARGE_SHAREHOLDER_RATE_HIGH, KR_LARGE_SHAREHOLDER_RATE_LOW, KR_LARGE_SHAREHOLDER_THRESHOLD, TRANSACTION_TAX_RATE, US_DIVIDEND_KR_ADDON, US_DIVIDEND_LOCAL, estimateDividends, estimateDomesticGain, estimateForeignGain } from "./lib/tax";
export type { DividendInput, DividendResult, DomesticGainInput, DomesticGainResult, ForeignGainInput, ForeignGainResult } from "./lib/tax";
export { useThemeMode } from "./lib/themeMode";
export type { ThemeMode } from "./lib/themeMode";
export { INDEX_TICKERS, TICKER_MAP, tickerFor } from "./lib/tickers";
export { useMarketStatus } from "./lib/useMarketStatus";
export type { MarketStatus } from "./lib/useMarketStatus";
export { useWatchlist } from "./lib/watchlist";
export { LazyCandleChart, LazyInvestorFlowChart, LazyMarketHeatmap, LazyMultiLineChart, LazyQuarterBarChart, LazyRealCandleChart } from "./charts/lazy";

// Consensus
export { scoreConsensusRow, scoreUniverse, consensusOverview, snapshotForName } from "./lib/consensus";
export type { ConsensusRow, ConsensusFilter } from "./lib/consensus";
// Disclosure tone
export { classifyDisclosure, CATEGORY_LABELS, TONE_TOKENS } from "./lib/disclosureTone";
export type { ClassifiedDisclosure, DisclosureTone, DisclosureCategory } from "./lib/disclosureTone";
// Backtest
export { backtestInvestor } from "./lib/backtest";
export type { BacktestPoint, BacktestResult, BacktestOptions } from "./lib/backtest";
// Trade journal
export { useTradeJournal, reviewTrade, journalStats } from "./lib/tradeJournal";
export type { TradeEntry, TradeSide, TradeReview, JournalStats } from "./lib/tradeJournal";
// News summary
export { summarizeNews } from "./lib/newsSummary";
export type { NewsSummary, SummarizableNews } from "./lib/newsSummary";
// Position derivation (lot-level history from trade journal)
export {
  derivePositionsFromTrades,
  mergePositions,
  buildPositions,
  summarizeRealized,
} from "./lib/positions";
export type {
  DerivedPosition,
  PositionLot,
  RealizedSell,
  RealizedSummary,
} from "./lib/positions";
// Daily portfolio snapshots
export { captureSnapshot, useSnapshots } from "./lib/snapshots";
export type { PortfolioSnapshot, SnapshotHoldingSlice, SnapshotInput } from "./lib/snapshots";
