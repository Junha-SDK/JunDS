"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PriceBadge } from "./PriceBadge";
import { StarButton } from "./StarButton";
import { AlertButton } from "./AlertButton";
import { AppIcon } from "./AppIcon";
import { fmtKR억 } from "./lib/format";
import { findStock } from "./lib/stocks";
import { useLivePrice } from "./lib/livePrices";

interface StockTopBarProps {
  symbol: string;
  active: "info" | "chart" | "order" | "financials" | "disclosures" | "investor";
  /** Optional manual override; otherwise derived from findStock + live ticker */
  price?: number;
  diff?: number;
  pct?: number;
  amount억?: number;
  /**
   * 화면에 표시할 종목명. URL이 `018260.KS` 같은 코드 형태일 때
   * 호출부(SSR)에서 "삼성에스디에스" 같은 한글명을 알아내 넘겨준다.
   * 미지정 시 `findStock(symbol)` → URL 디코드 순으로 폴백.
   */
  displayName?: string;
}

const TABS = [
  { key: "info", label: "정보", suffix: "" },
  { key: "chart", label: "차트", suffix: "/chart" },
  { key: "order", label: "호가", suffix: "/order" },
  { key: "financials", label: "재무", suffix: "/financials" },
  { key: "disclosures", label: "공시", suffix: "/disclosures" },
  { key: "investor", label: "AI 위원회", suffix: "/investor" },
] as const;

export function StockTopBar({ symbol, active, price, diff, pct, amount억, displayName }: StockTopBarProps) {
  const router = useRouter();
  const decoded = decodeURIComponent(symbol);
  const stock = findStock(decoded);
  const live = useLivePrice(decoded);
  // 표시명 결정: 호출부가 넘겨준 displayName(SSR 보강) → findStock 한글명 → URL 디코드.
  // 코드(018260.KS) 자체가 그대로 헤더에 노출되지 않도록 한다.
  const headerName = displayName ?? stock?.name ?? decoded;

  // KIS WebSocket tick(`live.price`)이 도착했다면 그게 진실. props 로 넘어온 가격은
  // 보통 SSR 시점 KIS REST 스냅샷이라 수초~수십초 지연됨 — live 가 있으면 무조건 우선.
  // tick 전(`live.price === 0`)에는 SSR prop → JunDS 정적 stocks → 0 순서로 폴백.
  const liveActive = live.price > 0;
  const displayPrice = liveActive ? live.price : (price ?? stock?.price ?? 0);
  const displayPct = liveActive ? live.change : (pct ?? stock?.change ?? 0);
  const displayDiff = liveActive
    ? Math.round((live.price * live.change) / Math.max(100 + live.change, 1))
    : (diff ?? Math.round((displayPrice * displayPct) / Math.max(100 + displayPct, 1)));
  const displayAmt = amount억 ?? 0;

  const up = displayPct >= 0;
  const trendColor = up ? "var(--bm-up)" : "var(--bm-down)";
  const arrow = up ? "▲" : "▼";

  return (
    <header
      className="sticky z-20 backdrop-blur-md"
      style={{
        top: "var(--bm-topbar-h, 53px)",
        background: "color-mix(in srgb, var(--bm-bg) 92%, transparent)",
        borderBottom: "1px solid var(--bm-border)",
      }}
    >
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 pt-2.5 sm:pt-3">
        {/* Row 1: back + title + price */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label="뒤로"
            onClick={() => router.back()}
            className="size-9 rounded-full grid place-items-center transition-colors hover:bg-[var(--bm-soft-100)] shrink-0"
            style={{ color: "var(--bm-muted-strong)" }}
          >
            <AppIcon name="chevronLeft" size={20} strokeWidth={2.4} />
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
            <StarButton name={decoded} size={18} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="font-extrabold text-[15px] sm:text-[17px] tracking-tight truncate">
                  {headerName}
                </h1>
                {stock?.sector ? (
                  <span
                    className="hidden sm:inline-flex items-center px-2 h-[20px] rounded-md text-[10.5px] font-bold shrink-0"
                    style={{
                      background: "var(--bm-soft-100)",
                      color: "var(--bm-muted-strong)",
                    }}
                  >
                    {stock.sector}
                  </span>
                ) : null}
              </div>
              {displayAmt > 0 ? (
                <div
                  className="hidden sm:block text-[11px] mt-[1px] bm-num"
                  style={{ color: "var(--bm-muted)" }}
                >
                  거래대금 {fmtKR억(displayAmt)}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="text-right">
              <div className="flex items-baseline gap-1 sm:gap-1.5 justify-end whitespace-nowrap">
                <span
                  className="bm-num font-extrabold text-[16px] sm:text-[20px] leading-none tracking-tight"
                  style={{ color: trendColor }}
                >
                  {Math.round(displayPrice).toLocaleString("ko-KR")}
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 justify-end mt-0.5 sm:mt-1 whitespace-nowrap">
                <span
                  className="bm-num font-bold text-[11px] sm:text-[12px]"
                  style={{ color: trendColor }}
                >
                  {arrow} {Math.abs(Math.round(displayDiff)).toLocaleString("ko-KR")}
                </span>
                <PriceBadge pct={displayPct} bold size="sm" showArrow={false} />
              </div>
            </div>
            <div className="hidden sm:block">
              <AlertButton name={decoded} />
            </div>
          </div>
        </div>

        {/* Row 2: tabs */}
        <nav className="bm-tabs mt-2.5 sm:mt-3 -mx-3 sm:mx-0 px-3 sm:px-0" aria-label="종목 메뉴">
          {TABS.map((tab) => {
            const isActive = tab.key === active;
            const href = `/stock/${symbol}${tab.suffix}`;
            return (
              <Link
                key={tab.key}
                href={href}
                className="bm-tab"
                data-active={isActive}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
