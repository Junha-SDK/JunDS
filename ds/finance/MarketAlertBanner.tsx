"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppIcon } from "./AppIcon";
import { fmtSignedPct } from "./lib/format";
import { HEATMAP_FLAT } from "./lib/heatmapData";
import { useLivePrices } from "./lib/livePrices";

interface MarketAlertBannerProps {
  /** 수동 오버라이드 — 지정 시 자동 픽 무시 */
  symbol?: string;
  pct?: number;
}

/**
 * 마켓 알림 배너 — 현재 시점 KIS 시드된 가격 기준 **상승률 1위 종목**을 자동 표출.
 * 더 이상 하드코딩된 SK스퀘어가 아니라 실시간 1위가 노출된다.
 */
export function MarketAlertBanner({ symbol, pct }: MarketAlertBannerProps = {}) {
  const allNames = useMemo(() => HEATMAP_FLAT.map((c) => c.name), []);
  const liveMap = useLivePrices(allNames);

  // 라이브 데이터 기반 상승률 1위 자동 선정 (override가 없을 때)
  const auto = useMemo(() => {
    if (symbol) return null;
    let best: { name: string; pct: number } | null = null;
    for (const name of allNames) {
      const t = liveMap[name];
      if (!t || t.price <= 0) continue;
      if (!best || t.change > best.pct) {
        best = { name, pct: t.change };
      }
    }
    return best;
  }, [allNames, liveMap, symbol]);

  const displaySymbol = symbol ?? auto?.name ?? "—";
  const displayPct = pct ?? auto?.pct ?? 0;
  const time = useTime();
  const up = displayPct >= 0;
  const headline = autoHeadline(displayPct);
  const href = `/stock/${encodeURIComponent(displaySymbol)}`;

  return (
    <Link
      href={href}
      className={[
        "group block rounded-xl overflow-hidden transition-shadow",
        // 한 겹 그림자로는 카드 위에서 떠 보이지 않는다 — 가까운/먼 그림자를 겹친다.
        "hover:shadow-[0_12px_28px_-14px_rgba(15,23,42,0.28),0_4px_10px_-6px_rgba(15,23,42,0.16)]",
        "focus-visible:outline-2 focus-visible:outline-[color:var(--bm-accent)] focus-visible:outline-offset-2",
      ].join(" ")}
      style={{
        background: "var(--bm-card)",
        border: "1px solid var(--bm-border)",
      }}
    >
      <div className="px-3.5 py-2.5 flex items-center gap-2.5">
        <span
          aria-hidden
          className="grid place-items-center size-7 rounded-full shrink-0"
          style={{
            background: "var(--bm-warning)",
            color: "white",
          }}
        >
          <AppIcon name="flame" size={14} strokeWidth={2.4} />
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="bm-num font-extrabold text-[11.5px] px-1.5 py-0.5 rounded tabular-nums whitespace-nowrap"
              style={{
                background: "var(--bm-warning-bg)",
                color: "color-mix(in srgb, var(--bm-warning) 55%, var(--bm-text))",
              }}
            >
              {time}
            </span>
            <span
              className="font-extrabold text-[11.5px]"
              style={{ color: "color-mix(in srgb, var(--bm-warning) 55%, var(--bm-text))" }}
            >
              실시간 상승률 1위
            </span>
          </div>
          <p
            className="text-[12.5px] font-bold mt-0.5 leading-snug truncate"
            style={{ color: "var(--bm-text)" }}
          >
            <span className="font-extrabold">{displaySymbol}</span>
            <span className="mx-1" style={{ color: "var(--bm-muted)" }}>
              ·
            </span>
            {headline}
          </p>
        </div>

        <span
          className="bm-num font-extrabold text-[12.5px] px-2 py-1 rounded-md shrink-0 inline-flex items-center gap-0.5"
          style={{
            background: up ? "var(--bm-up-soft)" : "var(--bm-down-soft)",
            color: up ? "var(--bm-up)" : "var(--bm-down)",
          }}
        >
          {up ? "▲" : "▼"} {fmtSignedPct(displayPct, 1)}
        </span>
      </div>
    </Link>
  );
}

function autoHeadline(pct: number): string {
  if (pct >= 25) return "상한가 근접 — 거래 폭주";
  if (pct >= 15) return "급등세 지속";
  if (pct >= 8) return "강한 매수세 진입";
  if (pct >= 3) return "상승세";
  if (pct > 0) return "소폭 상승";
  if (pct > -3) return "보합권";
  if (pct > -8) return "하락세";
  return "급락 — 손절선 점검 필요";
}

/**
 * 렌더 단계에서 `new Date()` 를 부르면 서버가 그린 시각과 브라우저가 그린 시각이 달라
 * 하이드레이션이 어긋난다. 마운트 후에 채우고, 분이 바뀌면 따라가게 둔다.
 */
function useTime(): string {
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(
        `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
      );
    };
    tick();
    const id = window.setInterval(tick, 20_000);
    return () => window.clearInterval(id);
  }, []);

  return time;
}
