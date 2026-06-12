"use client";

import { useEffect, useState } from "react";
import { useLivePrice } from "./lib/livePrices";
import { useMarketStatus } from "./lib/useMarketStatus";

interface LivePriceProps {
  name: string;
  decimals?: number;
  size?: "sm" | "md" | "lg";
  showFlash?: boolean;
}

export function LivePrice({ name, decimals = 0, size = "md", showFlash = true }: LivePriceProps) {
  const { price, trend } = useLivePrice(name);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (!showFlash) return;
    if (trend === "up" || trend === "down") {
      setFlash(trend);
      const t = setTimeout(() => setFlash(null), 600);
      return () => clearTimeout(t);
    }
  }, [trend, price, showFlash]);

  const fontSize = size === "lg" ? 18 : size === "sm" ? 12 : 14;

  return (
    <span
      className="bm-num font-extrabold inline-flex items-center gap-1"
      style={{
        fontSize,
        color: "var(--bm-up)",
        background:
          flash === "up"
            ? "var(--bm-up-flash)"
            : flash === "down"
              ? "var(--bm-down-flash)"
              : "transparent",
        padding: flash ? "1px 4px" : "0",
        borderRadius: 4,
        transition: "background-color .35s ease",
      }}
    >
      {price > 0
        ? price.toLocaleString("ko-KR", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        : "—"}
    </span>
  );
}

export function LivePctBadge({ name }: { name: string }) {
  const { change } = useLivePrice(name);
  const up = change > 0;
  const flat = Math.abs(change) < 0.005;
  const color = up ? "var(--bm-up)" : flat ? "var(--bm-muted)" : "var(--bm-down)";
  return (
    <span
      className="bm-num font-bold"
      style={{ color, fontSize: 12 }}
    >
      {up ? "+" : ""}
      {change.toFixed(2)}%
    </span>
  );
}

export function LiveStatusDot() {
  const status = useMarketStatus();
  const [pulse, setPulse] = useState(true);
  // NXT 프리/애프터도 라이브로 취급.
  const isLive = status === "장중" || status === "프리장" || status === "애프터장";
  useEffect(() => {
    if (!isLive) return;
    const id = setInterval(() => setPulse((p) => !p), 800);
    return () => clearInterval(id);
  }, [isLive]);

  if (!isLive) {
    const label = status === "휴장" ? "휴장" : "장마감";
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold">
        <span
          aria-hidden
          className="size-2 rounded-full"
          style={{ background: "var(--bm-muted)" }}
        />
        <span style={{ color: "var(--bm-muted)" }}>{label}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold">
      <span
        aria-hidden
        className="size-2 rounded-full"
        style={{
          background: "var(--bm-live-bright)",
          boxShadow: pulse
            ? "0 0 0 4px var(--bm-live-glow)"
            : "0 0 0 0 transparent",
          transition: "box-shadow .8s ease",
        }}
      />
      <span style={{ color: "var(--bm-live)" }}>실시간</span>
    </span>
  );
}
