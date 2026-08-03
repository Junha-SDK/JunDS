import Link from "next/link";
import {
  OPEN_PICKS,
  CLOSE_PICKS,
  limitHitsByTime,
  sortedPicks,
  type PickItem,
} from "./lib/marketSignals";
import { AppIcon } from "./AppIcon";

const STRENGTH_LABEL: Record<PickItem["strength"], string> = {
  high: "강",
  medium: "중",
  low: "약",
};

const STRENGTH_BG: Record<PickItem["strength"], string> = {
  high: "var(--bm-up)",
  medium: "var(--bm-yellow)",
  low: "var(--bm-soft-200)",
};

const STRENGTH_FG: Record<PickItem["strength"], string> = {
  high: "#ffffff",
  medium: "#0f172a",
  low: "var(--bm-muted)",
};

export function LimitHitsCard() {
  const hits = limitHitsByTime();
  const lockedClean = hits.filter((h) => h.lockedFirstAttempt).length;

  return (
    <article className="bm-card overflow-hidden">
      <header
        className="px-4 py-2.5 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--bm-border)" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span aria-hidden style={{ fontSize: 14 }}>
            🔥
          </span>
          <h3 className="font-extrabold text-[13.5px] truncate">상한가 잠금 (오늘)</h3>
        </div>
        <span
          className="text-[11px] font-bold shrink-0 whitespace-nowrap tabular-nums"
          style={{ color: "var(--bm-muted)" }}
        >
          {hits.length}종목 · 한 번에 잠금 {lockedClean}
        </span>
      </header>
      <ul>
        {hits.map((hit, i) => (
          <li
            key={hit.name}
            className="px-4 py-2.5 flex items-start justify-between gap-3"
            style={{
              borderTop: i === 0 ? undefined : "1px solid var(--bm-border)",
            }}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  href={`/stock/${encodeURIComponent(hit.name)}`}
                  className="font-extrabold text-[13.5px] truncate rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--bm-accent-strong)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bm-card)]"
                >
                  {hit.name}
                </Link>
                <LockedTimePill at={hit.lockedAt} clean={hit.lockedFirstAttempt} />
              </div>
              <div className="text-[11px] mt-0.5 truncate" style={{ color: "var(--bm-muted)" }}>
                {hit.catalyst}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div
                className="bm-num font-extrabold text-[13.5px]"
                style={{ color: "var(--bm-up)" }}
              >
                +{hit.pct.toFixed(2)}%
              </div>
              <div
                className="bm-num text-[10.5px] font-bold mt-0.5"
                style={{ color: "var(--bm-muted)" }}
              >
                {hit.amount억.toLocaleString("ko-KR")}억
              </div>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

function LockedTimePill({ at, clean }: { at: string; clean: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bm-num"
      style={{
        background: clean ? "var(--bm-up-soft)" : "var(--bm-soft-100)",
        color: clean ? "var(--bm-up)" : "var(--bm-muted)",
        fontSize: 10.5,
        fontWeight: 800,
        padding: "1px 7px",
        border: clean
          ? "1px solid color-mix(in srgb, var(--bm-up) 35%, transparent)"
          : "1px solid var(--bm-border)",
      }}
      title={clean ? "한 번에 잠김" : "잠겼다 풀린 뒤 재진입"}
    >
      <AppIcon name="lock" size={9} strokeWidth={2.6} />
      {at}
    </span>
  );
}

export function OpenPicksCard() {
  return <PicksCard title="내일 시초가 강세" emoji="🌅" picks={OPEN_PICKS} kind="open" />;
}

export function ClosePicksCard() {
  return <PicksCard title="내일 종가 강세" emoji="🌇" picks={CLOSE_PICKS} kind="close" />;
}

function PicksCard({
  title,
  emoji,
  picks,
  kind,
}: {
  title: string;
  emoji: string;
  picks: PickItem[];
  kind: "open" | "close";
}) {
  const rows = sortedPicks(picks);
  const high = rows.filter((p) => p.strength === "high").length;

  return (
    <article className="bm-card overflow-hidden">
      <header
        className="px-4 py-2.5 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--bm-border)" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span aria-hidden style={{ fontSize: 14 }}>
            {emoji}
          </span>
          <h3 className="font-extrabold text-[13.5px] truncate">{title}</h3>
        </div>
        <span
          className="text-[11px] font-bold shrink-0 whitespace-nowrap tabular-nums"
          style={{ color: "var(--bm-muted)" }}
        >
          {rows.length}종목 · 강 {high}
        </span>
      </header>
      <ul>
        {rows.map((p, i) => (
          <li
            key={p.name}
            className="px-4 py-2.5 flex items-center gap-3"
            style={{
              borderTop: i === 0 ? undefined : "1px solid var(--bm-border)",
            }}
          >
            <StrengthBadge strength={p.strength} />
            <div className="min-w-0 flex-1">
              <Link
                href={`/stock/${encodeURIComponent(p.name)}`}
                className="font-extrabold text-[13.5px] block truncate rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--bm-accent-strong)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bm-card)]"
              >
                {p.name}
              </Link>
              <div className="text-[11px] mt-0.5 truncate" style={{ color: "var(--bm-muted)" }}>
                {p.reason}
              </div>
            </div>
            <div
              className="bm-num font-extrabold text-[13.5px] shrink-0"
              style={{ color: "var(--bm-up)" }}
            >
              +{p.expectedPct.toFixed(1)}%
            </div>
          </li>
        ))}
      </ul>
      <footer
        className="px-4 py-2 text-[10.5px]"
        style={{
          borderTop: "1px solid var(--bm-border)",
          color: "var(--bm-muted)",
          background: "var(--bm-soft-100)",
        }}
      >
        {kind === "open"
          ? "장 마감 후 발표된 모멘텀·공시 기반 시그널"
          : "장중 외국인·기관 매수 패턴 기반 시그널"}
      </footer>
    </article>
  );
}

function StrengthBadge({ strength }: { strength: PickItem["strength"] }) {
  return (
    <span
      className="shrink-0 inline-flex items-center justify-center rounded-md"
      style={{
        width: 22,
        height: 22,
        background: STRENGTH_BG[strength],
        color: STRENGTH_FG[strength],
        fontWeight: 800,
        fontSize: 10.5,
        border: strength === "low" ? "1px solid var(--bm-border)" : "none",
      }}
      title={`신호 강도: ${STRENGTH_LABEL[strength]}`}
    >
      {STRENGTH_LABEL[strength]}
    </span>
  );
}
